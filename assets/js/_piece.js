const piece = {
    x: null,
    y: null,
    id: null,

    /*
        new(id)
        sets up a new piece
        TODO: if id is not defined, select randomly based on level cycle
    */
    new: function(id) {

        if(id === undefined) {
            this.id = state.getNextPiece();
        } else {
            this.id = id;
        }

        if(this.x == null || this.y == null) {
            this.x = Math.round(conf.tilesX / 2);
            this.y = Math.round(conf.tilesY / 2);
        }

        dom.current.innerHTML = this.createPieceHTML(this.id);
        this.updatePosition();

    },

    /*
        updatePosition()
        set correct position on the current piece container
    */
    updatePosition: function() {
        // needs to adjust for 5 + 2 px offset
        // TODO improve logic
        dom.current.style["left"] = this.x * state.tileSize + 7 + "px";
        dom.current.style["top"] = this.y * state.tileSize + 7 + "px";
    },

    /*
        createPieceHTML(id)
        create the markup for a given piece, as defined in def.p
    */
    createPieceHTML: function(id) {
        let str = '';
        for(let a in def.p[id]) {
            let pp = def.p[id][a];
            str += `<p class="p${pp.id} x${pp.x} y${pp.y}"></p>`;
        }
        return str;
    },

    /*
        rotate()
        rotate the current piece, according to def.r[id]
    */
    rotate: function() {
        this.new(def.r[this.id]);
    },

    /*
        moveTo(vpX, vpY)
        move the origo of the piece to the board coordinates
        that are closest to viewportX,viewportY
        update the position only if the coordinates have changed
    */
    moveTo(vpX, vpY) {

        // TODO precalc this. No need to calc each time
        let boardLeft = state.ratioLeft + conf.borderDX;
        let boardTop = state.ratioTop + conf.borderDX;

        let px = Math.min(
            conf.tilesX-1, Math.max(
                0, Math.floor((vpX - boardLeft) / state.tileSize)));
        let py = Math.min(
            conf.tilesY-1, Math.max(
                0, Math.floor((vpY - boardTop) / state.tileSize)));

        /*
            this is a simplified way of doing this:

            let boardWidth = conf.tilesX * state.tileSize;
            let boardHeight = conf.tilesY * state.tileSize;

            if(x < boardLeft) {
                // left side of the board
                px = 0;
            } else if(x > boardLeft + boardWidth) {
                // right side of the board
                px = conf.tilesX - 1;
            } else {
                // calc
                px = Math.floor((x - boardLeft) / state.tileSize);
            }

            if(y < boardTop) {
                // above the board            
                py = 0;
            } else if (y > boardTop + boardHeight) {
                // below the board
                py = conf.tilesY - 1;
            } else {
                // calc
                py = Math.floor((y - boardTop) / state.tileSize);
            }
        */

        if(this.x !== px || this.y !== py) {
            this.x = px;
            this.y = py;
            piece.updatePosition();
        }
    },

    /*
        drop()
        drop the piece on the board if allowed
    */
    drop: function() {

        if(this.isDroppable()) {

            // TODO temporarily set game on pause
            dom.current.innerHTML = "";
            for(let i in def.p[this.id]) {
                let pp = def.p[this.id][i];
                let nx = this.x + pp.x;
                let ny = this.y + pp.y;
                board.plot(pp.id, nx, ny);
            }
            if(!this.handleLoop()) {
                // log("no loop yet");
                // no loop
                // TODO turn off pause to resume game
                this.new();
            }
        } else {
            // TODO visualize wrong move
        }
    },

    /*
        isDroppable()
        checks if the current piece can be dropped on the board
        returns true unless
            - a piece primitive is outside the board
            - the location on the board is occupied by a piece primnitive
            - a piece primitive along the borders faces out of the board
        returns false as soon as possible
    */
    isDroppable: function() {
        for(let i in def.p[this.id]) {
            let pp = def.p[this.id][i];
            let px = this.x + pp.x;
            let py = this.y + pp.y;

            // is piece primitive outside the board?
            if (px < 0 || px >= conf.tilesX || py < 0 || py >= conf.tilesY) {
                return false;
            }

            // is the seat taken?
            if (board.b[py][px] !== def.space) {
                return false;
            }

            // is piece primitive open and facing the border?
            if(
                (px == 0 && def.ol[pp.id]) ||
                (py == 0 && def.ot[pp.id]) ||
                (px == conf.tilesX-1 && def.or[pp.id]) ||
                (py == conf.tilesY-1 && def.ob[pp.id])) {
                // man, lookup tables <3
                return false;
            }
        }

        return true;
    },

    /*
        handleLoop()
        determines if the current piece (placed on the board)
        resulted in a complete loop
        returns false if not, resuming normal flow

        however if a loop is detected a lot of things will happen
    */
    handleLoop: function() {

        /*
            overview of algorithm:

            isLoop = false;

            get an exit direction (for instance "LEFT")
            dir = def.exit[pp][0] (contains 2 directions)

            go in that direction
            x = ox + dir.dx
            y = oy + dir.dy
            pp = board[y][x]

            while pp is pp AND pp is open in opposite direction ("RIGHT")
                dir = direction other than opposite_direction
                go in that direction
                x += dx
                y += dx
                pp = board[y][x]

                if x y is origo
                    isLoop = true
                    break
        */

        // we'll see about that
        let isLoop = false;
        let loop = [];

        // start/end coordinate
        let ox = this.x;
        let oy = this.y;
        let pp = board.b[oy][ox];

        // log(`start: ${ox},${oy}`);

        // get an exit direction
        let exit = def.exit[pp][0]; // for instance "left"

        // go in that direction
        let x = ox + def.dir[exit].dx;
        let y = oy + def.dir[exit].dy;
        pp = board.b[y][x];
        let inv = def.dir[exit].inv;
        loop.push({x:x,y:y});
        //log(`go ${exit} to ${x},${y} pp:${pp} looking ${inv}`);

        while(pp !== def.space &&
            (def.exit[pp][0] == inv || def.exit[pp][1] == inv)) {

            // determine new direction. Must be different from inv
            if(def.exit[pp][0] !== inv) {
                exit = def.exit[pp][0];
            } else {
                exit = def.exit[pp][1];
            }

            // go in that direction
            x += def.dir[exit].dx;
            y += def.dir[exit].dy;
            pp = board.b[y][x];
            inv = def.dir[exit].inv;
            loop.push({x:x,y:y});

            // log(`go ${exit} to ${x},${y} pp:${pp} looking ${inv}`);

            if (x == ox && y == oy) {
                isLoop = true;
                //log("LOOP!");
                break;
            }
        }

        if(!isLoop) {
            return false;
        }

        /*
        // dev fill with white
        let els = [];
        for(let i in loop) {
            els.push(dom.tiles[loop[i].y * conf.tilesX + loop[i].x]);
        }
        for(let i in els) {
            els[i].addClass("loop");
        }

        setTimeout(function(){
            // remove stuff
            for(let i in loop) {
                board.unplot(loop[i].x,loop[i].y);
            }

            this.new();
        }.bind(this), 1000);
        */

        // TODO the remaining operations inbetween transitions

        // inc number of loopz + visual update
        state.loopz++;
        dom.updateLoopz();

        log("loop with " + loop.length + " tiles");

        // remove stuff
        for(let i in loop) {
            board.unplot(loop[i].x,loop[i].y);
        }

        this.new();

        return true;

    }
};
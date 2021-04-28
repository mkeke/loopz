const piece = {
    x: null,
    y: null,
    id: null,

    /*
        new(id, x, y)
        sets up a new piece
        TODO: if id is not defined, select randomly based on level cycle
        TODO: if coordinates are not defined, place piece at cursor pos
    */
    new: function(id, x, y) {

        if(id === undefined) {
            this.id = this.getNewPiece();
        } else {
            this.id = id;
        }

        if(x !== undefined && y !== undefined) {
            this.x = x;
            this.y = y;
        } else {
            // TODO obtain cursor coordinates
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
        this.new(def.r[this.id], this.x, this.y);
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
            for(let i in def.p[this.id]) {
                let pp = def.p[this.id][i];
                let nx = this.x + pp.x;
                let ny = this.y + pp.y;
                board.plot(pp.id, nx, ny);
            }
            this.new();
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

    getNewPiece: function() {
        // TODO move to state
        // TODO implement alternating random window
        return Math.floor(Math.random()*(def.p.length-1)) + 1;
    },
};
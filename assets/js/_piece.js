const piece = {
    x: null,
    y: null,
    id: null,

    /*
        new(id)
        sets up a new piece
        TODO: if id is not defined, select randomly based on level cycle
    */
    new: function(id=null, rotate=false) {

        /*
            if pieceTime > limit
                piece is eraser
            else
                stuff

            create piece html
            time stuff
        */

        if(rotate == false && state.eraserTime > conf.eraserTimeLimit * 1000 / conf.rafDelay) {
            log("eraser time");
            this.id = def.eraser;
        } else {
            // log("new piece " + id)

            if(id === null) {
                this.id = state.getNextPiece();
            } else {
                this.id = id;
            }

            if(this.x == null || this.y == null) {
                this.x = Math.round(conf.tilesX / 2);
                this.y = Math.round(conf.tilesY / 2);
            }
        }

        dom.current.innerHTML = this.createPieceHTML(this.id);
        this.updatePosition();

        if(rotate == false) {
            // piece has not been rotated. Reset time
            state.time = 100;
        }

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

        if(id == def.eraser) {
            str = `<p class="pe x0 y0"></p>`;
        } else {
            for(let a in def.p[id]) {
                let pp = def.p[id][a];
                str += `<p class="p${pp.id} x${pp.x} y${pp.y}"></p>`;
            }
        }
        return str;
    },

    /*
        rotate()
        rotate the current piece, according to def.r[id]
    */
    rotate: function() {
        // rotate to a specific piece, flag as rotate
        // if piece is eraser, no need to rotate
        if(this.id != def.eraser) {
            this.new(def.r[this.id], true);
        }
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

        // TODO if eraser
        //     if place is occupied
        if(this.id == def.eraser) {
            if(board.b[this.y][this.x] !== def.space) {

                // something to erase!!

                // find continuous pieces in both directions
                let pp = board.b[this.y][this.x];
                let dir = def.exit[pp];
                let arr = board.getConnectedPieces(this.x,this.y,dir[0]);
                let arr2 = board.getConnectedPieces(this.x,this.y,dir[1]);
                arr2.shift();

                for(let i in arr) {
                    board.unplot(arr[i].x,arr[i].y);
                    state.tileCount--;
                }
                for(let i in arr2) {
                    board.unplot(arr2[i].x,arr2[i].y);
                    state.tileCount--;
                }

                state.decEraserTime(false);
                this.new();
            }

        } else if(this.isDroppable()) {

            // temporarily set game on pause
            state.pause = true;
            // remove current piece
            dom.current.innerHTML = "";

            for(let i in def.p[this.id]) {
                let pp = def.p[this.id][i];
                let nx = this.x + pp.x;
                let ny = this.y + pp.y;
                board.plot(pp.id, nx, ny);
                state.tileCount ++;
            }
            // TODO move handleLoop/isLoop to board
            if(!this.handleLoop()) {
                // no loop
                // turn off pause to resume game
                state.pause = false;
                this.new();
            }
        } else {
            // visualize wrong move
            state.eventChain = [
                { func: dom.borderFlashUp.bind(this), ev: state.trend, el: dom.boardWrapper },
                { func: dom.borderFlashDown.bind(this) }
            ];
            master.initEventChain();
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

        if (!board.isLoop(this.x, this.y)) {
            return false;
        }

        // loop is detected and stored in board.loop
        log("loop with " + board.loop.length + " tiles");

        state.eventChain = [
            { ev: "time", ms: 100 },
            { func: this.flashLoop.bind(this), ev: state.trend, el: dom.tiles[board.loop[0].y*conf.tilesX + board.loop[0].x] },
            { func: this.removeLoop.bind(this), ev: "time", ms: 300 },
            { func: this.resumeAfterLoop.bind(this) },
        ];
        master.initEventChain();

        return true;
    },

    flashLoop: function() {
        for(let i in board.loop) {
            let x = board.loop[i].x;
            let y = board.loop[i].y;

            dom.tiles[y*conf.tilesX + x].addClass("loop");
        }
    },

    removeLoop: function() {
        for(let i in board.loop) {
            board.unplot(board.loop[i].x,board.loop[i].y);
            state.tileCount--;
        }

        // calc score
        state.incScore("loop", board.loop.length);
        dom.updateScore();

        // inc number of loopz + visual update
        state.loopz++;
        dom.updateLoopz();
        if(state.loopz % conf.newLifeLoop == 0) {
            state.lives++;
            dom.updateLives();
        }

        // maintain today's best
        state.maxLoopz = Math.max(state.maxLoopz, state.loopz);
        state.maxSize = Math.max(state.maxSize, board.loop.length);

        // prolong the time for eraser to appear
        state.decEraserTime();

        // if board is empty: add bonus
        if(state.tileCount == 0) {
            state.incScore("bonus");
            dom.updateScore();
        }

    },

    resumeAfterLoop: function() {
        this.new();
        state.pause = false;
    },
};
const piece = {
    x: null,
    y: null,
    id: null,

    /*
        new(id)
        sets up a new piece
        TODO: if id is not defined, select randomly based on level cycle
        if new piece is a result of rotation, then don't reset the time
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
            // eraser time
            this.id = def.eraser;
        } else {
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
        // needs to adjust for the innser offset of the tiles container
        dom.current.style["left"] = this.x * state.tileSize + conf.borderInnerOffset + "px";
        dom.current.style["top"] = this.y * state.tileSize + conf.borderInnerOffset + "px";
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
            the above is a simplified way of doing this:

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

        if(this.id == def.eraser) {
            // eraser cannot be used on empty tile
            if(board.b[this.y][this.x] !== def.space) {
                board.erase(this.x, this.y);
                state.decEraserTime(false);
                this.new();
            }

        } else if(this.isDroppable()) {

            // temporarily set game on pause and hide piece
            state.pause = true;
            dom.hideCurrentPiece();

            // plot piece on board
            for(let i in def.p[this.id]) {
                let pp = def.p[this.id][i];
                let nx = this.x + pp.x;
                let ny = this.y + pp.y;
                board.plot(pp.id, nx, ny);
                state.tileCount ++;
            }

            if(!board.handleLoop(this.x, this.y)) {
                // resume game
                state.pause = false;
                this.new();
            }
        } else {
            // visualize wrong move
            state.eventChain = [
                { func: dom.showWrongMove.bind(this), ev: state.trend, el: dom.boardWrapper },
                { func: dom.hideWrongMove.bind(this) }
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

};
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
            // TODO get random piece
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

        // TODO only if game on or not paused

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
    }


};
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

        log("piece request: " + id);
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
        log("requested id " + id)
        let str = '';
        for(let a in def.p[id]) {
            let pp = def.p[id][a];
            str += `<p class="p${pp.id} x${pp.x} y${pp.y}"></p>`;
        }
        log(str);
        return str;
    },


};
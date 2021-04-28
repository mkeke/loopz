const board = {

    // internal representation of the board
    /*
    */
    b: [],

    init: function() {
        // fill internal board with space
        this.b = [];
        for(let y=0; y<conf.tilesY; y++) {
            this.b.push([]);
            for(let x=0; x<conf.tilesX; x++) {
                this.b[y].push(def.space);
            }
        }

        // generate HTML
        let str = '<p></p>'.repeat(conf.tilesX*conf.tilesY);
        dom.board.innerHTML = str;

        // update dom reference to tiles
        dom.tiles = dom.board.find("p");

    },

    /*
        plot(id, x, y)
        plots a certain piece primitive id at the desired position
        on the board. both internally and visually
    */
    plot: function(id, x, y) {
        this.b[y][x] = id;
        dom.tiles[y*conf.tilesX + x].addClass("p"+id);
    },

    /*
        unplot(x,y)
        clear the board at a specific coordinate
    */
    unplot: function(x, y) {
        this.b[y][x] = def.space;
        dom.tiles[y*conf.tilesX + x].className="";
    },

}
const board = {

    // internal representation of the board
    /*
    */
    b: [],

    init: function() {
        this.clear();

        // generate HTML
        let str = '<p></p>'.repeat(conf.tilesX*conf.tilesY);
        dom.board.innerHTML = str;

        // update dom reference to tiles
        dom.tiles = dom.board.find("p");

    },

    clear: function() {
        // fill internal board with space
        this.b = [];
        for(let y=0; y<conf.tilesY; y++) {
            this.b.push([]);
            for(let x=0; x<conf.tilesX; x++) {
                this.b[y].push(def.space);
            }
        }
    },

    /*
        getLoop(x, y)
        get the coordinates for the loop at x,y
        return array of coordinates
        or false if there is no loop
    */
    getLoop: function(x, y) {
        // collect pieces in one of the exit directions
        let pp = this.b[y][x];

        let arr = this.getConnectedPieces(x, y, def.exit[pp][0]);
        let last = arr.pop();
        if(arr.length > 3 && last.x == x && last.y == y) {
            // u got urself a loop there, pardner
            log("LOOP");
            return arr;
        } else {
            log("no loop");
            return false;
        }
    },

    /*
        getConnectedPieces(x, y, dir)
        get array of connected pieces from given location
        and in the specified direction
    */
    getConnectedPieces(x, y, dir) {
        // collect connected pieces until end or back to start
        let arr = [];
        let nx = x;
        let ny = y;
        let inv = false;
        let pp;

        do {
            // add coordinate to array
            arr.push({x:nx,y:ny});

            // prepare next piece

            // determine direction
            if(inv !== false) {
                // dir must be opposite from inv
                dir = def.exit[pp][0];
                if (dir == inv) {
                    dir = def.exit[pp][1];
                }
            }
            // go in the desired direction
            nx += def.dir[dir].dx;
            ny += def.dir[dir].dy;
            // find opposite direction
            inv = def.dir[dir].inv;

            // find piece primitive id at next pos
            pp = this.b[ny][nx];

            // get direction to continue
        } while(pp !== def.space && def.isOpen[pp][inv] && (nx !== x || ny !== y));

        if (pp !== def.space && def.isOpen[pp][inv] && nx == x && ny == y) {
            arr.push({x:nx,y:ny});
        }

        return arr;
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
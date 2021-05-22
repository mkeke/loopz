const board = {

    // internal representation of the board
    /*
    */
    b: [],
    loop: [],

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
        handleLoop()

        if the given coordinates are part of a complete loop
        set up event chain to remove it, update score etc
        before resuming the game.
    */
    handleLoop: function(x, y) {
        if(!this.isLoop(x,y)) {
            return false;
        }

        // loop is detected and stored in board.loop
        log("loop with " + board.loop.length + " tiles");
        log("tileCount: " + state.tileCount);

        let startEl = dom.tiles[this.loop[0].y*conf.tilesX + this.loop[0].x];

        eventChain.new([
            { ev: "time", ms: 50 },
            { func: this.flashLoop.bind(this), ev: state.trend, el: startEl },
            { func: this.removeLoop.bind(this), ev: "time", ms: 1000 },
        ]);
        if(this.loop.length == state.tileCount) {
            eventChain.add(
                { func: this.addClearBonus.bind(this), ev: "time", ms: 1000 }
            );
        }
        eventChain.add(
            { func: this.resumeAfterLoop.bind(this) }
        );

        eventChain.run();

        return true;
    },

    /*
        flashLoop()
        add classname "loop" to all the tiles in the current loop
    */
    flashLoop: function() {
        for(let i in this.loop) {
            let x = this.loop[i].x;
            let y = this.loop[i].y;

            dom.tiles[y*conf.tilesX + x].addClass("loop");
        }
    },

    /*
        removeLoop()
        remove the loop from the board (internally and visually)
        update score, number of loopz, today's best
    */
    removeLoop: function() {
        for(let i in this.loop) {
            this.unplot(this.loop[i].x,this.loop[i].y);
            state.tileCount--;
        }

        // calc score
        state.incScore("loop", this.loop.length);
        dom.updateScore();

        // inc number of loopz + visual update
        state.incLoopz();

        state.checkSize(this.loop.length);

        // prolong the time for eraser to appear
        state.decEraserTime();

        // clear internal loop
        this.loop = [];
    },

    addClearBonus: function() {
        // if board is empty: add bonus
        if(state.tileCount == 0) {
            state.incScore("bonus");
            dom.updateScore();
        }
    },

    resumeAfterLoop: function() {
        piece.new();
        state.pause = false;
    },

    /*
        getLoop(x, y)
        get the coordinates for the loop at x,y
        return true if loop, false if not
        the loop is stored in this.loop
    */
    isLoop: function(x, y) {
        // collect pieces in one of the exit directions
        let pp = this.b[y][x];

        let arr = this.getConnectedPieces(x, y, def.exit[pp][0]);
        let last = arr.pop();
        if(arr.length > 3 && last.x == x && last.y == y) {
            // u got urself a loop there, pardner
            this.loop = arr;
            return true;
        } else {
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

    /*
        erase(x, y)
        erase continuous pieces from given location
        update score acording to number of tiles removed
    */
    erase: function(x, y) {


        // find continuous pieces in both directions
        let pp = this.b[y][x];
        let dir = def.exit[pp];
        let arr = this.getConnectedPieces(x,y,dir[0]);
        let arr2 = this.getConnectedPieces(x,y,dir[1]);
        arr2.shift();

        let size = arr.length + arr2.length;

        for(let i in arr) {
            this.unplot(arr[i].x,arr[i].y);
            state.tileCount--;
        }
        for(let i in arr2) {
            this.unplot(arr2[i].x,arr2[i].y);
            state.tileCount--;
        }

        state.incScore("rest", size);
        dom.updateScore();
    },

    prepareRemoveSnakes: function() {

        eventChain.new([
            { ev: "time", ms: 1000 },
        ]);

        // find occurrence of snake
        this.snakeX = 0;
        this.snakeY = 0;
        if(this.hasSnake()) {
            eventChain.add(
                { func: this.removeSnake.bind(this), ev: "time", ms: 500 }
            );
        } else {
            eventChain.add(
                { func: this.animateGameOver.bind(this), ev: state.anend, el: dom.timeWrapper }
            );
            eventChain.add(
                { ev: "time", ms: 2000 }
            );
            eventChain.add(
                { func: this.showIntro.bind(this) }
            );
        }

        eventChain.run();
    },

    animateGameOver: function() {
        dom.timeWrapper.addClass("gameover");
    },

    showIntro: function() {
        state.gameOn = false;
        dom.parent.removeClass("gameon");
    },

    removeSnake: function() {
        // remove the snake starting from this.snakeX this.snakeY
        // update score
        this.erase(this.snakeX, this.snakeY);

        // search for more snakes
        // update eventChain
        if(this.hasSnake()) {
            eventChain.add(
                { func: this.removeSnake.bind(this), ev: "time", ms: 500 }
            );
        } else {
            eventChain.add(
                { func: this.animateGameOver.bind(this), ev: state.anend, el: dom.timeWrapper }
            );
            eventChain.add(
                { ev: "time", ms: 2000 }
            );
            eventChain.add(
                { func: this.showIntro.bind(this) }
            );
        }
    },

    hasSnake: function() {
        // searches the board for snakes, unifinished loopz
        // starts from [this.snakeX, this.snakeY]
        // returns true or false
        // if true, [this.snakeX, this.snakeY] is position of snake

        do {

            if(this.b[this.snakeY][this.snakeX] !== def.space) {
                return true;
            }

            if(++this.snakeX == conf.tilesX) {
                this.snakeX = 0;
                this.snakeY++;
            }
        } while(this.snakeY<conf.tilesY)

        return false;
    },

}
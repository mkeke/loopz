const dom = {
    runtimeStyle: null,
    parent: null,
    ratio: null,
    boardWrapper: null,
    board: null,
    tiles: null,
    current: null,
    start: null,

    loopz: null,
    timeWrapper: null,
    time: null,
    score: null,
    lives: null,

    init: function() {
        this.runtimeStyle = z("style.runtime");
        this.parent = z(".fullscreen");
        this.ratio = this.parent.find(".ratio");
        this.boardWrapper = this.parent.find("section.board");
        this.board = this.parent.find("section.board .tiles");
        this.current = this.parent.find(".piece");
        this.start = this.parent.find("button.start");

        this.loopz = this.parent.find(".loopz");
        this.timeWrapper = this.parent.find(".time");
        this.time = this.parent.find(".time div");
        this.score = this.parent.find(".score");
        this.lives = this.parent.find(".lives");

        // handle viewport size change
        this.handleResize();
        window.onresize = this.handleResize.bind(this);
    },

    /*
        createCharset(str)
        create charset html of string
    */
    createCharset: function(str) {
        // TODO charset
        return "" + str;
    },

    createNumber: function(str) {
        let arr = str.split("");
        arr = arr.map(function(a){ return `<span class="n${a}"></span>` });
        return arr.join("");
    },

    updateStats: function() {
        // update all the things
        this.updateLives();
        this.updateLoopz();
        this.updateTime();
        this.updateScore();
    },

    updateLoopz: function() {
        // 4 digits
        let str = "0".repeat(4 - (""+state.loopz).length);
        str += state.loopz;
        this.loopz.innerHTML = this.createNumber(str);
    },
    updateLives: function() {
        // 2 digits
        let str = "0".repeat(2 - (""+state.lives).length);
        str += state.lives;
        this.lives.innerHTML = this.createNumber(str);
    },
    updateTime: function() {
        this.time.style["width"] = state.time + "%";
    },
    updateScore: function() {
        // 6 digits
        let str = "0".repeat(6 - (""+state.score).length);
        str += state.score;
        this.score.innerHTML = this.createNumber(str);
    },
    updateBoard: function() {
        // unscramble board
        this.tiles.each(function(i, el){
            let y = Math.floor(i/conf.tilesX);
            let x = i%conf.tilesX;
            el.className = "p" + board.b[y][x];
        }.bind(this));
    },



    /*
        calculateSizes()
        The HTML elements cannot be completely responsive. This leads to
        decimals and rounded values, making it harder to calculate exact
        coordinates, and leading to glitches in positioning/overlapping.

        We need to calculate reliable integer values for each tile, and
        further determine the size and position of the ratio element and
        other sections.

        This is done at startup and whenever the viewport size is altered
    */
    calculateSizes: function() {

        let innerWidth = Math.min(conf.maxWidth, window.innerWidth);

        // attempt to determine tile size based on available screen width
        let tileSize = Math.floor(
            (innerWidth-conf.ratioWidthPx)/conf.ratioWidthTiles);

        // calculate width and height of ratio element based on tile size
        let ratioWidth = tileSize * conf.ratioWidthTiles + conf.ratioWidthPx;
        let ratioHeight = tileSize * conf.ratioHeightTiles + conf.ratioHeightPx;

        // if height is too much, use height as basis for size calc instead
        if(ratioHeight > window.innerHeight) {
            tileSize = Math.floor(
                (window.innerHeight-conf.ratioHeightPx)/conf.ratioHeightTiles);

            // calculate width and height
            ratioWidth = tileSize * conf.ratioWidthTiles + conf.ratioWidthPx;
            ratioHeight = tileSize * conf.ratioHeightTiles + conf.ratioHeightPx;
        }

        /*
            TODO
            if stats elements should be centered on top of its parent,
            then the tiles might need to be even numbers.
            check if spritemaps etc are blurry
        */

        // update state
        state.tileSize = tileSize;
        state.ratioWidth = ratioWidth;
        state.ratioHeight = ratioHeight;
        // ratio container is centered and near the top
        state.ratioLeft = Math.floor((window.innerWidth - state.ratioWidth) / 2);
        state.ratioTop = Math.floor((window.innerHeight - state.ratioHeight) / 4);

        log(`screen:${window.innerWidth}x${window.innerHeight} ratio:${state.ratioWidth}x${state.ratioHeight} tile:${tileSize}`);
    },

    /*
        updateRuntimeCSS()
        insert runtime CSS rules for misc sections of the game.
        This is generated at startup and whenever the viewport size is altered
    */
    updateRuntimeCSS: function() {
        let str = "";

        str += '.ratio{' +
                `width:${state.ratioWidth}px;` + 
                `height:${state.ratioHeight}px;` +
                `left:${state.ratioLeft}px;` +
                `top:${state.ratioTop}px;` +
                '}';

        str += '.tile, .tiles p{' +
                `width:${state.tileSize}px;` + 
                `height:${state.tileSize}px;` +
                '}';

        str += '.stats{' +
                `top:${conf.borderDX*2 + state.tileSize*conf.tilesY + state.tileSize*2}px;` +
                `height:${conf.borderDX*2 + state.tileSize}px;` +
                '}';

        str += '.skew{' +
                `width:${state.tileSize*3}px;` + 
                `height:${state.tileSize*3}px;` +
                '}';

        str += '.stats .top{' +
                `padding-bottom:${state.tileSize-10}px;` + 
                '}';

        str += '.num span{' +
                `width:${Math.floor(state.tileSize/2)}px;` + 
                `height:${Math.floor(state.tileSize)}px;` + 
                '}';

        this.runtimeStyle.innerHTML = str;
    },


    /*
        handleResize()
        handle viewport size change
    */
    handleResize: function() {
        this.calculateSizes();
        this.updateRuntimeCSS();
        piece.updatePosition();
    },

    /*
        hideCurrentPiece()
        clears the html for the current piece
    */
    hideCurrentPiece: function() {
        this.current.innerHTML = "";
    },

    // effect for wrong move: border flashes red
    showWrongMove: function() {
        dom.boardWrapper.addClass("wrongmove");
    },
    hideWrongMove: function() {
        dom.boardWrapper.removeClass("wrongmove");
    },
};
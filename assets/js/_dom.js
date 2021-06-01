const dom = {
    runtimeStyle: null,
    parent: null,
    touch: null,
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

    highscore: null,
    bestLoop: null,
    mostLoopz: null,

    charset: null,

    init: function() {
        this.runtimeStyle = z("style.runtime");
        this.parent = z(".fullscreen");
        this.touch = this.parent.find(".touch");
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

        this.highscore = this.parent.find(".highscore");
        this.bestLoop = this.parent.find(".bestloop");
        this.mostLoopz = this.parent.find(".mostloopz");

        this.charset = this.parent.find(".charset");

        // handle viewport size change
        this.handleResize();
        window.onresize = this.handleResize.bind(this);
    },

    /*
        applyCharset()
        apply charset to all elements
    */
    applyCharset: function() {
        this.charset.each(function(i, el) {
            let txt = el.innerHTML;
            el.innerHTML = this.createCharset(txt);
        }.bind(this));
    },

    /*
        createCharset(str)
        create charset html of string
    */
    createCharset: function(str) {

        str = str.split("").map(function(a){
            // specials
            switch(a) {
                case " ": a="spc";break;
                case "1": a="n1";break;
                case "2": a="n2";break;
                case "3": a="n3";break;
                case "4": a="n4";break;
                case "5": a="n5";break;
                case "6": a="n6";break;
                case "7": a="n7";break;
                case "8": a="n8";break;
                case "9": a="n9";break;
                case "0": a="n0";break;
            }
            return `<span class="${a}"></span>`;
        }).join("");

        return "" + str;
    },

    /*
        createNumber(str)
        create number charset from string
    */
    createNumber: function(str) {
        let arr = str.split("");
        arr = arr.map(function(a){ return `<span class="n${a}"></span>` });
        return arr.join("");
    },

    /*
        updateStats()
        update all the visual stats
    */
    updateStats: function() {
        this.updateLives();
        this.updateLoopz();
        this.updateTime();
        this.updateScore();
    },

    /*
        updateLoopz()
        update the number of loopz created
    */
    updateLoopz: function() {
        // 4 digits
        let str = "0".repeat(4 - (""+state.loopz).length);
        str += state.loopz;
        this.loopz.innerHTML = this.createNumber(str);
    },

    /*
        updateLives()
        update the number of lives left
    */
    updateLives: function() {
        // 2 digits
        let str = "0".repeat(2 - (""+state.lives).length);
        str += state.lives;
        this.lives.innerHTML = this.createNumber(str);
    },

    /*
        updateTime()
        update time bar
    */
    updateTime: function() {
        this.time.style["width"] = state.time + "%";
    },

    /*
        updateScore()
        update current score
    */
    updateScore: function() {
        // 6 digits
        let str = "0".repeat(6 - (""+state.score).length);
        str += state.score;
        this.score.innerHTML = this.createNumber(str);
    },

    /*
        updateBoard()
        show correct tiles on the board
    */
    updateBoard: function() {
        this.tiles.each(function(i, el){
            let y = Math.floor(i/conf.tilesX);
            let x = i%conf.tilesX;
            el.className = "p" + board.b[y][x];
        }.bind(this));
    },

    /*
        updateHighscore()
        put highscore in the correct container, using charset
    */
    updateHighscore: function() {
        this.highscore.innerHTML = this.createCharset(state.highscore + "    ");
    },

    /*
        updateMostLoopz()
        put number of loopz in the correct container, using charset
    */
    updateMostLoopz: function() {
        this.mostLoopz.innerHTML = this.createCharset(state.mostLoopz + "    ");
    },

    /*
        updateBestLoop()
        put largest loop in the correct container, using charset
    */
    updateBestLoop: function() {
        this.bestLoop.innerHTML = this.createCharset(state.bestLoop + "    ");
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

        let innerWidth = Math.min(conf.maxWidth, Math.max(conf.minWidth, window.innerWidth));

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

        // update state
        state.tileSize = tileSize;
        state.ratioWidth = ratioWidth;
        state.ratioHeight = ratioHeight;
        // ratio container is centered and near the top
        state.ratioLeft = Math.floor((window.innerWidth - state.ratioWidth) / 2);
        state.ratioTop = Math.floor((window.innerHeight - state.ratioHeight) / 4);

        state.boardLeft = state.ratioLeft + conf.borderDX;
        state.boardTop = state.ratioTop + conf.borderDX;

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

        // actual character ratio is 16:30,
        // but 16:32 centered will do juuust fine
        str += '.charset span{' +
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

    /*
        showWrongMove()
        effect for wrong move: border flashes red
    */
    showWrongMove: function() {
        dom.boardWrapper.addClass("wrongmove");
    },

    /*
        hideWrongMove()
        effect for wrong move: border flashes red
    */
    hideWrongMove: function() {
        dom.boardWrapper.removeClass("wrongmove");
    },
};

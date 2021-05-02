const dom = {
    runtimeStyle: null,
    parent: null,
    ratio: null,
    board: null,
    tiles: null,
    current: null,
    start: null,

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

    init: function() {
        this.runtimeStyle = z("style.runtime");
        this.parent = z(".fullscreen");
        this.ratio = this.parent.find(".ratio");
        this.board = this.parent.find("section.board .tiles");
        this.current = this.parent.find(".piece");
        this.start = this.parent.find("button.start");

        // this.tiles is updated on board.init()

        // handle viewport size change
        this.handleResize();
        window.onresize = this.handleResize.bind(this);
    }
};
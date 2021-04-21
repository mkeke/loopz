const dom = {
    runtimeStyle: null,
    parent: null,
    ratio: null,

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

        // attempt to determine tile size based on available screen width
        let tileSize = Math.floor(
            (window.innerWidth-conf.ratioWidthPx)/conf.ratioWidthTiles);

        // calculate width and height of ratio element based on tile size
        let ratioWidth = tileSize * conf.ratioWidthTiles + conf.ratioWidthPx;
        let ratioHeight = tileSize * conf.ratioHeightTiles + conf.ratioHeightPx;

        // if height is too much, use height as basis for size calc instead
        if(ratioHeight > window.innerHeight) {
            tileSize = Math.floor(
                (window.innerHeight-conf.ratioHeightPx)/conf.ratioHeightTiles);

            ratioWidth = tileSize * conf.ratioWidthTiles + conf.ratioWidthPx;
            ratioHeight = tileSize * conf.ratioHeightTiles + conf.ratioHeightPx;
        }

        // update state
        state.tileSize = tileSize;
        state.ratioWidth = ratioWidth;
        state.ratioHeight = ratioHeight;
        // ratio container is centered and near the top if possible
        state.ratioLeft = Math.floor((window.innerWidth - ratioWidth) / 2);
        state.ratioTop = Math.floor((window.innerHeight - ratioHeight) / 4);

        log(`screen:${window.innerWidth}x${window.innerHeight} ratio:${ratioWidth}x${ratioHeight} tile:${tileSize}`);
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

        str += '.tile{' +
                `width:${state.tileSize}px;` + 
                `height:${state.tileSize}px;` +
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
    },

    init: function() {
        this.runtimeStyle = z("style.runtime");
        this.parent = z(".fullscreen");
        this.ratio = this.parent.find(".ratio");

        // handle viewport size change
        this.handleResize();
        window.onresize = this.handleResize.bind(this);
    }
};
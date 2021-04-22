const master = {

    raf: null,

    init: function() {
        // determine the correct raf
        this.raf = (window.requestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.msRequestAnimationFrame).bind(window);

        log("hei");

        dom.init();
        state.init();

        // DEV generate tiles
        let str = '<p></p>'.repeat(conf.tilesX*conf.tilesY);
        z(".board .tiles").innerHTML = str;

        // get computed value for skew
        log(screen);
        log(window.innerWidth + " x " + window.innerHeight);
    },
};
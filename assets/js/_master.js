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
        let str = '<div></div>'.repeat(conf.tilesX*conf.tilesY);
        z(".tiles").innerHTML = str;
    },
};
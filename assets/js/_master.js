const master = {

    raf: null,

    init: function() {
        // determine the correct raf
        this.raf = (window.requestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.msRequestAnimationFrame).bind(window);

        dom.init();
        state.init();
        def.init();
        this.handleMouseEvents();

        state.newGame();
    },

    handleMouseEvents: function() {
        dom.parent.addEventListener("mousemove", function(e){
            e.preventDefault();
            let x = e.clientX;
            let y = e.clientY;
            piece.moveTo(x, y);
        }.bind(this));
    },
};
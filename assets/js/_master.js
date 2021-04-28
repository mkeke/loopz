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
        // TODO certain operations should only be triggered
        // if game is running and not paused

        // TODO certain operations should put the game on temporary pause
        // and turn pause off after transitions/animations are done

        dom.parent.addEventListener("mousemove", function(e){
            e.preventDefault();
            let x = e.clientX;
            let y = e.clientY;
            piece.moveTo(x, y);
        }.bind(this));

        dom.parent.addEventListener("contextmenu", function(e){
            e.preventDefault();
            piece.rotate();
        }.bind(this));

        dom.parent.addEventListener("click", function(e){
            e.preventDefault();
            piece.drop();
        }.bind(this));

    },
};
const master = {

    // raf: null,

    init: function() {
        /*
        // determine the correct raf
        this.raf = (window.requestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.msRequestAnimationFrame).bind(window);
        */

        dom.init();
        state.init();
        def.init();
        board.init();

        this.handleButtonClick();
        this.handleMouseEvents();
        this.handleKeyboardEvents();

        // skip start button click
        // state.newGame(2);
    },

    handleButtonClick: function() {
        dom.start.addEventListener("click", function(e){
            e.preventDefault();
            // prevent click from causing piece drop
            e.stopPropagation();

            let level = e.target.getAttribute("data-level");
            state.newGame(level);
        }.bind(this));
    },

    handleMouseEvents: function() {
        // TODO certain operations should only be triggered
        // if game is running and not paused

        // TODO certain operations should put the game on temporary pause
        // and turn pause off after transitions/animations are done

        dom.parent.addEventListener("mousemove", function(e){
            e.preventDefault();
            if(state.gameOn) {
                let x = e.clientX;
                let y = e.clientY;
                piece.moveTo(x, y);
            }
        }.bind(this));

        dom.parent.addEventListener("contextmenu", function(e){
            if(state.gameOn) {
                e.preventDefault();
                piece.rotate();
            }
        }.bind(this));

        dom.parent.addEventListener("click", function(e){
            if(state.gameOn) {
                e.preventDefault();
                piece.drop();
            }
        }.bind(this));

    },

    handleKeyboardEvents: function() {
        window.addEventListener("keydown", function(e){

            // handle first occurrence of key, ignore key repeat
            if(!e.repeat) {
                switch(e.keyCode) {
                    case def.keyP:
                        // toggle user pause on/off
                        state.toggleUserPause();
                        break;
                }
            }
        }.bind(this));
    },

};
const master = {

    // raf: null,

    init: function() {
        dom.init();
        state.init();
        def.init();
        board.init();

        this.handleButtonClick();
        this.handleMouseEvents();
        this.handleKeyboardEvents();
        dom.useCharset();

        // skip start button click
        // state.newGame(2);
    },

    handleButtonClick: function() {
        dom.start.addEventListener("click", function(e){
            e.preventDefault();
            // prevent click from causing piece drop
            e.stopPropagation();

            let level = e.target.getAttribute("data-level");
            log(e.target);
            log(level);
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
            e.preventDefault();
            if(state.gameOn && !state.pause && !state.userPause) {
                piece.rotate();
            }
        }.bind(this));

        dom.parent.addEventListener("click", function(e){
            if(state.gameOn && !state.pause && !state.userPause) {
                e.preventDefault();
                piece.drop();
            }
        }.bind(this));

    },

    handleKeyboardEvents: function() {
        window.addEventListener("keydown", function(e){
            // log(e.keyCode);
            // handle first occurrence of key, ignore key repeat
            if(!e.repeat) {
                switch(e.keyCode) {
                    case def.keyP:
                        // toggle user pause on/off
                        state.toggleUserPause();
                        break;

                    // dev hijack pieces                        
                    case def.key1:
                        piece.new(1);
                        break;
                    case def.key2:
                        piece.new(5);
                        break;
                    case def.keyE:
                        state.eraserTime = conf.eraserTimeLimit * 1001 / conf.rafDelay;
                        piece.new();
                        break;
                }
            }
        }.bind(this));
    },

};

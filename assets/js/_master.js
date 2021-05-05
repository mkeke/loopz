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
        board.init();

        this.handleButtonClick();
        this.handleMouseEvents();

        // prepare timer loop
        this.raf(this.timer.bind(this));

        // skip start button click
        // state.newGame(2);
    },

    timer: function() {
        let time = Date.now();

        if(time - state.raftime > conf.rafDelay) {
            state.raftime = time;
            if(state.gameOn && !state.pause) {
                state.time = Math.max(0, state.time - conf.timerSpeed[state.level])

                if(state.time == 0) {
                    if(--state.lives < 0) {
                        // game over
                        state.gameOn = false;
                    } else {
                        state.time = 100;
                        dom.updateLives();
                    }
                }
                
                dom.updateTime();
            }
        }

        this.raf(this.timer.bind(this));
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
};
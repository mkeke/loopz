const master = {

    init: function() {
        dom.init();
        state.init();
        def.init();
        board.init();

        this.handleButtonClick();
        this.handleMouseEvents();
        this.handleKeyboardEvents();

        if(navigator.maxTouchPoints > 0) {
            this.handleTouchEvents();
        }

        dom.applyCharset();

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

                    /*
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
                    */
                }
            }
        }.bind(this));
    },

    /*
        handleTouchEvents()
        tap:
            above board: pause
            below board: rotate
            on board: drop
        move:
            move piece
    */
    handleTouchEvents: function() {
        dom.touch.addClass("active");

        let touchX, touchY, dx, dy, isMove;
        let px, py;

        dom.touch.addEventListener("touchstart", function(e) {
            e.preventDefault();
            touchX = e.targetTouches[0].clientX;
            touchY = e.targetTouches[0].clientY;
            isMove = false;
            px = piece.x;
            py = piece.y;
        });

        dom.touch.addEventListener("touchmove", function(e) {
            e.preventDefault();
            if(state.gameOn) {
                dx = e.targetTouches[0].clientX - touchX;
                dy = e.targetTouches[0].clientY - touchY;

                if(Math.abs(dx) > state.tileSize || Math.abs(dy) > state.tileSize) {
                    isMove = true;
                }

                if (isMove) {
                    // move piece according to px,py
                    piece.moveFrom(px, py, dx, dy);
                }
            }

        }.bind(this));

        dom.touch.addEventListener("touchend", function(e) {
            e.preventDefault();

            if(!isMove) {

                if (touchY < state.ratioTop) {
                    state.toggleUserPause();

                } else if (touchY < 
                    state.ratioTop +
                    state.tileSize * conf.tilesY
                    + 2*conf.borderDX
                    ) {

                    if(state.gameOn && !state.pause && !state.userPause) {
                        e.preventDefault();
                        piece.drop();
                    }

                } else {
                    if(state.gameOn && !state.pause && !state.userPause) {
                        piece.rotate();
                    }
                }
            }

        }.bind(this));

    },

};

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
            if(state.gameOn && !state.pause && !state.userPause) {
                e.preventDefault();
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



    /*
        initEventChain()
        Set up and start a chain of functions and event triggers.
        The chain defines which function to run,
        and which element that fires a certain event,
        before the next function can be run.

        The chain must contain a start function and an end function,
        thus the initial length must be at least 2
    */
    initEventChain: function() {
        log("initEventChain()");
        if(state.eventChain !== undefined && state.eventChain.length >= 2) {
            state.eventChainFunc = this.continueEventChain.bind(this);
            this.triggerEventChainItem();
        }
    },

    /*
        triggerEventChainItem()
        set up event handler, if any
        run the function currently on top of the chain
    */
    triggerEventChainItem: function() {
        log("triggerEventChainItem()");

        // set up event handler if defined
        if(state.eventChain[0].ev == "time") {

            if(state.eventChain[0].func !== undefined) {
                // run function before setting timeout
                state.eventChain[0].func();
            }

            // wait until next step
            log("  waiting " + state.eventChain[0].ms + " ms");
            setTimeout(
                this.continueEventChain.bind(this), 
                state.eventChain[0].ms
            );

        } else {

            if(state.eventChain[0].ev !== undefined) {
                log("  setting up event listener");
                state.eventChain[0].el.addEventListener(
                    state.eventChain[0].ev,
                    state.eventChainFunc
                );
            }

            // run the current function, eventually triggering the event
            log("  running current function");
            state.eventChain[0].func();
        }
    },

/*
    { ev: "time", ms: 100 },
    { func: this.flashLoop.bind(this), ev: state.trend, el: dom.tiles[board.loop[0].y*conf.tilesX + board.loop[0].x] },
    { func: this.removeLoop.bind(this), ev: "time", ms: 1000 },
    { func: this.continueLoop.bind(this) },

    trigger:
        if time and no func
            set timeout
                continue chain
        if time and func
            run func AND set timeout for continue

        if time
            if func
                run func
            set timeout
                continue chain

    continue:
        if event should be removed
            remove event

    somewhere
        run function AND set timeout
*/

    /*
        continueEventChain()
        current event has occurred
        remove event listener
        prepare for the next element in chain
    */
    continueEventChain: function() {
        log("continueEventChain()");
        // remove event listener if different from "time"
        if(state.eventChain[0].ev !== "time") {
            log("  removing event listener");
            state.eventChain[0].el.removeEventListener(
                state.eventChain[0].ev,
                state.eventChainFunc
            );
        }

        // prepare for the next element in chain
        log("  preparing for next in chain");
        state.eventChain.shift();
        this.triggerEventChainItem();
    },

};
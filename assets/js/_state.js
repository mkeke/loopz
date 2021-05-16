const state = {
    // calculated sizes
    ratioWidth: null,
    ratioHeight: null,
    ratioLeft: null,
    ratioTop: null,
    tileSize: null,

    // end event names
    trend: null,
    anend: null,

    // request animation frame
    raf: null,

    // raf timer
    raftime: null,

    // randomized array of pieces
    bag: null,

    // game stats
    pieces: null,
    loopz: null,
    score: null,
    lives: null,
    time: null, // percentage of time left
    eraserTime: null, // used to determine if eraser is needed
    bonus: null,
    tileCount: null, // number of occupied tiles left on the board

    // today's best
    maxLoopz: null,
    maxScore: null,
    maxSize: null,

    // game states
    pause: null,
    userPause: null,
    gameOn: null,

    init: function() {
        // set start time
        this.raftime = Date.now();

        this.trend = this.whichTransitionEndEvent();
        this.anend = this.whichAnimationEndEvent();
        this.raf = this.whichRequestAnimationFrame().bind(window);

        this.gameOn = false;
        this.pause = false;
        this.userPause = false;

        this.maxLoopz = 0;
        this.maxScore = 0;
        this.maxSize = 0;

        // prepare timer loop
        this.raf(this.timer.bind(this));
    },

    newGame: function(level) {

        board.clear();
        dom.updateBoard();

        this.pieces = 0;
        this.lives = conf.startExtralife;
        this.loopz = 0;
        // this.time = 100; set by piece.new()
        this.bonus = 1;
        this.score = 0;
        this.tileCount = 0;
        this.resetEraserTime();

        if(level == undefined) {
            this.level = 1;
        } else {
            this.level = parseInt(level);
        }

        this.generateBag();

        this.pause = false;
        this.gameOn = true;
        dom.parent.addClass("gameon");

        piece.new();

        dom.updateStats();

        // enable timer loop


        log("started new game level " + this.level);
    },

    /*
        timer()
        timer loop, updates time
        but only when game is on and not paused or userPause
    */
    timer: function() {
        let time = Date.now();

        if(time - this.raftime > conf.rafDelay) {
            this.raftime = time;

            if(this.gameOn && !this.pause && !this.userPause) {
                this.time = Math.max(0, this.time - conf.timerSpeed[this.level])
                this.incEraserTime();

                if(this.time == 0) {

                    // time is up
                    state.pause = true;
                    dom.hideCurrentPiece();

                    eventChain.new([
                        { func: this.handleTimeout.bind(this), ev: "time", ms: 1000 },
                        { func: this.resumeTimeout.bind(this) }
                    ]);
                    eventChain.run();
                }

                dom.updateTime();
            }
        }

        this.raf(this.timer.bind(this));
    },

    handleTimeout: function() {

        if(piece.id !== def.eraser) {
            // losing a life. only show if above 0
            if(--this.lives >= 0) {
                dom.updateLives();
            }
        } else {
            // eraser was not used
            this.decEraserTime();
        }
    },

    resumeTimeout: function() {
        if(this.lives < 0) {
            // TODO game over sequence
            eventChain.new([
                { ev: "time", ms: 500 },
                { func: this.startGameover.bind(this) }
            ]);
            eventChain.run();

        } else {
            this.time = 100;
            piece.new();
            state.pause = false;
        }
    },

    startGameover: function() {
        log("game over man");
        this.gameOn = false;
        dom.parent.removeClass("gameon");
    },

    resetEraserTime: function() {
        this.eraserTime = 0;
    },
    decEraserTime: function(isLoop=true) {
        if(isLoop) {
            // a loop was created
            // dec eraserTime with n seconds
            this.eraserTime -= conf.eraserTimeLoopReduction * 1000 / conf.rafDelay;
        } else {
            // eraser has been used, or not used
            // reduce eraserTime with a factor (0.5)
            this.eraserTime = Math.round(this.eraserTime*conf.eraserTimeReductionFactor);
        }
        // TODO Math.max(0, val)
    },
    incEraserTime: function() {
        this.eraserTime++;
    },

    generateBag: function() {
        this.bag = [];

        let parts = [];
        if(this.pieces == 0) {
            // first bag with easy pieces

            // primitives equally weighted between corners and lines
            parts.push({n:15, p:[1,2,3,4,5,5,6,6]});
            // corners
            parts.push({n: 8, p:[7,8,9,10]});
            // extended lines
            parts.push({n: 3, p:[11,12]});

        } else {
            // default bag

            // primitives with more straights than corners
            parts.push({n:23, p:[1,2,3,4,5,6,5,6,5,6]});
            // corners
            parts.push({n:10, p:[7,8,9,10]});
            // extended corners
            parts.push({n: 5, p:[13,14,15,16,17,18,19,20]});
            // parentheses
            parts.push({n: 5, p:[25,26,27,28]});
            // extended lines
            parts.push({n: 5, p:[11,12]});
            // zigzag
            parts.push({n: 3, p:[21,22,23,24]});
            // extended zigzag (added later)
            parts.push({n: 3, p:[29,30,31,32], extra: true});
        }

        // add pieces to the bag according to description
        for(let i in parts) {
            if(parts[i].extra !== undefined && parts[i].extra === true) {
                continue;
            }
            let num = parts[i].n;
            let pieces = parts[i].p;
            for(let a=0; a<num; a++) {
                this.bag.push(pieces[Math.floor(Math.random()*pieces.length)]);
            }
        }

        // shuffle bag
        for (let i = this.bag.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            let temp = this.bag[i];
            this.bag[i] = this.bag[j];
            this.bag[j] = temp;
        }

        if (this.pieces > 0) {
            // add extra pieces to the bag
            for(let i in parts) {
                if(parts[i].extra === undefined || parts[i].extra === false) {
                    continue;
                }
                let num = parts[i].n;
                let pieces = parts[i].p;
                for(let a=0; a<num; a++) {
                    this.bag.push(pieces[Math.floor(Math.random()*pieces.length)]);
                }
            }

            // shuffle the last 30% of the bag
            let startShuffle = Math.round(this.bag.length * 0.7);
            for (let i = this.bag.length - 1; i > startShuffle; i--) {
                let j = Math.floor(Math.random() * (this.bag.length - startShuffle) + startShuffle);
                let temp = this.bag[i];
                this.bag[i] = this.bag[j];
                this.bag[j] = temp;
            }
        }
    },

    getNextPiece: function() {
        let p = this.bag.shift();
        this.pieces++;
        if(this.bag.length == 0) {
            this.generateBag();
        }
        return p;
    },

    /*
        incScore(key, val)
        increase score in 3 different ways
        key=loop, val is the length of the loop
            increase score based on level and the length of the loop
        key=bonus, val is ignored
            increase score when user has cleared the board
        key=rest, val is the number of tiles left
            clearing the board after game has ended
    */
    incScore(key, val) {
        switch(key) {
            case "loop":
                this.score += (val*val + (this.level+1)*2*val);
                break;
            case "bonus":
                this.score += [300,600,900][this.level];
                break;
            case "rest":
                // TODO increase score by number of tiles left
                break;
        }

        // update today's best score
        this.maxScore = Math.max(this.maxScore, this.score);
    },

    /*
        toggleUserPause()
        scrambles/unscrambles the board
        only if the game is on and not internally paused
        (due to transition chain waiting)
    */
    toggleUserPause: function() {
        if(this.gameOn && !this.pause) {
            this.userPause = !this.userPause;
            if(this.userPause) {
                // scramble board
                dom.tiles.each(function(i, el){
                    el.className = "p" + Math.ceil(Math.random()*4);
                }.bind(this));

                dom.parent.addClass("userpause");
            } else {
                dom.updateBoard();
                dom.parent.removeClass("userpause");
            }
        }
    },

    /*
        whichTransitionEndEvent()
        determine the correct transition end event for the current browser
    */
    whichTransitionEndEvent: function() {

        let t, el = document.createElement("fakeelement");

        let transitions = {
            "transition"      : "transitionend",
            "OTransition"     : "oTransitionEnd",
            "MozTransition"   : "transitionend",
            "WebkitTransition": "webkitTransitionEnd",
            "msTransition"    : "MSTransitionEnd"
        }

        // On some platforms, in particular some releases of Android 4.x,
        // the un-prefixed "animation" and "transition" properties are defined on the
        // style object but the events that fire will still be prefixed, so we need
        // to check if the un-prefixed events are useable, and if not remove them
        if (!('TransitionEvent' in window)) {
            delete transitions.transition;
        }

        for (t in transitions){
            if (el.style[t] !== undefined){
                return transitions[t];
            }
        }

    },

    /*
        whichAnimationEndEvent()
        determine the correct animation end event for the current browser
    */
    whichAnimationEndEvent: function() {
        let a, el = document.createElement("fakeelement");

        let animations = {
            'animation': 'animationend',
            'WebkitAnimation': 'webkitAnimationEnd',
            'MozAnimation': 'mozAnimationEnd',
            'OAnimation': 'oAnimationEnd',
            'msAnimation': 'MSAnimationEnd'
        }

        // On some platforms, in particular some releases of Android 4.x,
        // the un-prefixed "animation" and "transition" properties are defined on the
        // style object but the events that fire will still be prefixed, so we need
        // to check if the un-prefixed events are useable, and if not remove them
        if (!('AnimationEvent' in window)) {
            delete animations.animation;
        }

        for (a in animations){
            if (el.style[a] !== undefined){
                return animations[a];
            }
        }
    },

    whichRequestAnimationFrame: function() {
        // determine the correct raf
        return (window.requestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.msRequestAnimationFrame);
    },
};

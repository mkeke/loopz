const state = {
    // calculated sizes
    ratioWidth: null,
    ratioHeight: null,
    ratioLeft: null,
    ratioTop: null,
    tileSize: null,
    boardLeft: null,
    boardTop: null,

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
    tileCount: null, // number of occupied tiles left on the board

    // today's best
    highscore: null,
    bestLoop: null,
    mostLoopz: null,

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

        this.highscore = 0;
        this.bestLoop = 0;
        this.mostLoopz = 0;

        // prepare timer loop
        this.raf(this.timer.bind(this));
    },

    /*
        newGame(level)
        set up a new game with the specified level
    */
    newGame: function(level) {

        board.clear();
        dom.updateBoard();
        dom.timeWrapper.removeClass("gameover");

        this.pieces = 0;
        this.lives = conf.startExtralife;
        this.loopz = 0;
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
    },

    /*
        timer()
        timer loop, updates time
        handles timeout when game is not paused or userPaused
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

                    // update life, and wait a sec before resuming
                    let ech = new EventChain([
                        { fn: this.handleTimeout.bind(this), ev: "time", ms: 1000 },
                        { fn: this.resumeTimeout.bind(this) }
                    ]);
                    ech.run();
                }

                dom.updateTime();
            }
        }

        this.raf(this.timer.bind(this));
    },

    /*
        handleTimeout()
        decrease life unless an eraser was the active piece
    */
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

    /*
        resumeTimeout()
        resume game, or trigger the game over sequence
    */
    resumeTimeout: function() {
        if(this.lives < 0) {

            // game over sequence
            board.prepareRemoveSnakes();

        } else {
            this.time = 100;
            piece.new();
            state.pause = false;
        }
    },

    /*
        resetEraserTime()
        reset the eraser stop watch
    */
    resetEraserTime: function() {
        this.eraserTime = 0;
    },

    /*
        decEraserTime(isLoop)
        decrease the time before an eraser is shown
        the timer is erased differently based on the previous action
    */
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
    },
    /*
        incEraserTime()
        move one step closer to getting the eraser
    */
    incEraserTime: function() {
        this.eraserTime++;
    },

    /*
        generateBag()
        bag randomizer with a twist

        The initial bag consists of easy pieces, and is shuffled.

        The subsequent bags are filled in a more complex manner.
        First the bag is filled with a selection of easy and intermediate
        pieces, and then shuffled.
        The bag then gets the most difficult pieces added to the end, and
        the last 30% of the bag is shuffled. This makes the bag increase in
        complexity, and we get a cycle of increased/decreased difficulty
        similar to the original Amiga version of the game.

        The cyclic difficulty is horreduously frustrating, and thus a key
        feature to implement (sorry not sorry)
    */
    generateBag: function() {
        this.bag = [];

        let parts = [];
        if(this.pieces == 0) {
            // first bag with easy pieces

            // 15 primitives equally weighted between corners and lines
            parts.push({n:15, p:[1,2,3,4,5,5,6,6]});
            // 8 corners
            parts.push({n: 8, p:[7,8,9,10]});
            // 3 extended lines
            parts.push({n: 3, p:[11,12]});

        } else {
            // default bag

            // primitives with equal amounts of straights and corners
            parts.push({n:23, p:[1,2,3,4,1,2,5,6,5,6,5,6]});
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

    /*
        getNextPiece()
        draw the next piece from the bag
        trigger regeneration of bag if the last piece is picked
    */
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
    incScore: function(key, val) {
        switch(key) {
            case "loop":
                this.score += (val*val + (this.level+1)*2*val);
                break;
            case "bonus":
                this.score += [300,600,900][this.level];
                break;
            case "rest":
                this.score += val*[2,4,6][this.level];
                break;
        }

        // update today's best score
        if(this.score > this.highscore) {
            this.highscore = this.score;
            dom.updateHighscore();
        }
    },

    /*
        incLoopz()
        increase the number of loops created this session.
        update the most loopz placeholder if necessary
    */
    incLoopz: function() {
        if(++this.loopz > this.mostLoopz) {
            this.mostLoopz = this.loopz;
            dom.updateMostLoopz();
        }

        dom.updateLoopz();
        if(this.loopz % conf.newLifeLoop == 0) {
            this.lives++;
            dom.updateLives();
        }
    },

    /*
        checkSize(size)
        check if the current loop size is larger than today's
        largest loop, and update the placeholder if necessary
    */
    checkSize: function(size) {
        if(size > this.bestLoop) {
            this.bestLoop = size;
            dom.updateBestLoop();
        }
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

    /*
        whichRequestAnimationFrame()
        determine the correct raf for the current browser
    */
    whichRequestAnimationFrame: function() {
        return (window.requestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.msRequestAnimationFrame);
    },
};

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

    // today's best
    maxLoopz: null,
    maxScore: null,
    maxSize: null,

    // game states
    pause: null,
    gameOn: null,

    init: function() {
        // set start time
        this.raftime = Date.now();

        this.trend = this.whichTransitionEndEvent();
        this.anend = this.whichAnimationEndEvent();

        this.gameOn = false;

        this.maxLoopz = 0;
        this.maxScore = 0;
        this.maxSize = 0;
    },

    newGame: function(level) {
        this.pause = false;
        this.gameOn = true;

        this.pieces = 0;
        this.score = 0;
        this.loopz = 0;
        this.lives = conf.startExtralife;
        this.time = 100;

        if(level == undefined) {
            this.level = 2;
        } else {
            this.level = parseInt(level);
        }

        this.generateBag();

        dom.parent.addClass("gameon");

        piece.new();
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
            log("shuffle at " + startShuffle);
            log(this.bag.join(" "));
            for (let i = this.bag.length - 1; i > startShuffle; i--) {
                let j = Math.floor(Math.random() * (this.bag.length - startShuffle) + startShuffle);
                let temp = this.bag[i];
                this.bag[i] = this.bag[j];
                this.bag[j] = temp;
            }
            log(this.bag.join(" "));

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
};

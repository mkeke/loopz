const state = {
    // calculated sizes
    ratioWidth: null,
    ratioHeight: null,
    tileSize: null,

    // end event names
    trend: null,
    anend: null,

    // game loop timer
    time: null,

    init: function() {
        // set start time
        this.time = Date.now();

        this.trend = this.whichTransitionEndEvent();
        this.anend = this.whichAnimationEndEvent();
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

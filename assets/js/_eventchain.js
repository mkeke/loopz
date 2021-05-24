/*
    eventChain v2
    --------------

    Simen Lysebo, May 2021

    set up a chain of functions, and which events to wait for
    before continuing to the next function.


    usage
    ------

    let ech = new EventChain([
        { step 1 },
        { step 2 },
        { step 3 },
        { step 4 },
    ]);

    or

    let ech = new EventChain();
    ech.add( { step 1 } );
    ech.add( { step 2 } );
    ech.add( { step 3 } );
    ech.add( { step 4 } );

    and then

    ech.run();


    description of step
    --------------------

    A step can contain the following
    {
        fn: (function) to execute, must be bound to this
        ev: (string) event name
        el: (HTMLelement) that gets the event
        ms: (int) if ev is "time" then ms defines the number of
            milliseconds to wait. When ev is "time", el is not needed.
            fn is optional when ev is "time"
    }

    The chain continues until it reaches a step without an event defined.
    The last element in the chain should not depend on any event.


    example: wait for multiple transitionend before continuing
    ----------------------------------------------------------
    // visualize wrong move by flashing border twice
    let ech = new EventChain([
        { fn: flashUp.bind(this), ev: "transitionend", el: divElement },
        { fn: flashDown.bind(this), ev: "transitionend", el: divElement },
        { fn: flashUp.bind(this), ev: "transitionend", el: divElement },
        { fn: flashDown.bind(this) },
    ]);
    ech.run();

    example: do stuff, wait 1 sec before continuing
    -----------------------------------------------
    let ech = new EventChain([
        { fn: doStuff.bind(this), ev: "time", ms: 1000 },
        { fn: doMore.bind(this) }
    ]);
    ech.run();

    example: wait 2 secs before doing stuff
    ---------------------------------------
    let ech = new EventChain([
        { ev: "time", ms: 1000 }, // event "time" doesn't require a function
        { fn: doStuff.bind(this) }
    ]);
    ech.run();


    TODO
    - implement insert(arr)
        insert arr after current [0]
*/

/*
    constructor (arr)
    Init a chain of functions and event triggers
*/
function EventChain(arr) {
    this._c = [];
    this._f = null;

    if(arr !== undefined) {
        this._c = arr;
    }
}

/*
    add(item)
    add item to the end of chain
*/
EventChain.prototype.add = function(item) {
    this._c.push(item);
};

/*
    run()
    Start a chain of functions and event triggers.
    The chain defines which function to run,
    and which element that fires a certain event,
    before the next function can be run.

    The chain must contain a start function and an end function,
    thus the initial length must be at least 2
*/
EventChain.prototype.run = function() {
    if(this._c !== undefined && this._c.length >= 2) {
        this._f = this._continue.bind(this);
        this._trigger();
    }
};

/*
    _trigger()
    set up event handler, if any
    run the function currently on top of the chain
*/
EventChain.prototype._trigger = function() {
    // set up event handler if defined
    if(
        this._c !== undefined && 
        this._c.length > 0 && 
        this._c[0].ev !== undefined && 
        this._c[0].ev == "time") {

        if(this._c[0].fn !== undefined) {
            // run function before setting timeout
            this._c[0].fn();
        }

        // wait until next step
        setTimeout(
            this._continue.bind(this), 
            this._c[0].ms
        );

    } else {

        if(
            this._c !== undefined && 
            this._c.length > 0 && 
            this._c[0].ev !== undefined
        ) {
            this._c[0].el.addEventListener(
                this._c[0].ev,
                this._f
            );
        }

        // run the current function, eventually triggering the event
        if(
            this._c !== undefined && 
            this._c.length > 0 && 
            this._c[0].fn !== undefined
        ) {

            this._c[0].fn();
        }
    }
};

/*
    continue()
    current event has occurred
    remove event listener
    prepare for the next element in chain
*/
EventChain.prototype._continue = function() {
    // remove event listener if different from "time"
    if(
        this._c !== undefined && 
        this._c.length > 0 && 
        this._c[0].ev !== undefined &&
        this._c[0].ev !== "time" && this._c[0].el !== undefined
    ) {

        this._c[0].el.removeEventListener(
            this._c[0].ev,
            this._f
        );
    }

    // prepare for the next element in chain
    this._c.shift();
    this._trigger();
};

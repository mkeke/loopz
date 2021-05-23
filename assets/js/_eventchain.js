/*
    eventChain

    Simen Lysebo, May 2021

    example usage

    // visualize wrong move by flashing border
    eventChain.new([
        { fn: dom.showWrongMove.bind(this), ev: state.trend, el: dom.boardWrapper },
        { fn: dom.hideWrongMove.bind(this) }
    ]);
    eventChain.run();

    TODO
    - implement insert(arr)
        insert arr after current [0]

    ISSUES
    - chain.new will overwrite the current chain, preventing the
        scheduled functions from being executed, and causing
        touble. Need to be able to run more chains in parallel


*/
const eventChain = {
    _c: [],
    _f: null,

    /*
        new(arr)
        Init a chain of functions and event triggers
    */
    new: function(arr) {
        this._c = arr;
    },

    /*
        add(item)
        add item to the end of chain
    */
    add: function(item) {
        this._c.push(item);
    },


    /*
        run()
        Start a chain of functions and event triggers.
        The chain defines which function to run,
        and which element that fires a certain event,
        before the next function can be run.

        The chain must contain a start function and an end function,
        thus the initial length must be at least 2
    */
    run: function() {
        if(this._c !== undefined && this._c.length >= 2) {
            this._f = this._continue.bind(this);
            this._trigger();
        }
    },

    /*
        _trigger()
        set up event handler, if any
        run the function currently on top of the chain
    */
    _trigger: function() {
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

    },

    /*
        continue()
        current event has occurred
        remove event listener
        prepare for the next element in chain
    */
    _continue: function() {
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
    },
};

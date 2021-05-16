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

            if(this._c[0].func !== undefined) {
                // run function before setting timeout
                this._c[0].func();
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
                this._c[0].ev !== undefined) {
                this._c[0].el.addEventListener(
                    this._c[0].ev,
                    this._f
                );
            }

            // run the current function, eventually triggering the event
            if(
                this._c !== undefined && 
                this._c.length > 0 && 
                this._c[0].func !== undefined) {

                this._c[0].func();
            }

        }

    },

    /*
        continueEventChain()
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
            this._c[0].ev !== "time" && this._c[0].el !== undefined) {

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

const def = {
    // internal board value
    space: 0,
    eraser: 0,

    // keydown/up codes
    keyP:  80,


    /*
        piece definition

        piece primitives:
         _____     _____     _____     _____     _____     _____ 
        |     |   |  #  |   |  #  |   |     |   |  #  |   |     |
        |###  |   |###  |   |  ###|   |  ###|   |  #  |   |#####|
        |__#__|   |_____|   |_____|   |__#__|   |__#__|   |_____|

           1         2         3         4         5         6
    */

    // lookup to query if a piece is open in a certain direction
    isOpen: [ {}, // 0 is not used
        { up: false, right: false, down: true,  left: true  }, // pp 1
        { up: true,  right: false, down: false, left: true  }, // pp 2
        { up: true,  right: true,  down: false, left: false }, // pp 3
        { up: false, right: true,  down: true,  left: false }, // pp 4
        { up: true,  right: false, down: true,  left: false }, // pp 5
        { up: false, right: true,  down: false, left: true  }, // pp 6
    ],

    // lookups defining whether a piece is open in either direction
    // ot or ob ol = openings to the top right bottom left
    //       1      2      3      4      5      6
// TODO refactor ot = ou, up down left right
    ot: [ 0, false, true,  true,  false, true,  false ],
    or: [ 0, false, false, true,  true,  false, true  ],
    ob: [ 0, true,  false, false, true,  true,  false ],
    ol: [ 0, true,  true,  false, false, false, true  ],

    // lookup defining dx and dy for each direction,
    // as well as the name of the opposite direction
    dir: {
        "left":  { dx:-1, dy: 0, inv: "right"},
        "right": { dx: 1, dy: 0, inv: "left"},
        "up":    { dx: 0, dy:-1, inv: "down"},
        "down":  { dx: 0, dy: 1, inv: "up"},
    },

    // piece exit lookup
    exit: [ [],
        ["left", "down"],
        ["left", "up"],
        ["up", "right"],
        ["right", "down"],
        ["up", "down"],
        ["left", "right"],
    ],

    // piece primitives ids.
    // pLB etc are for convenience (T R B L = Top Right Bottom Left)
    p1: 1, pLB: 1, pBL: 1,
    p2: 2, pLT: 2, pTL: 2,
    p3: 3, pRT: 3, pTR: 3,
    p4: 4, pBR: 4, pRB: 4,
    p5: 5, pTB: 5, pBT: 5,
    p6: 6, pLR: 6, pRL: 6,

    // piece definition lookup is created runtime
    p: [],

    // rotation lookup
    r: [ 0, // not used (eraser)
         2, //  1
         3, //  2
         4, //  3
         1, //  4
         6, //  5
         5, //  6
         8, //  7
         9, //  8
        10, //  9
         7, // 10
        12, // 11
        11, // 12
        14, // 13
        15, // 14
        16, // 15
        13, // 16
        18, // 17
        19, // 18
        20, // 19
        17, // 20
        22, // 21
        21, // 22
        24, // 23
        23, // 24
        26, // 25
        27, // 26
        28, // 27
        25, // 28
        30, // 29
        29, // 30
        32, // 31
        31, // 32
    ],

    createPieceLookup: function() {
        this.p.push([]); // 0 = not used (eraser)

        // piece primitives
        this.p.push([{id:this.p1,x:0,y:0}]); // 1
        this.p.push([{id:this.p2,x:0,y:0}]); // 2
        this.p.push([{id:this.p3,x:0,y:0}]); // 3
        this.p.push([{id:this.p4,x:0,y:0}]); // 4
        this.p.push([{id:this.p5,x:0,y:0}]); // 5
        this.p.push([{id:this.p6,x:0,y:0}]); // 6

        // pieces sorted somewhat by complexity

        this.p.push([                   //  ___ ___ 
            {id:this.pLR,x:-1,y: 0},    // |   | o |      7
            {id:this.pLB,x: 0,y: 0},    // |___|___|
            {id:this.pTB,x: 0,y: 1},    //     |   |
        ]);                             //     |___|
                                        //
        this.p.push([                   //      ___ 
            {id:this.pLR,x:-1,y: 0},    //     |   |      8
            {id:this.pLT,x: 0,y: 0},    //  ___|___|
            {id:this.pTB,x: 0,y:-1},    // |   | o |
        ]);                             // |___|___|
                                        //
        this.p.push([                   //  ___
            {id:this.pTB,x: 0,y:-1},    // |   |          9
            {id:this.pRT,x: 0,y: 0},    // |___|___
            {id:this.pLR,x: 1,y: 0},    // | o |   |
        ]);                             // |___|___|
                                        //
        this.p.push([                   //  ___ ___ 
            {id:this.pTB,x: 0,y: 1},    // | o |   |     10
            {id:this.pRB,x: 0,y: 0},    // |___|___|
            {id:this.pLR,x: 1,y: 0},    // |   |
        ]);                             // |___|
                                        //
        this.p.push([                   //  ___ 
            {id:this.pTB,x: 0,y:-1},    // |   |         11
            {id:this.pTB,x: 0,y: 0},    // |___|
            {id:this.pTB,x: 0,y: 1},    // | o |
        ]);                             // |___|
                                        // |   |
                                        // |___| 
        this.p.push([                   //  ___ ___ ___
            {id:this.pLR,x:-1,y: 0},    // |   | o |   | 12
            {id:this.pLR,x: 0,y: 0},    // |___|___|___|
            {id:this.pLR,x: 1,y: 0},    //      
        ]);                             //
                                        //
        this.p.push([                   //  ___ ___
            {id:this.pLR,x:-1,y: 0},    // |   | o |     13
            {id:this.pLB,x: 0,y: 0},    // |___|___|
            {id:this.pTB,x: 0,y: 1},    //     |   |
            {id:this.pTB,x: 0,y: 2},    //     |___|
        ]);                             //     |   |
                                        //     |___|
        this.p.push([                   //          ___ 
            {id:this.pLR,x:-2,y: 0},    //         |   | 14
            {id:this.pLR,x:-1,y: 0},    //  ___ ___|___|
            {id:this.pLT,x: 0,y: 0},    // |   |   | o |
            {id:this.pTB,x: 0,y:-1},    // |___|___|___|
        ]);                             //
                                        //
        this.p.push([                   //  ___ 
            {id:this.pTB,x: 0,y:-2},    // |   |         15
            {id:this.pTB,x: 0,y:-1},    // |___|
            {id:this.pRT,x: 0,y: 0},    // |   |
            {id:this.pLR,x: 1,y: 0},    // |___|___
        ]);                             // | o |   |
                                        // |___|___|
        this.p.push([                   //  ___ ___ ___
            {id:this.pTB,x: 0,y: 1},    // | o |   |   | 16
            {id:this.pRB,x: 0,y: 0},    // |___|___|___|
            {id:this.pLR,x: 1,y: 0},    // |   |
            {id:this.pLR,x: 2,y: 0},    // |___|
        ]);                             //
                                        //
        this.p.push([                   //  ___ ___ ___
            {id:this.pLR,x:-2,y: 0},    // |   |   | o | 17
            {id:this.pLR,x:-1,y: 0},    // |___|___|___|
            {id:this.pLB,x: 0,y: 0},    //         |   |
            {id:this.pTB,x: 0,y: 1},    //         |___|
        ]);                             //
                                        //
        this.p.push([                   //      ___ 
            {id:this.pLR,x:-1,y: 0},    //     |   |     18
            {id:this.pLT,x: 0,y: 0},    //     |___|
            {id:this.pTB,x: 0,y:-1},    //     |   |
            {id:this.pTB,x: 0,y:-2},    //  ___|___|
        ]);                             // |   | o |
                                        // |___|___|
        this.p.push([                   //  ___ 
            {id:this.pTB,x: 0,y:-1},    // |   |         19
            {id:this.pRT,x: 0,y: 0},    // |___|___ ___
            {id:this.pLR,x: 1,y: 0},    // | o |   |   |
            {id:this.pLR,x: 2,y: 0},    // |___|___|___|
        ]);                             //
                                        //
        this.p.push([                   //  ___ ___ 
            {id:this.pRB,x: 0,y: 0},    // | o |   |     20
            {id:this.pLR,x: 1,y: 0},    // |___|___|
            {id:this.pTB,x: 0,y: 1},    // |   |
            {id:this.pTB,x: 0,y: 2},    // |___|
        ]);                             // |   |
                                        // |___|
                                        //
        this.p.push([                   //  ___ 
            {id:this.pTB,x: 0,y:-1},    // |   |         21
            {id:this.pRT,x: 0,y: 0},    // |___|___
            {id:this.pLB,x: 1,y: 0},    // | o |   |
            {id:this.pTB,x: 1,y: 1},    // |___|___|
        ]);                             //     |   |
                                        //     |___|
        this.p.push([                   //      ___ ___
            {id:this.pLR,x:-1,y: 1},    //     | o |   | 22
            {id:this.pLT,x: 0,y: 1},    //  ___|___|___|
            {id:this.pRB,x: 0,y: 0},    // |   |   |
            {id:this.pLR,x: 1,y: 0},    // |___|___|
        ]);                             //
                                        //
        this.p.push([                   //      ___ 
            {id:this.pTB,x: 0,y: 1},    //     |   |     23
            {id:this.pRB,x: 0,y: 0},    //  ___|___|
            {id:this.pLT,x: 1,y: 0},    // | o |   |
            {id:this.pTB,x: 1,y:-1},    // |___|___|
        ]);                             // |   |
                                        // |___|
        this.p.push([                   //  ___ ___
            {id:this.pLR,x:-1,y: 0},    // |   | o |     24
            {id:this.pLB,x: 0,y: 0},    // |___|___|___
            {id:this.pRT,x: 0,y: 1},    //     |   |   |
            {id:this.pLR,x: 1,y: 1},    //     |___|___|
        ]);                             //
                                        //
        this.p.push([                   //  ___ ___ 
            {id:this.pLR,x: 1,y:-1},    // |   |   |     25
            {id:this.pRB,x: 0,y:-1},    // |___|___|
            {id:this.pTB,x: 0,y: 0},    // | o |
            {id:this.pRT,x: 0,y: 1},    // |___|___
            {id:this.pLR,x: 1,y: 1},    // |   |   |
        ]);                             // |___|___|
                                        //
        this.p.push([                   //  ___ ___ ___
            {id:this.pTB,x:-1,y: 1},    // |   | o |   | 26
            {id:this.pRB,x:-1,y: 0},    // |___|___|___|
            {id:this.pLR,x: 0,y: 0},    // |   |   |   |
            {id:this.pLB,x: 1,y: 0},    // |___|   |___|
            {id:this.pTB,x: 1,y: 1},    //
        ]);                             //
                                        //
        this.p.push([                   //  ___ ___ 
            {id:this.pLR,x:-1,y:-1},    // |   |   |     27
            {id:this.pLB,x: 0,y:-1},    // |___|___|
            {id:this.pTB,x: 0,y: 0},    //     | o |
            {id:this.pLT,x: 0,y: 1},    //  ___|___|
            {id:this.pLR,x:-1,y: 1},    // |   |   |
        ]);                             // |___|___|
                                        //
        this.p.push([                   //  ___     ___
            {id:this.pTB,x:-1,y:-1},    // |   |   |   | 28
            {id:this.pRT,x:-1,y: 0},    // |___|___|___|
            {id:this.pLR,x: 0,y: 0},    // |   | o |   |
            {id:this.pLT,x: 1,y: 0},    // |___|___|___|
            {id:this.pTB,x: 1,y:-1},    //
        ]);                             //
        this.p.push([                   //  ___ 
            {id:this.pTB,x:-1,y:-1},    // |   |         29
            {id:this.pRT,x:-1,y: 0},    // |___|___ ___
            {id:this.pLR,x: 0,y: 0},    // |   | o |   |
            {id:this.pLB,x: 1,y: 0},    // |___|___|___|
            {id:this.pTB,x: 1,y: 1},    //         |   |
        ]);                             //         |___|
                                        //
        this.p.push([                   //      ___ ___ 
            {id:this.pLR,x:-1,y: 1},    //     |   |   | 30
            {id:this.pLT,x: 0,y: 1},    //     |___|___|
            {id:this.pTB,x: 0,y: 0},    //     | o |
            {id:this.pRB,x: 0,y:-1},    //  ___|___|
            {id:this.pLR,x: 1,y:-1},    // |   |   |
        ]);                             // |___|___|
                                        //
        this.p.push([                   //          ___ 
            {id:this.pTB,x:-1,y: 1},    //         |   | 31
            {id:this.pRB,x:-1,y: 0},    //  ___ ___|___|
            {id:this.pLR,x: 0,y: 0},    // |   | o |   |
            {id:this.pLT,x: 1,y: 0},    // |___|___|___|
            {id:this.pTB,x: 1,y:-1},    // |   |
        ]);                             // |___|
                                        //
        this.p.push([                   //  ___ ___ 
            {id:this.pLR,x:-1,y:-1},    // |   |   |     32
            {id:this.pLB,x: 0,y:-1},    // |___|___|
            {id:this.pTB,x: 0,y: 0},    //     | o |
            {id:this.pRT,x: 0,y: 1},    //     |___|___
            {id:this.pLR,x: 1,y: 1},    //     |   |   |
        ]);                             //     |___|___|
                                        //
    },

    init: function() {
        this.createPieceLookup();
    }
};

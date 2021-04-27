const def = {
    // internal board value
    space: 0,

    /*
        piece definition

        piece primitives:
         _____     _____     _____     _____     _____     _____ 
        |     |   |  #  |   |  #  |   |     |   |  #  |   |     |
        |###  |   |###  |   |  ###|   |  ###|   |  #  |   |#####|
        |__#__|   |_____|   |_____|   |__#__|   |__#__|   |_____|

           1         2         3         4         5         6
    */

    // piece primitives ids.
    // pLB etc are for convenience (Left Bottom)
    // T R B L = TOP RIGHT BOTTOM LEFT
    p1: 1, pLB: 1, pBL: 1,
    p2: 2, pLT: 2, pTL: 2,
    p3: 3, pRT: 3, pTR: 3,
    p4: 4, pBR: 4, pRB: 4,
    p5: 5, pTB: 5, pBT: 5,
    p6: 6, pLR: 6, pRL: 6,

    p: [],

    createPieceLookup: function() {
        this.p.push([]); // 0 = not used

        // piece primitives
        this.p.push([{id:this.p1,x:0,y:0}]); // p1
        this.p.push([{id:this.p2,x:0,y:0}]); // p2
        this.p.push([{id:this.p3,x:0,y:0}]); // p3
        this.p.push([{id:this.p4,x:0,y:0}]); // p4
        this.p.push([{id:this.p5,x:0,y:0}]); // p5
        this.p.push([{id:this.p6,x:0,y:0}]); // p6

        this.p.push([                   //  ___ ___ ___ 
            {id:this.pLR,x:-1,y: 0},    // |   | . |   |
            {id:this.pLR,x: 0,y: 0},    // |___|___|___|
            {id:this.pLR,x: 1,y: 0},    //
        ]);                             //  ___ 
        this.p.push([                   // |   |
            {id:this.pTB,x: 0,y:-1},    // |___|
            {id:this.pTB,x: 0,y: 0},    // | . |
            {id:this.pTB,x: 0,y: 1},    // |___|
        ]);                             // |   |
                                        // |___|
                                        //  ___ ___
        this.p.push([                   // |   | . |
            {id:this.pLR,x:-1,y: 0},    // |___|___|
            {id:this.pLB,x: 0,y: 0},    //     |   |
            {id:this.pTB,x: 0,y: 1},    //     |___|
            {id:this.pTB,x: 0,y: 2},    //     |   |
        ]);                             //     |___|
                                        // 


        /*
        this.p.push([
            {this.p,x:,y:},
        ]);
        */

/*

        lctrl.pieceLookup[10] = [
        [lctrl.pp_up_down, 0, 2], 
        [lctrl.pp_up_down, 0, 1], 
        [lctrl.pp_right_down, 0, 0], 
        [lctrl.pp_left_right, 1, 0]];

        lctrl.pieceLookup[11] = [
        [lctrl.pp_up_down, 0, -1], 
        [lctrl.pp_right_up, 0, 0], 
        [lctrl.pp_left_down, 1, 0], 
        [lctrl.pp_up_down, 1, 1]];

        lctrl.pieceLookup[12] = [
        [lctrl.pp_up_down, 0, 1], 
        [lctrl.pp_right_down, 0, 0], 
        [lctrl.pp_left_up, 1, 0], 
        [lctrl.pp_up_down, 1, -1]];

        lctrl.pieceLookup[13] = [
        [lctrl.pp_left_right, 1, -1], 
        [lctrl.pp_right_down, 0, -1], 
        [lctrl.pp_up_down, 0, 0], 
        [lctrl.pp_right_up, 0, 1], 
        [lctrl.pp_left_right, 1, 1]];

        lctrl.pieceLookup[14] = [
        [lctrl.pp_up_down, -1, -1], 
        [lctrl.pp_right_up, -1, 0], 
        [lctrl.pp_left_right, 0, 0], 
        [lctrl.pp_left_down, 1, 0], 
        [lctrl.pp_up_down, 1, 1]];

        lctrl.pieceLookup[15] = [
        [lctrl.pp_up_down, -1, 1], 
        [lctrl.pp_right_down, -1, 0], 
        [lctrl.pp_left_right, 0, 0], 
        [lctrl.pp_left_up, 1, 0], 
        [lctrl.pp_up_down, 1, -1]];

        lctrl.pieceLookup[16] = [
        [lctrl.pp_left_right, -1, 0], 
        [lctrl.pp_left_up, 0, 0], 
        [lctrl.pp_up_down, 0, -1]];

        lctrl.pieceLookup[17] = [
        [lctrl.pp_left_right, -1, 0], 
        [lctrl.pp_left_right, 0, 0], 
        [lctrl.pp_left_right, 1, 0]];

        lctrl.pieceLookup[18] = [
        [lctrl.pp_left_right, -2, 0], 
        [lctrl.pp_left_right, -1, 0], 
        [lctrl.pp_left_up, 0, 0], 
        [lctrl.pp_up_down, 0, -1]];

        lctrl.pieceLookup[19] = [
        [lctrl.pp_left_right, -2, 0], 
        [lctrl.pp_left_right, -1, 0], 
        [lctrl.pp_left_down, 0, 0], 
        [lctrl.pp_up_down, 0, 1]];

        lctrl.pieceLookup[20] = [
        [lctrl.pp_left_right, -1, 1], 
        [lctrl.pp_left_up, 0, 1], 
        [lctrl.pp_right_down, 0, 0], 
        [lctrl.pp_left_right, 1, 0]];

        lctrl.pieceLookup[21] = [
        [lctrl.pp_left_right, -1, 0], 
        [lctrl.pp_left_down, 0, 0], 
        [lctrl.pp_right_up, 0, 1], 
        [lctrl.pp_left_right, 1, 1]];

        lctrl.pieceLookup[22] = [
        [lctrl.pp_up_down, -1, 1], 
        [lctrl.pp_right_down, -1, 0], 
        [lctrl.pp_left_right, 0, 0], 
        [lctrl.pp_left_down, 1, 0], 
        [lctrl.pp_up_down, 1, 1]];

        lctrl.pieceLookup[23] = [
        [lctrl.pp_left_right, -1, 1], 
        [lctrl.pp_left_up, 0, 1], 
        [lctrl.pp_up_down, 0, 0], 
        [lctrl.pp_right_down, 0, -1], 
        [lctrl.pp_left_right, 1, -1]];

        lctrl.pieceLookup[24] = [
        [lctrl.pp_left_right, -1, -1], 
        [lctrl.pp_left_down, 0, -1], 
        [lctrl.pp_up_down, 0, 0], 
        [lctrl.pp_right_up, 0, 1], 
        [lctrl.pp_left_right, 1, 1]];

        lctrl.pieceLookup[25] = [
        [lctrl.pp_up_down, 0, -1], 
        [lctrl.pp_right_up, 0, 0], 
        [lctrl.pp_left_right, 1, 0]];

        lctrl.pieceLookup[26] = [
        [lctrl.pp_up_down, 0, -2], 
        [lctrl.pp_up_down, 0, -1], 
        [lctrl.pp_right_up, 0, 0], 
        [lctrl.pp_left_right, 1, 0]];

        lctrl.pieceLookup[27] = [
        [lctrl.pp_left_right, -1, 0], 
        [lctrl.pp_left_up, 0, 0], 
        [lctrl.pp_up_down, 0, -1], 
        [lctrl.pp_up_down, 0, -2]];

        lctrl.pieceLookup[28] = [
        [lctrl.pp_left_right, -1, -1], 
        [lctrl.pp_left_down, 0, -1], 
        [lctrl.pp_up_down, 0, 0], 
        [lctrl.pp_left_up, 0, 1], 
        [lctrl.pp_left_right, -1, 1]];

        lctrl.pieceLookup[29] = [
        [lctrl.pp_up_down, 0, 1], 
        [lctrl.pp_right_down, 0, 0], 
        [lctrl.pp_left_right, 1, 0]];

        lctrl.pieceLookup[30] = [
        [lctrl.pp_up_down, 0, 1], 
        [lctrl.pp_right_down, 0, 0], 
        [lctrl.pp_left_right, 1, 0], 
        [lctrl.pp_left_right, 2, 0]];

        lctrl.pieceLookup[31] = [
        [lctrl.pp_up_down, 0, -1], 
        [lctrl.pp_right_up, 0, 0], 
        [lctrl.pp_left_right, 1, 0], 
        [lctrl.pp_left_right, 2, 0]];

        lctrl.pieceLookup[32] = [
        [lctrl.pp_up_down, -1, -1], 
        [lctrl.pp_right_up, -1, 0], 
        [lctrl.pp_left_right, 0, 0], 
        [lctrl.pp_left_up, 1, 0], 
        [lctrl.pp_up_down, 1, -1]];

*/


    },

    init: function() {
        this.createPieceLookup();
    }
};

const conf = {
    debugLevel: 1,

    // screen max/min width
    minWidth: 380,
    maxWidth: 800,

    // timer loop repeat delay
    rafDelay: 50,

    // screen ratio consists of tiles + additional px in either direction
    ratioWidthTiles: 18, // 18 board tiles
    ratioWidthPx: 34, // 2*(10+5+2) px border stuff on each side
    ratioHeightTiles: 11, // 7 board tiles + 2 tiles space + 1 tile stats + 1 tile space
    ratioHeightPx: 68, // 2*(10+5+2) board border + 2*(10+5+2) stats border

    borderDX: 10 + 5 + 2, // how much space (in px) one border takes
    borderInnerOffset: 5 + 2,

    // board size
    tilesX: 18,
    tilesY: 7,

    // game
    startExtralife: 2,
    newLifeLoop: 25,
    eraserTimeLimit: 90,
    eraserTimeLoopReduction: 10,
    eraserTimeReductionFactor: 0.5,

    timerSpeed: [0.5, 1.5, 2.5],
};

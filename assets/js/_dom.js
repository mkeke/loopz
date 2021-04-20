const dom = {
    runtimeStyle: null,
    parent: null,
    ratio: null,

    init: function() {
        this.runtimeStyle = z("style.runtime");
        this.parent = z(".fullscreen");
        this.ratio = this.parent.find(".ratio");
    }
};
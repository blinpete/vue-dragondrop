

const eventManager = {
    start: ['touchstart', 'mousedown'],
    move: ['touchmove', 'mousemove'],
    end: ['touchend', 'touchcancel', 'mouseup'],

    hover: ['mouseenter'],

    addListeners(el, events){
        for (const key in events) {
            this[key].forEach(name => {
                // console.log("[addListeners] adding", name);

                el.addEventListener(name, events[key], false);
            });
        }
    },

    removeListeners(el, events){
        for (const key in events) {
            this[key].forEach(name => el.removeEventListener(name, events[key]));
        }
    },
};

function getCSSPixelValue(stringValue) {
    if (stringValue.substr(-2) === 'px') {
        return parseFloat(stringValue);
    }
    return 0;
}

function getElementMargin(element) {
    const style = window.getComputedStyle(element);

    return {
        top: getCSSPixelValue(style.marginTop),
        right: getCSSPixelValue(style.marginRight),
        bottom: getCSSPixelValue(style.marginBottom),
        left: getCSSPixelValue(style.marginLeft),
    };
}

function getElementMeasures(node){
    const rect = node.getBoundingClientRect();
    const margins = getElementMargin(node);
    return {
      width: node.offsetWidth+'px',
      height: node.offsetHeight+'px',
      top: rect.top - margins.top+'px',
      left: rect.left - margins.left+'px',
    }
}



const vendorPrefix = (function() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return ''; // server environment
    // fix for:
    //    https://bugzilla.mozilla.org/show_bug.cgi?id=548397
    //    window.getComputedStyle() returns null inside an iframe with display: none
    // in this case return an array with a fake mozilla style in it.
    const styles = window.getComputedStyle(document.documentElement, '') || ['-moz-hidden-iframe'];
    const pre = (Array.prototype.slice.call(styles).join('').match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o']))[1];
  
    switch (pre) {
      case 'ms':
        return 'ms';
      default:
        return pre && pre.length ? pre[0].toUpperCase() + pre.substr(1) : '';
    }
  })();



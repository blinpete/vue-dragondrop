

const eventManager = {
  start: ['touchstart', 'mousedown'],
  move: ['touchmove', 'mousemove'],
  end: ['touchend', 'touchcancel', 'mouseup'],

  enter: ['mouseenter'],
  leave: ['mouseleave'],

  addListeners(el, events){
    for (const key in events)
      this[key].forEach(name => el.addEventListener(name, events[key], false));
  },

  removeListeners(el, events){
    for (const key in events)
      this[key].forEach(name => el.removeEventListener(name, events[key]));
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

function getElementCenter(node, mode='xy'){
  const m = getElementMeasures(node);
  const center = {};

  mode.includes('x') && (center.x = getCSSPixelValue(m.left) + getCSSPixelValue(m.width)/2);
  mode.includes('y') && (center.y = getCSSPixelValue(m.top) + getCSSPixelValue(m.height)/2);

  return center;
}

function getOffset(e) {
  return {
    x: e.touches ? e.touches[0].pageX : e.pageX,
    y: e.touches ? e.touches[0].pageY : e.pageY,
  };
}

function arrayMoveElement(from, to){

  // Edge case: moving an element forward within its array
  //    You'll move the element out of the array first,
  //    that shifts all the next indices by -1.
  //    So the destination index should be shifted by -1.
  if (from.array===to.array && from.index<to.index){
    to.index -= 1;
  }

  to.array.splice(to.index, 0, from.array.splice(from.index,1)[0]);
}


function calcScroll(pos, edges){

  if (pos > edges.max) return pos - edges.max;     // Scroll down/right
  if (pos < edges.min) return pos - edges.min;    // Scroll up/left

  return 0;     // no scroll
}




const vendorPrefix = (function() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return ''; // server environment
  // fix for:
  //  https://bugzilla.mozilla.org/show_bug.cgi?id=548397
  //  window.getComputedStyle() returns null inside an iframe with display: none
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



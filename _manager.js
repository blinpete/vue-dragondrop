
const manager = {

    ghost: {
      node: null,
      styleCache: {},
      style: {
          width: '200px',
          height: '80px',
          border: '2px dashed #abc',
          boxSizing: 'border-box',
          margin: '3px 0',
      },
    },

    intervals: {},


    init(){
      this.cache = {};          // to cache something within a DnD action
      this.dragging = null;     // Draggable compo that is dragging

      this.hovered = null;      // Draggable compo that is hovered
      this.container = null;    // Container compo (parent of this.hovered)

      this.helper = null;       // node (set up in container.handlePress, i.e. on 'start' event)
      this.helperRect = null;   // getBoundingClientRect of helper element

      this.oldLocation = null;  // {array, index} where the draggable item taken
      this.newLocation = null;  // {array, index} where the draggable item dropped

      this.scroll = {
        container: null,
        edges: {x: {}, y: {}},  // container edges (document coordinates)

        window: document.scrollingElement,
        windowEdges: {
          x: {min: 20, max: window.innerWidth-20},
          y: {min: 20, max: window.innerHeight-20},
        },                      // window edges (viewport coordinates)
      };

    },


    updateContainer(c){
      // console.log('[updateContainer]');
      if(this.container === c) return;

      this.container = c;
      this.scroll.container = c.$el;

      const cRect = c.$el.getBoundingClientRect();

      if (c.axis.includes('x'))
        this.scroll.edges.x = {
          min: window.pageXOffset + cRect.left,
          max: window.pageXOffset + cRect.left + cRect.width,
        }

      if (c.axis.includes('y'))
        this.scroll.edges.y = {
          min: window.pageYOffset + cRect.top,
          max: window.pageYOffset + cRect.top + cRect.height,
        }

    },

    setGhost(node){
      this.ghost.node = node;
    },

    hideGhost(){
      let node = this.ghost.node;
      if (!node) return;

      this.ghost.styleCache.visibility = node.style.visibility;
      this.ghost.styleCache.opacity    = node.style.opacity;

      node.style.visibility = 'hidden';
      node.style.opacity    = 0;
    },

    revealGhost(){
      Object.assign(this.ghost.node.style, this.ghost.styleCache);
    },

    startAutoscroll(key, translation, timeout=5){
      // key is 'container' or 'window'

      if (translation.y || translation.x)
        this.intervals[key] = setInterval(() => {
            this.scroll[key].scrollTop += translation.y;
            this.scroll[key].scrollLeft += translation.x;
          },
          timeout
        );
    },

    stopAutoscroll(){
      ['container', 'window'].forEach(k => {
        if (this.intervals[k]) {
          clearInterval(this.intervals[k]);
          this.intervals[k] = null;
        }
      });
    },

    autoscroll(e) {

      if (!this.dragging)
        return;

      const pointer = {
        docX: e.pageX,
        docY: e.pageY,
        x: e.clientX,
        y: e.clientY,
      };
      const acceleration = {x: 10, y: 10};
      const {height,width} = this.helperRect;  // there was = this.container.boundingClientRect;


      // Container scroll
      const scroll_c = {
        x: acceleration.x * calcScroll(pointer.docX, this.scroll.edges.x) / width,
        y: acceleration.y * calcScroll(pointer.docY, this.scroll.edges.y) / height
      };

      // Window scroll
      const scroll_w = {
        x: acceleration.x * calcScroll(pointer.x, this.scroll.windowEdges.x) / width,
        y: acceleration.y * calcScroll(pointer.y, this.scroll.windowEdges.y) / height
      };

      this.stopAutoscroll();    // clear the old scroll

      this.startAutoscroll('container', scroll_c);
      this.startAutoscroll('window', scroll_w);
    },

};


manager.init();
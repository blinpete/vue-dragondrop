
const manager = {

    previewNode: {
        parentId: "__preview_hidden__",
        id: "__preview_node__",
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

      this.helperRect = null;   // getBoundingClientRect of helper element

      this.oldLocation = null;  // {array, index} where the draggable item taken
      this.newLocation = null;  // {array, index} where the draggable item dropped

      this.scroll = {
        edges: {x: {}, y: {}},   // container edges (document coordinates)

        window: document.scrollingElement,
        windowEdges: {
          x: {min: 20, max: window.innerWidth-20},
          y: {min: 20, max: window.innerHeight-20},
        },        // window edges (viewport coordinates)
      };


      // this.useWindowAsScrollContainer = false;
    },


    updateContainer(c){
      if(this.container === c) return;

      this.container = c;
      this.scroll.container = c.$el;

      const cRect = c.$el.getBoundingClientRect();

      if (c.axis.includes('x')) {
        this.scroll.edges.x = {
          min: window.pageXOffset + cRect.left,
          max: window.pageXOffset + cRect.left + cRect.width,
        }
      }

      if (c.axis.includes('y')) {
        this.scroll.edges.y = {
          min: window.pageXOffset + cRect.top,
          max: window.pageXOffset + cRect.top + cRect.height,
        }
      }
    },

    stopAutoscroll(){
      if (this.intervals.container) {
        clearInterval(this.intervals.container);
        this.intervals.container = null;
      }
      if (this.intervals.window) {
        clearInterval(this.intervals.window);
        this.intervals.window = null;
      }
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
      const scroll_c = {};
      const scroll_w = {};

      // const {height,width} = this.container.boundingClientRect;
      const {height,width} = this.helperRect;

      // Container scroll
      scroll_c.x = acceleration.x * calcScroll(pointer.docX, this.scroll.edges.x) / width;
      scroll_c.y = acceleration.y * calcScroll(pointer.docY, this.scroll.edges.y) / height;

      // Window scroll
      scroll_w.x = acceleration.x * calcScroll(pointer.x, this.scroll.windowEdges.x) / width;
      scroll_w.y = acceleration.y * calcScroll(pointer.y, this.scroll.windowEdges.y) / height;

      // console.log("[autoscroll] helper.height: ", height);
      // console.log("[autoscroll] pointer: ", pointer);

      this.stopAutoscroll();

      this.startAutoscroll('container', scroll_c);
      this.startAutoscroll('window', scroll_w);

    },

};

// preview element
document.body.innerHTML += `
  <div id="${manager.previewNode.parentId}" hidden>
    <div id="${manager.previewNode.id}">
    </div>
  </div>
`;

manager.previewNode.parentNode = document.getElementById(manager.previewNode.parentId);
manager.previewNode.node = document.getElementById(manager.previewNode.id);

Object.entries(manager.previewNode.style).forEach(([k,v]) => {
    manager.previewNode.node.style[k] = v;
});


manager.init();
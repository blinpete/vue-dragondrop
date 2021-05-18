
const manager = {

    ghost: {
      node: null,
      styleCache: {},
      style: {
        visibility: 'hidden',
        opacity: 0,
        pointerEvents: 'none',  // use this prop if you customized the ghost to be visible
      },
    },

    helper: {
      node: null,
      rect: null,
      class: null,
      style: {
        pointerEvents: 'none',
        boxSizing: 'border-box',
        position: 'fixed',
        zIndex: 100,
      }
    },

    appendTo: 'body',

    intervals: {},


    init(){
      this.cache = {};          // to cache something within a DnD action

      this.dragging = null;     // Draggable compo that is dragging
      this.hovered = null;      // Draggable compo that is hovered
      this.container = null;    // Container compo (parent of this.hovered)

      this.helper.node = null;  // node (set up in container.handlePress, i.e. on 'start' event)
      this.helper.rect = null;  // getBoundingClientRect of helper element

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
      this.ghost.node = node || this.dragging.$el;
    },

    hideGhost(){
      let {node, style, styleCache} = this.ghost;
      if (!node) return;

      Object.keys(style).forEach(k => {styleCache[k] = node.style[k]});
      Object.assign(node.style, style);
    },

    revealGhost(){
      Object.assign(this.ghost.node.style, this.ghost.styleCache);
    },

    setInitialOffset(e){
      this.initialOffset = getOffset(e);

      this.initialOffset.x -= this.scroll.window.scrollLeft;
      this.initialOffset.y -= this.scroll.window.scrollTop;
    },

    moveHelperToGhost(){

      console.log('[moveHeplerToGhost]');

      let duration = 250;
      let targetX = 0;
      let targetY = 0;

      let scroll = {
        left: this.scroll.container.scrollLeft,
        top: this.scroll.container.scrollTop,
      };

      let ghost = {
        left: this.ghost.node.offsetLeft,
        top: this.ghost.node.offsetTop,
        width: this.ghost.node.offsetWidth,
        height: this.ghost.node.offsetHeight,
      };

      let helper = {
        left: this.helper.node.offsetLeft,
        top: this.helper.node.offsetTop,
        width: this.helper.node.offsetWidth,
        height: this.helper.node.offsetHeight,
      };

      // console.log('scroll: ', scroll.left);
      // console.log('ghost: ', ghost.left);
      // console.log('helper: ', helper.left);


      targetX = -scroll.left + ghost.left - helper.left;
      targetY = -scroll.top + ghost.top - helper.top;



      this.helper.node.style[`${vendorPrefix}Transform`] = `translate3d(${targetX}px,${targetY}px, 0)`;
      this.helper.node.style[`${vendorPrefix}TransitionDuration`] = `${duration}ms`;


      // Remove the helper from the DOM ---------------------------------------
      _helper = this.helper.node;

      setTimeout((e)=>{
        console.log('[moveHelperToGhost] removing helper');
        _helper.parentNode.removeChild(_helper);
      }, duration);

      // it won't work in case when there was no animation (quick single click)
      // _helper.addEventListener('transitionend', (e)=>{
      //   console.log('[moveHelperToGhost] removing helper');
      //   _helper.parentNode.removeChild(_helper);
      // }, false);
      // ----------------------------------------------------------------------
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
      const {height,width} = this.helper.rect;  // there was = this.container.boundingClientRect;


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

    updatePosition(e){

      // const offset = getOffset(e);                 // page coordinates
      const offset = {x: e.clientX, y: e.clientY};    // client coordinates

      const translate = {
        x: offset.x - this.initialOffset.x,
        y: offset.y - this.initialOffset.y,
      };

      this.helper.node.style[`${vendorPrefix}Transform`] = `translate3d(${translate.x}px,${translate.y}px, 0)`;
    },

    onMove(e){
      this.updatePosition(e);

      if (this.hovered) {
        const ghost = this.ghost.node;

        // TODO: make it track X or Y center depending on container.direction
        const hoveredCenterY = getElementCenter(this.hovered.$el, 'y').y;
        const helperCenterY = getElementCenter(this.helper.node, 'y').y;

        if (helperCenterY < hoveredCenterY) {
          // console.log("[handleSortMove] upper half hovered");
          this.container.$el.insertBefore(ghost, this.hovered.$el);
          this.newLocation = {array: this.container.list, index: this.hovered.index};
        }
        else {
          // console.log("[handleSortMove] lower half hovered");
          this.container.$el.insertBefore(ghost, this.hovered.$el.nextSibling);
          this.newLocation = {array: this.container.list, index: this.hovered.index+1};
        }
      }

      this.autoscroll(e);
    },

    setHelper(){
      const node = this.dragging.$el;
      const clone = node.cloneNode(true);

      this.helper.node = document.querySelector(this.appendTo).appendChild(clone);

      const measures = getElementMeasures(node);
      Object.assign(this.helper.node.style, this.helper.style, measures);

      // it must go before hideSortableGhost
      this.helper.rect = node.getBoundingClientRect();

      // TODO: helperClass should belong to Container or Manager?
      if (this.helper.class)
        this.helper.node.classList.add(...this.helper.class.split(' '));
    },

};


manager.init();
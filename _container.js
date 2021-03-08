
// import {eventManager} from "./_utils"


const ContainerMixin = {
  props: {
    // value:                      { type: Array,   required: true },
    list:                       { type: Array, required: true },
    axis:                       { type: String,  default: 'y' }, // 'x', 'y', 'xy'
    distance:                   { type: Number,  default: 0 },
    pressDelay:                 { type: Number,  default: 0 },
    pressThreshold:             { type: Number,  default: 5 },
    useDragHandle:              { type: Boolean, default: false },
    useWindowAsScrollContainer: { type: Boolean, default: false },
    hideSortableGhost:          { type: Boolean, default: true },
    lockToContainerEdges:       { type: Boolean, default: false },
    lockOffset:                 { type: [String, Number, Array], default: '50%' },
    transitionDuration:         { type: Number,  default: 300 },
    appendTo:                   { type: String,  default: 'body' },
    draggedSettlingDuration:    { type: Number,  default: null },
    lockAxis: String,
    helperClass: String,
    contentWindow: Object,
    shouldCancelStart: {
      type: Function,
      default: (e) => {
        // Cancel sorting if the event target is an `input`, `textarea`, `select` or `option`
        const disabledElements = ['input', 'textarea', 'select', 'option', 'button'];
        return disabledElements.indexOf(e.target.tagName.toLowerCase()) !== -1;
      },
    },
  },

  data(){
    return {
      events: {
        start: this.handleStart,
        move: this.handleMove,
        end: this.handleEnd,
      },
      manager: manager,
    };
  },

  mounted(){
    this.container = this.$el;
    this.document = this.container.ownerDocument || document;
    this._window = this.contentWindow || window;

    eventManager.addListeners(this.container, this.events);
  },

  beforeDestroy(){
    eventManager.removeListeners(this.container, this.events);
  },

  methods: {
    handleStart(e){
      console.log("[handleStart] event!");

      if (e.button === 2) {
        console.log("[handleStart] button===2");
        return false;
      }

      this.handlePress(e);
    },

    onDrop(e,oldLocation,newLocation){
      console.log("[onDrop]");

      arrayMoveElement(oldLocation,newLocation);
    },

    handleSortEnd(e){
      console.log("[handleSortEnd] dragging end");

      // Remove the event listeners if the node is still in the DOM
      if (this.listenerNode) {
        eventManager.removeListeners(this.listenerNode, {move: this.handleSortMove})
        eventManager.removeListeners(this.listenerNode, {end: this.handleSortEnd})
      }

      // Remove the helper from the DOM
      this.manager.helper.parentNode.removeChild(this.manager.helper);

      // Move the preview node to hidden div
      this.manager.previewNode.parentNode.appendChild(this.manager.previewNode.node);


      console.log("oldLocation: ", this.manager.oldLocation);
      console.log("newLocation: ", this.manager.newLocation);
      this.onDrop(e,this.manager.oldLocation, this.manager.newLocation);

      // to clear autoscroll
      this.stopAutoscroll();

      // this.manager.container.$forceUpdate();
      if (this.hideSortableGhost) {
        this.manager.dragging.$el.style.display=this.manager.cache.display;
      }

      this.manager.init();
    },


    handlePress(e){

      if (!this.manager.hovered) {
        // it is a scroll
        // or click outside an item
        return;
      }

      this.manager.dragging = this.manager.hovered;
      this.manager.oldLocation = {array: this.list, index: this.manager.hovered.index};
      this.manager.newLocation = Object.assign({},this.manager.oldLocation);

      // this.manager.setScrollContainer();


      const node = this.manager.dragging.$el;
      const clone = node.cloneNode(true);

      const {
        axis,
        helperClass,
        hideSortableGhost,
        appendTo,
      } = this.$props;

      // this.offsetEdge = this.getEdgeOffset(node);
      this.initialOffset = getOffset(e);


      // ------------------------------------------ helper --------------
      const measures = getElementMeasures(node);

      const helper = document.querySelector(this.appendTo).appendChild(clone);
      helper.style.position = 'fixed';
      helper.style.boxSizing = 'border-box';
      helper.style.pointerEvents = 'none';
      // helper.style.zIndex = 100;

      Object.assign(helper.style, measures);

      // it must go before hideSortableGhost
      this.boundingClientRect = node.getBoundingClientRect();


      if (this.hideSortableGhost) {
        // this.sortableGhost = node;
        // node.style.visibility = 'hidden';
        // node.style.opacity = 0;
        this.manager.cache.display = node.style.display;
        node.style.display = "none";
      }

      if (helperClass) {
        helper.classList.add(...this.helperClass.split(' '));
      }
      this.manager.helper = helper;
      // ----------------------------------------------------------------


      // ----------------------------- scroll --------------------------------
      this._axis = {
        x: axis.indexOf('x') >= 0,
        y: axis.indexOf('y') >= 0,
      };
      // moved to _manager.js
      // --------------------------------------------------------------------




      this.listenerNode = e.touches ? node : this._window;
      eventManager.addListeners(this.listenerNode, {move: this.handleSortMove});
      eventManager.addListeners(this.listenerNode, {end: this.handleSortEnd});

      // [Note]: this is apparently to provide easy customization
      // of what should happen on DnD events
      // this.$emit('sort-start', {event: e, node});
      // this.$emit('sort-start', {event: e, node, index, collection});

    },

    handleSortMove(e) {
      e.preventDefault(); // Prevent scrolling on mobile

      // console.log("[handleSortMove]");

      this.updatePosition(e);

      if (this.manager.hovered) {
        const preview = this.manager.previewNode.node;

        const hoveredCenterY = getElementCenter(this.manager.hovered.$el, 'y').y;
        const helperCenterY = getElementCenter(this.manager.helper, 'y').y;
        if (helperCenterY < hoveredCenterY) {
          console.log("[handleSortMove] upper half hovered");
          // console.log({pos: pos.y, center: hoveredRect.centerY});

          this.manager.container.$el.insertBefore(preview, this.manager.hovered.$el);
          this.manager.newLocation = {array: this.manager.container.list, index: this.manager.hovered.index};
        }
        else {
          console.log("[handleSortMove] lower half hovered");
          this.manager.container.$el.insertBefore(preview, this.manager.hovered.$el.nextSibling);
          this.manager.newLocation = {array: this.manager.container.list, index: this.manager.hovered.index+1};
        }
      }

      // this.animateNodes();
      this.autoscroll(e);

      // this.$emit('sort-move', { event: e });
    },

    updatePosition(e){

      const offset = getOffset(e);
      const translate = {
        x: offset.x - this.initialOffset.x,
        y: offset.y - this.initialOffset.y,
      };

      // console.log("[updatePos] offset: ", offset);
      // console.log("[updatePos] translate: ", translate);

      this.translate = translate;

      this.manager.helper.style[
        `${vendorPrefix}Transform`
      ] = `translate3d(${translate.x}px,${translate.y}px, 0)`;
    },

    stopAutoscroll(){
      if (this.manager.intervals.container) {
        clearInterval(this.manager.intervals.container);
        this.manager.intervals.container = null;
      }
      if (this.manager.intervals.window) {
        clearInterval(this.manager.intervals.window);
        this.manager.intervals.window = null;
      }
    },

    autoscroll(e) {

      if (!this.manager.dragging)
        return;

      const pointer = {
        docX: e.pageX,
        docY: e.pageY,
        x: e.clientX,
        y: e.clientY,
      };
      const acceleration = {x: 10, y: 10};
      const scrollRequest = {};
      const scrollRequestWindow = {};

      const {height,width} = this.boundingClientRect;

      // Container scroll
      scrollRequest.x = acceleration.x * calcScroll(pointer.docX, this.manager.scroll.edges.x) / width;
      scrollRequest.y = acceleration.y * calcScroll(pointer.docY, this.manager.scroll.edges.y) / height;

      // Window scroll
      scrollRequestWindow.x = acceleration.x * calcScroll(pointer.x, this.manager.scroll.windowEdges.x) / width;
      scrollRequestWindow.y = acceleration.y * calcScroll(pointer.y, this.manager.scroll.windowEdges.y) / height;


      // console.log("[autoscroll] helper.height: ", height);
      // console.log("[autoscroll] pointer: ", pointer);
      // console.log("[autoscroll] scroll windowEdges: ", this.manager.scroll.windowEdges);
      // console.log("[autoscroll] scrollRequestWindow: ", scrollRequestWindow);


      this.stopAutoscroll();

      if (scrollRequest.y || scrollRequest.x) {
        this.manager.intervals.container = setInterval(
          () => {
            this.manager.scroll.container.scrollTop += scrollRequest.y;
            this.manager.scroll.container.scrollLeft += scrollRequest.x;

            // this.animateNodes();
            // node.style[`${vendorPrefix}Transform`] = `translate3d(${translate.x}px,${translate.y}px,0)`;
          },
          5
        );
      }

      // move autoscroll( ) to manager.js

      if (scrollRequestWindow.y || scrollRequestWindow.x) {
        this.manager.intervals.window = setInterval(
          () => {
            this.manager.scroll.window.scrollTop += scrollRequestWindow.y;
            this.manager.scroll.window.scrollLeft += scrollRequestWindow.x;
          },
          5
        );
      }

    },

  },
};
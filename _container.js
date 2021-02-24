
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
    getHelperDimensions: { 
      type: Function,
      default: ({node}) => ({
        width: node.offsetWidth,
        height: node.offsetHeight,
      }),
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

    this.scrollContainer = this.useWindowAsScrollContainer
      ? this.document.body
      : this.$el;

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


      const node = this.manager.dragging.$el;
      const clone = node.cloneNode(true);
      
      const {
        axis,
        helperClass,
        hideSortableGhost,
        useWindowAsScrollContainer,
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
      this.initialScroll = {
        top: this.scrollContainer.scrollTop,
        left: this.scrollContainer.scrollLeft,
      };

      this.initialWindowScroll = {
        top: window.pageYOffset,
        left: window.pageXOffset,
      };

      const containerBoundingRect = this.$el.getBoundingClientRect();

      // const {width, height} = this.boundingClientRect;

      this.translate = {};
        this.minTranslate = {};
        this.maxTranslate = {};

        if (this._axis.x) {
          this.minTranslate.x = (useWindowAsScrollContainer
            ? 0
            : containerBoundingRect.left) -
            this.boundingClientRect.left -
            this.boundingClientRect.width / 2;
          this.maxTranslate.x = (useWindowAsScrollContainer
            ? this._window.innerWidth
            : containerBoundingRect.left + containerBoundingRect.width) -
            this.boundingClientRect.left -
            this.boundingClientRect.width / 2;
        }

        if (this._axis.y) {
          this.minTranslate.y = (useWindowAsScrollContainer
            ? 0
            : containerBoundingRect.top) -
            this.boundingClientRect.top -
            this.boundingClientRect.height / 2 ;
          this.maxTranslate.y = (useWindowAsScrollContainer
            ? this._window.innerHeight
            : containerBoundingRect.top + containerBoundingRect.height) -
            this.boundingClientRect.top -
            this.boundingClientRect.height / 2 ;
        }
      // --------------------------------------------------------------------




      this.listenerNode = e.touches ? node : this._window;
      eventManager.addListeners(this.listenerNode, {move: this.handleSortMove});
      eventManager.addListeners(this.listenerNode, {end: this.handleSortEnd});


      this.sorting = true;
      // this.sortingIndex = index;

      this.$emit('sort-start', {event: e, node});
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
      this.autoscroll();

      // this.$emit('sort-move', { event: e });
    },

    updatePosition(e){
      // const pos = {
      //   x: e.pageX,
      //   y: e.pageY,
      // }

      // this.helper.style.left = pos.x;
      // this.helper.style.top = pos.y;

      const offset = getOffset(e);
      const translate = {
        x: offset.x - this.initialOffset.x,
        y: offset.y - this.initialOffset.y,
      };

      this.translate = translate;

      this.manager.helper.style[
        `${vendorPrefix}Transform`
      ] = `translate3d(${translate.x}px,${translate.y}px, 0)`;
    },

    stopAutoscroll(){
      if (this.autoscrollInterval) {
        clearInterval(this.autoscrollInterval);
        this.autoscrollInterval = null;
        this.isAutoScrolling = false;
      }
    },

    autoscroll() {

      if (!this.manager.dragging)
        return;

      const translate = this.translate;
      const direction = {
        x: 0,
        y: 0,
      };
      const speed = {
        x: 1,
        y: 1,
      };
      const acceleration = {
        x: 10,
        y: 10,
      };

      const {height,width} = this.boundingClientRect;

      if (translate.y >= this.maxTranslate.y - height / 2) {
        direction.y = 1; // Scroll Down
        speed.y = acceleration.y * Math.abs((this.maxTranslate.y - height / 2 - translate.y) / height);
      } else if (translate.x >= this.maxTranslate.x - width / 2) {
        direction.x = 1; // Scroll Right
        speed.x = acceleration.x * Math.abs((this.maxTranslate.x - width / 2 - translate.x) / width);
      } else if (translate.y <= this.minTranslate.y + height / 2) {
        direction.y = -1; // Scroll Up
        speed.y = acceleration.y * Math.abs((translate.y - height / 2 - this.minTranslate.y) / height);
      } else if (translate.x <= this.minTranslate.x + width / 2) {
        direction.x = -1; // Scroll Left
        speed.x = acceleration.x * Math.abs((translate.x - width / 2 - this.minTranslate.x) / width);
      }

      // console.log("[autoscroll] direction: ", direction);
      // console.log("[autoscroll] translate: ", translate);
      // console.log("[autoscroll] speed: ", speed);
      // console.log("[autoscroll] helper.height: ", height);
      // console.log("[autoscroll] this.minTranslate: ", this.minTranslate);
      // console.log("[autoscroll] this.maxTranslate: ", this.maxTranslate);
      // console.log("[autoscroll] this.initialOffset: ", this.initialOffset);


      this.stopAutoscroll();

      if (direction.x !== 0 || direction.y !== 0) {
        this.autoscrollInterval = setInterval(
          () => {
            this.isAutoScrolling = true;
            const offset = {
              left: 1 * speed.x * direction.x,
              top: 1 * speed.y * direction.y,
            };
            this.scrollContainer.scrollTop += offset.top;
            this.scrollContainer.scrollLeft += offset.left;
            this.translate.x += offset.left;
            this.translate.y += offset.top;

            // this.animateNodes();
            // node.style[`${vendorPrefix}Transform`] = `translate3d(${translate.x}px,${translate.y}px,0)`;

          },
          5
        );
      }
    },

  },
};
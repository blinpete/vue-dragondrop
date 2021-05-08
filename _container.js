
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


      console.log("oldLocation: ", this.manager.oldLocation);
      console.log("newLocation: ", this.manager.newLocation);


      // to clear autoscroll
      this.manager.stopAutoscroll();



      this.manager.moveHelperToGhost();

      setTimeout(()=>{
        this.onDrop(e,this.manager.oldLocation, this.manager.newLocation);

        // ghost
        this.hideSortableGhost && this.manager.revealGhost();

        this.manager.init();
      }, 200);

    },


    handlePress(e){

      console.log('[handlePress]');

      if (!this.manager.hovered) {
        console.log('[handlePress] wrong click');

        // it is a scroll click or click outside an item
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
        appendTo,
      } = this.$props;

      // this.offsetEdge = this.getEdgeOffset(node);
      this.manager.setInitialOffset(e);


      // ------------------------------------------ helper --------------
      const measures = getElementMeasures(node);

      const helper = document.querySelector(this.appendTo).appendChild(clone);
      helper.style.position = 'fixed';
      helper.style.boxSizing = 'border-box';
      helper.style.pointerEvents = 'none';
      helper.style.zIndex = 100;

      Object.assign(helper.style, measures);

      // it must go before hideSortableGhost
      this.manager.helperRect = node.getBoundingClientRect();

      this.manager.setGhost(node);
      this.hideSortableGhost && this.manager.hideGhost();

      if (helperClass) {
        helper.classList.add(...this.helperClass.split(' '));
      }
      this.manager.helper = helper;
      // ----------------------------------------------------------------


      this.listenerNode = e.touches ? node : this._window;
      eventManager.addListeners(this.listenerNode, {move: this.handleSortMove});
      eventManager.addListeners(this.listenerNode, {end: this.handleSortEnd});

      // [Note]: this is to provide easy customization
      // of what should happen on DnD events
      // this.$emit('sort-start', {event: e, node});
      // this.$emit('sort-start', {event: e, node, index, collection});

      this.handleSortMove(e);   // to get a preview node at once
    },

    handleSortMove(e) {
      e.preventDefault(); // Prevent scrolling on mobile

      // console.log("[handleSortMove]");

      this.updatePosition(e);

      if (this.manager.hovered) {
        const ghost = this.manager.ghost.node;

        // TODO: make it track X or Y center depending on container.direction
        const hoveredCenterY = getElementCenter(this.manager.hovered.$el, 'y').y;
        const helperCenterY = getElementCenter(this.manager.helper, 'y').y;

        if (helperCenterY < hoveredCenterY) {
          console.log("[handleSortMove] upper half hovered");
          this.manager.container.$el.insertBefore(ghost, this.manager.hovered.$el);
          this.manager.newLocation = {array: this.manager.container.list, index: this.manager.hovered.index};
        }
        else {
          console.log("[handleSortMove] lower half hovered");
          this.manager.container.$el.insertBefore(ghost, this.manager.hovered.$el.nextSibling);
          this.manager.newLocation = {array: this.manager.container.list, index: this.manager.hovered.index+1};
        }
      }

      // this.animateNodes();
      this.manager.autoscroll(e);

      // this.$emit('sort-move', { event: e });
    },

    updatePosition(e){

      // const offset = getOffset(e);
      const offset = {x: e.clientX, y: e.clientY};

      const translate = {
        x: offset.x - this.manager.initialOffset.x,
        y: offset.y - this.manager.initialOffset.y,
      };

      // console.log("[updatePos] offset: ", offset);
      // console.log("[updatePos] translate: ", translate);

      this.translate = translate;

      this.manager.helper.style[`${vendorPrefix}Transform`] = `translate3d(${translate.x}px,${translate.y}px, 0)`;
    },

  },
};
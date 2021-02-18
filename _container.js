
// import {eventManager} from "./_utils"


const ContainerMixin = {
  props: {
    // value:                      { type: Array,   required: true },
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

    handlePress(e){
      this.manager.dragging = true;
      const node = this.manager.node;
      const clone = node.cloneNode(true);
      
      const {
        axis,
        getHelperDimensions,
        helperClass,
        hideSortableGhost,
        useWindowAsScrollContainer,
        appendTo,
      } = this.$props;

      // this.offsetEdge = this.getEdgeOffset(node);
      this.initialOffset = this.getOffset(e);


      // ------------------------------------------ helper --------------
      const measures = getElementMeasures(node);
      
      const helper = document.querySelector(this.appendTo).appendChild(clone);
      helper.style.position = 'fixed';
      helper.style.boxSizing = 'border-box';
      helper.style.pointerEvents = 'none';

      Object.assign(helper.style, measures);
      // helper.style.top    = 
      // helper.style.left   =
      // helper.style.width  =
      // helper.style.height =

      if (this.hideSortableGhost) {
        this.sortableGhost = node;
        // node.style.visibility = 'hidden';
        // node.style.opacity = 0;
        node.style.display = "none"
      }

      if (helperClass) {
        helper.classList.add(...this.helperClass.split(' '));
      }
      this.manager.helper = helper;
      // ----------------------------------------------------------------


      this.listenerNode = e.touches ? node : this._window;
      eventManager.move.forEach(eventName =>
        this.listenerNode.addEventListener(
          eventName,
          this.handleSortMove,
          false
        ));
      eventManager.end.forEach(eventName =>
        this.listenerNode.addEventListener(
          eventName,
          this.handleSortEnd,
          false
        ));

      this.sorting = true;
      // this.sortingIndex = index;

      this.$emit('sort-start', {event: e, node});
      // this.$emit('sort-start', {event: e, node, index, collection});

    },

    handleSortMove(e) {
      e.preventDefault(); // Prevent scrolling on mobile

      console.log("[handleSortMove]");

      this.updatePosition(e);
      // this.animateNodes();
      // this.autoscroll();

      // this.$emit('sort-move', { event: e });
    },

    getOffset(e) {
      return {
        x: e.touches ? e.touches[0].pageX : e.pageX,
        y: e.touches ? e.touches[0].pageY : e.pageY,
      };
    },

    updatePosition(e){
      // const pos = {
      //   x: e.pageX,
      //   y: e.pageY,
      // }

      // this.helper.style.left = pos.x;
      // this.helper.style.top = pos.y;

      const offset = this.getOffset(e);
      const translate = {
        x: offset.x - this.initialOffset.x,
        y: offset.y - this.initialOffset.y,
      };

      this.translate = translate;

      this.manager.helper.style[
        `${vendorPrefix}Transform`
      ] = `translate3d(${translate.x}px,${translate.y}px, 0)`;
    },

  },
};

import {eventManager, arrayMoveElement} from "./utils"
import {manager} from "./Manager"



export const ContainerMixin = {
  props: {
    list:                       { type: Array, required: true },
    axis:                       { type: String,  default: 'y' }, // 'x', 'y', 'xy'

    hideSortableGhost:          { type: Boolean, default: true },

    // distance:                   { type: Number,  default: 0 },
    // pressDelay:                 { type: Number,  default: 0 },
    // pressThreshold:             { type: Number,  default: 5 },

    // useDragHandle:              { type: Boolean, default: false },
    // lockToContainerEdges:       { type: Boolean, default: false },
    // lockOffset:                 { type: [String, Number, Array], default: '50%' },
    // lockAxis: String,

    // transitionDuration:         { type: Number,  default: 300 },
    // draggedSettlingDuration:    { type: Number,  default: null },

    // contentWindow: Object,
    // shouldCancelStart: {
    //   type: Function,
    //   default: (e) => {
    //     // Cancel sorting if the event target is an `input`, `textarea`, `select` or `option`
    //     const disabledElements = ['input', 'textarea', 'select', 'option', 'button'];
    //     return disabledElements.indexOf(e.target.tagName.toLowerCase()) !== -1;
    //   },
    // },

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

      // to clear autoscroll
      this.manager.stopAutoscroll();

      this.manager.moveHelperToGhost();

      // save Locations in this closure
      const {oldLocation, newLocation} = this.manager;

      // it kills old/new Locations, dragging, hovered and all the stuff we don't need any longer..
      // but it keeps ghost, so we can call init() before revealGhost()
      // Note: cannot call init() from inside setTimeout() for it overwrites 'hovered' field with null
      this.manager.init();

      setTimeout(()=>{
        this.onDrop(e, oldLocation, newLocation);
        this.hideSortableGhost && this.manager.revealGhost();
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


      // this.offsetEdge = this.getEdgeOffset(node);
      this.manager.setInitialOffset(e);

      this.manager.setHelper();

      this.manager.setGhost();
      this.hideSortableGhost && this.manager.hideGhost();


      this.listenerNode = e.touches ? this.manager.helper.node : this._window;
      eventManager.addListeners(this.listenerNode, {move: this.handleSortMove});
      eventManager.addListeners(this.listenerNode, {end: this.handleSortEnd});

      // [Note]: this is to provide easy customization
      // of what should happen on DnD events
      // this.$emit('sort-start', {event: e, node});
      // this.$emit('sort-start', {event: e, node, index, collection});
    },

    handleSortMove(e) {
      e.preventDefault(); // Prevent scrolling on mobile
      // console.log("[handleSortMove]");

      this.manager.onMove(e);

      // this.$emit('sort-move', { event: e });
    },

  },
};
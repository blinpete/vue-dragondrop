
// import {eventManager} from "./_utils"


const ElementMixin = {
  // inject: ['manager'],
  props: {
    index: Number,
    item: Object,
  },

  data(){
    return {
      manager: manager,
      events: {
        enter: this.onHover,
        leave: this.onLeave,
      },
    };
  },

  mounted(){
    eventManager.addListeners(this.$el, this.events);
  },

  beforeDestroy(){
    eventManager.removeListeners(this.$el, this.events);
  },

  methods: {
    onLeave(e){
      console.log("[onLeave] item.id: ", this.item.id);
      this.manager.hovered = null;
    },
    onHover(e){
      console.log("[onHover] item.id: ", this.item.id);
      // console.log("[onHover] item.id: ", this.$props);

      if (this.manager.dragging) {
        if (this.$parent.groupName !== this.manager.groupName) {
          console.log("group names are not equal... ending onHover");
          return;
        }

        const hs = this.manager.helper.style;
        const preview = this.manager.previewNode.node;


        // --------------------------- preview styling -----------
        const pWidth = this.$el.offsetWidth;
        const hArea = getCSSPixelValue(hs.width)*getCSSPixelValue(hs.height);
        preview.style.height = hArea/pWidth + 'px';

        // TODO: resizing a helper on the fly 
        // commented for now cause it requires translating a helper to keep it under a cursor
        // hs.width = pWidth+'px';
        // preview.style.height  = hs.height; 
        
        preview.style.width  = pWidth+'px'; 
        // -------------------------------------------------------

      }

      // this.manager.hovered = {node: this.$el, index: this.index};
      this.manager.hovered = this;
      this.manager.container = this.$parent;

    },
  },
};

// import {eventManager} from "./_utils"


const ElementMixin = {
  // inject: ['manager'],
  props: {
    index: Number,
  },

  data(){
    return {
      manager: manager,
      events: {
        hover: this.onHover
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
    onHover(e){
      console.log("[onHover] item.id: ", this.index);

      if (this.manager.dragging) {
        console.log("[onHover] adding ::before element");
        console.log("[onHover] classList: ",this.manager.node.classList);

        if (this.$parent.groupName !== this.manager.groupName) {
          return;
        }

        const hs = this.manager.helper.style;
        const preview = this.manager.previewNode.node;

        preview.style.width  = this.$el.offsetWidth+'px'; 
        preview.style.height = hs.width*hs.height/preview.st
        this.$parent.$el.insertBefore(preview, this.$el);
      }

      this.manager.activeIndex = this.index;
      this.manager.node = this.$el;

    },
  },
};

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

      }

      this.manager.hovered = this;
      this.manager.updateContainer(this.$parent);
    },
  },
};
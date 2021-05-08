
// import {ContainerMixin} from "./_container.js"

Vue.component("Container",{
    mixins: [ContainerMixin],
    render(h){
        return h('ul', {class: ["list"]}, this.$slots.default);
    },
});


Vue.component("Draggable",{
    mixins: [ElementMixin],
    render(h){
        return h('li', {class: ["item", "unselectable"]}, this.$slots.default);
    },
});
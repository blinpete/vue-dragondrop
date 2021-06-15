
import {ContainerMixin} from "./Container"
import {ElementMixin} from "./Element"

export const vddContainer = {
    name: 'Container',
    mixins: [ContainerMixin],
    render(h){
        return h('ul', {class: ["list"], style: this.style}, this.$slots.default);
    },
};


export const vddElement = {
    name: 'Draggable',
    mixins: [ElementMixin],
    render(h){
        return h('li', {class: ["item", "unselectable"], style: this.style}, this.$slots.default);
    },
};
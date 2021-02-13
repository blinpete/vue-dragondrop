

const eventEmitterMap = {
    'drag-start': 'onDragStart',
    'drag-end': 'onDragEnd',
    'drag-enter': 'onDragEnter',
    'drag-leave': 'onDragLeave',
    'drop-ready': 'onDropReady',
    'drop': 'onDrop',
};


Vue.Component("Container", {
    props: {
        behaviour: String,
        groupName: String,
        orientation: String,
        dragHandleSelector: String,
        nonDragAreaSelector: String,
        dragBeginDelay: Number,
        animationDuration: Number,
        autoScrollEnabled: { type: Boolean, default: true },
        removeOnDropOut: { type: Boolean, default: false },
        lockAxis: String,
        dragClass: String,
        dropClass: String,
        'drag-start': Function,
        'drag-end': Function,
        'drag-enter': Function,
        'drag-leave': Function,
        'drop-ready': Function,
        'drop': Function,
        getChildPayload: Function,
        shouldAnimateDrop: Function,
        shouldAcceptDrop: Function,
        getGhostParent: Function,
        dropPlaceholder: [Object, Boolean],
        tag: {
            validator: validateTagProp,
            default: 'div',
        },
    },
});
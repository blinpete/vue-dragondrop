

const eventManager = {
    start: ['touchstart', 'mousedown'],
    move: ['touchmove', 'mousemove'],
    end: ['touchend', 'touchcancel', 'mouseup'],

    addListeners(el, events){
        for (const key in events) {
            this[key].forEach(name => {
                // console.log("[addListeners] adding", name);

                el.addEventListener(name, events[key], false);
            });
        }
    },

    removeListeners(el, events){
        for (const key in events) {
            this[key].forEach(name => el.removeEventListener(name, events[key]));
        }
    },
};



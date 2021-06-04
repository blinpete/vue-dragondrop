
const lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

function dummyLists(lengths, mode='text'){

    let colors = [
        '#6d8fa2', // blue
        '#73a48a', // green
        '#b07272', // red blood

        '#5b7f94', // blue
        '#5a9878', // green

        '#519e70', // green
        '#6996a0', // blue

        '#74b176', // green dragon
        '#669fc0', // blue drop
        '#b56b6b', // red blood
    ];

    var lists = [];
    for (var i in lengths) {
        let color = colors[i%colors.length];

        lists.push( {id: +i+1, items: []} );
        for (k in Array(lengths[i]).fill()) {
            var id = +k+100*(+i+1);
            var height = 20+parseInt(80*Math.random())+'px';
            var item = {
                id: id,
                text: `#${id}`,
            };

            if (mode === 'text')
                item.text += ' '+lorem.substr(0,20+parseInt(100*Math.random()));
            else
                item.style = {
                    height: height,
                    lineHeight: height,
                    backgroundColor: color,
                    textAlign: 'center',
                    paddingBottom: '8px',
                    paddingLeft: '5px',
                    color: 'rgba(216, 216, 216, 0.342)',
                };

            lists[i].items.push(item);
        }
    }

    return lists;
}

const lists = dummyLists([20,15], mode='colors');


window.app = new Vue({
    el: "#app",
    delimiters: ["@{", "}"],
    data: {
        lists: lists,
        manager: manager,
    },

    mounted(){

    },

    methods: {

    },
});

const lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

function dummyLists(){

    var lists = [];
    for (var i in arguments) {
        lists.push( {id: +i+1, items: []} );
        for (k in Array(arguments[i]).fill()) {
            var id = +k+100*(+i+1);
            lists[i].items.push({id: id, text: `item ${id} `+lorem.substr(0,parseInt(100*Math.random()))})
        }
    }

    return lists;
}

const lists = dummyLists(15,25);


window.app = new Vue({
    el: "#app",
    delimiters: ["@{", "}"],
    data: {
        lists: lists,
    },

    mounted(){
        
    },

    methods: {

    },
});
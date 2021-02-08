

const lists = [
    {
        id: 1, 
        items: [
            {id: 11, text: "item 11"},
            {id: 12, text: "item 12"},
            {id: 13, text: "item 13 some text some text some text"},
            {id: 14, text: "item 14"},
        ]
    },
    {
        id: 2, 
        items: [
            {id: 21, text: "item 21"},
            {id: 22, text: "item 22 some very very long text here and some more text and text again and again"},
            {id: 23, text: "item 23"},
            {id: 24, text: "item 24"},
        ]
    },
];


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
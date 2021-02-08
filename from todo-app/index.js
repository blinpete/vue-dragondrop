
// import {dbtools} from "./db.js";

// variables
userId = 'developers';


function setTodos(data){
    console.log(data);
    window.app.todos = data.todos;

    console.log({"window.app.todos": window.app.todos});
}


function sizeTheOverlays() {
    $(".overlay").resize().each(function() {
    var h = $(this).parent().outerHeight();
    var w = $(this).parent().outerWidth();
    $(this).css("height", h);
    $(this).css("width", w);
  });
};


// patch indexedDB implementation (throw an error if iDB is not supported)
dbtools.patchIDB();


const vueConfig = {
    el: '#app',
    data: {
        tasks: dbtools.tasks,
        tasksModified: new Date(),
        lists: dbtools.lists,
        tags: dbtools.tags,
        // tags: [
        //     {name: "feature", color: ""},
        //     {name: "bug", color: ""},
        // ],
        // todos: [ {name: "list-1", items: ['item 0', 'item 1']}],
        
        newListTemplate: {
            name: '',
            query: {index: "tags", values: [], logic: [], ranges: []},
            ids: []
        },
        newList: {
            name: '',
            query: {index: "tags", values: [], logic: [], ranges: []},
            ids: []
        },
        selectedTags: new Set(),
        tagFilterText: "",

        currentView: 'cards',

        groupViewTemplates: {
            'color-list': `
                <div class="color-list">
                    <section class="color" v-for="todoList in todos" v-bind:key="todoList.name" :style="{background: todoList.color}">
                        <h2 class="name"> @{todoList.name} </h2>
                        <todo-list :todoList="todoList"> </todo-list>
                    </section>
                </div>`,
            
            'cards': `
                <b-card-group columns>
                    <todo-list :todoList="todoList" :tasks="tasks" v-for="todoList in todos" :key="todoList.id"> </todo-list>            
                </b-card-group>`
        }
        
    },

    created() {
        console.log("root Vue instance created...");
    },

    watch: {
        tasksModified: {
            deep: true,
            handler(newTime){
                dbtools.updateTasks();
            },
        },
    },

    computed: {
        groupViewTemplate: function() {
            console.log({'current-group-view': this.currentView});
            return this.groupViewTemplates[this.currentView]
        }
    },

    delimiters: ['@{','}'],

    methods: {

        addTag(tag){
            this.tags.push(tag);
        },

        testQuery(query) {

            let results = [];

            // transaction
            // var store = db.transaction(query.index, "read").objectStore(query.index);
            
            // queries
            // store.getAll().onsuccess = (event) => {results.push(event.target.result)};

            let tasks = Object.values(this.tasks);

            let conditions = {
                tags: task => task.tags.includes(query.value),
                location: task => task.location === query.value,
            }

            let response;

            // tags
            response = tasks.filter( conditions[query.index] );

            return response;
        },

        okNewListModal(event){
            event.preventDefault();     // to prevent modal closing
            this.newList.name = this.newList.name.trim();
            this.newList.query.values = [...this.selectedTags].map(tag => tag.id);

            if (!this.isValidList(this.newList)) return
            else {
                this.addTodoList();
                this.$nextTick(() => this.$bvModal.hide('new-list-modal'));
            }
        },
        addTodoList() {
            this.selectedTags = new Set();
            this.newList.id = 1 + Math.max(-1,...this.lists.map(x => x.id));
            this.lists.push( this.newList );
            this.newList = this.newListTemplate;
        },
        select(tag){
            this.selectedTags.has(tag) ? this.selectedTags.delete(tag) : this.selectedTags.add(tag);
            this.selectedTags = new Set(this.selectedTags);     // to make Vue track the Set
        },
        isValidList(list){
            return list.name && list.query.values.length;
        },

        deleteTodoList: function(todoList){
            if (!this.lists.includes(todoList)) {
                console.log({doesNOTincludes: todoList});
                return
            }
            else {
                this.lists.splice(this.lists.indexOf(todoList),1);
                console.log({list_removed: todoList});
                dbtools.deleteList(todoList);
            }
        },

        showStorage: dbtools.showStorage,

    },

};


dbtools.connectIDB().then(
    db => {
        dbtools.getTodos();

        window.app = new Vue(vueConfig);
    },
    error => {console.log(error); alert('Cannot connect to indexedDB')}
);

console.log({app: app});
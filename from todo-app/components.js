

Vue.component('todo-list', {
    props: ['todoList', 'tasks'],
    template: `
        <b-card no-body class="list-card" text-variant="dark">
            <b-card-header class="d-flex justify-content-between card-periphery">
                <b-input v-if="isNameEdited" v-model="todoList.name" ref="newname" @blur="onBlurListName" @keyup.enter="onBlurListName" autofocus></b-input>
                <span v-else @click="isNameEdited = true">@{todoList.name}</span>

                <b-button class="icon-btn" size="sm" :id="id">
                    <i class="fas fa-ellipsis-v"></i>
                </b-button>
                <b-popover :target="id" triggers="hover" placement="auto">
                    <h1>List settings</h1>
                    <hr class="mt-1 mb-1">
                    <b-list-group flush>
                        <b-list-group-item href="#" variant="light" @click="deleteMe(todoList)">
                            <i class="fas fa-trash"></i> Delete
                        </b-list-group-item>
                        <b-list-group-item href="#" variant="light" @click="isNameEdited = true">
                            <i class="fas fa-pen"></i> Edit
                        </b-list-group-item>
                        <b-list-group-item href="#" variant="light" @click="showDone=!showDone">
                            <i class="fas" :class="showDone ? 'fa-eye' : 'fa-eye-slash'"></i> Show done
                        </b-list-group-item>
                        <b-list-group-item href="#" variant="light" @click="focused=true">
                            <i class="fas fa-plus"></i> Add task
                        </b-list-group-item>
                    </b-list-group>
                </b-popover>
            </b-card-header>
            
            <b-list-group ref="listing" class="tasks" @mouseover="" @mouseleave="" :key="modified" flush>
                <!-- <task v-for="task in todoList.tasks" :key="task" :task="task"></task> -->
                <task v-for="id in todoList.ids" v-if="!tasks[id].removed && (!tasks[id].done||showDone)" :tasks="tasks" :key="tasks[id].modified" :id="id"></task>
                
                <b-list-group-item class="task-edited" href="#" v-if="empty||focused" variant="light">
                    <!-- <b-input v-model="newItem" ref="newitem" @keyup.enter="addItem" @keyup.esc="focused=false" @focus="focused=true" @blur="focused=false" autofocus></b-input> -->
                    
                    <b-form-textarea
                        v-model="newItem" ref="newitem"
                        @keydown.enter.exact.prevent="addItem" @keydown.ctrl.enter="newLine" 
                        @keyup.esc="focused=false;newItem=''" @focus="focused=true" @blur="focused=false" autofocus
                        rows="2" max-rows="6" style="overflow: hidden; resize: vertical;"
                        placeholder="My new task..."
                    ></b-form-textarea>
                </b-list-group-item>
            </b-list-group>
            <b-card-footer href="#" class="card-periphery p-1">
                <b-button class="text-right w-100 icon-btn" @click="focused=true">
                    Add task
                    <i class="fas fa-plus"></i>
                </b-button>
            </b-card-footer>
        </b-card>`,
    delimiters: ['@{', '}'],
    
    data() {
        return {
            newItem: "", 
            hover: false, focused: false, id: `${this.todoList.name}-more`, isNameEdited: false,
            showDone: true,
            nameBuffer: this.todoList.name,
            modified: new Date().toString(),
        }
    },

    mounted(){
        
        // to style the element that is now on the fly
        this.$refs.listing.addEventListener("dragstart", evt => {
            console.log("[dregstart]", evt.target);
            evt.target.classList.add("flying");
        });
        this.$refs.listing.addEventListener("dragend", evt => {
            evt.target.classList.remove("flying");
        });

        // dragover event
        this.$refs.listing.addEventListener("dragover", evt => {
            evt.preventDefault();
            // console.log("[dregover] elm hovered: ", evt.target); 
            
            const hoveredElm = evt.target;
            if (!hoveredElm.classList.contains("task")){
                console.log("not a task hovered");
                return;
            }
            const selectedElm = document.querySelector(".flying");

            const isMoveable = selectedElm !== hoveredElm && hoveredElm.classList.contains("task");

            if (!isMoveable) {
                console.log("[dragover] is not moveable");
                return;
            }

            const nextElm = (hoveredElm === selectedElm.nextElementSibling) 
            ? selectedElm.nextElementSibling 
            : selectedElm;
            console.log("[dragover] nextElm: ", nextElm);

            // this.$refs.listing.insertBefore(selectedElm, nextElm);
            const box = document.querySelector(".card-footer");
            box.insertBefore(selectedElm, nextElm);
        });
    },

    beforeDestroy(){
        this.$refs.listing.removeEventListener("dragstart");
        this.$refs.listing.removeEventListener("dragend");
    },

    computed: {
        empty(){
            // return this.todoList.tasks.length === 0;
            console.log({todoList: this.todoList});
            console.log({length: this.todoList.ids.length});
            console.log({tasks: this.tasks});

            return this.todoList.ids.length === 0;
        },
    },

    watch: {
        // focused: function (value) {
        //         // this.$nextTick();
        //         console.log( {focused_watcher: value} )
        //         console.log( {this_$refs: this.$refs} )
        //         value ? this.$refs.newitem.focus() : this.$refs.newitem.blur();
        //     }
        "todoList.name": function(newVal,oldVal){
            console.log("[todoList.name watcher]", this.nameBuffer);
        },
        
    },

    methods: {
        addItem() {
            this.newItem = this.newItem.trim();

            if (!this.newItem) return
            else {
                // add item
                var newId = 1 + Math.max( -1, ...Object.keys(this.tasks) );
                
                // window.app.tasks[newId] = {
                this.tasks[newId] = {
                    id: newId,
                    text: this.newItem, done: false,
                    priority: 0, tags: this.todoList.query.values,
                    created: new Date().toString(), modified: new Date().toString(),
                };

                // add task to the list manually
                // this.todoList.extra_ids.push(newId);

                window.app.tasksModified = new Date().toString();
                
                // clear input 
                this.newItem = '';
                
                console.log(this.todoList);
                // console.log(this.todos); // undefined

                // focus on the next new item
                // this.$refs.newitem.focus();
            }
        },
        deleteMe(todoList){
            console.log({delete_me: todoList});
            console.log({root: this.$root});
            this.$root.deleteTodoList(todoList);
        },
        deleteTask(task){
            if ( !this.tasks.hasOwnProperty(task.id) ) {
                console.log({doesNOTincludes: task});
                return
            }
            else {
                task.removed = true;
                this.modified = task.modified = new Date().toString();
                dbtools.updateTask(task);

                console.log({task_removed: task});
            }
        },
        onBlurListName(){
            this.isNameEdited = false;
            if (this.nameBuffer !== this.todoList.name) {
                this.nameBuffer = this.todoList.name;
                dbtools.putList(this.todoList);
            }
        },

        newLine(e) {
            let caret = e.target.selectionStart;
            e.target.setRangeText("\n", caret, caret, "end");
            this.newItem = e.target.value;
        },
    }
});


Vue.component('task', {
    props: ['id', 'tasks'],
    template: `
        <b-list-group-item
            href="#" :class="{done: task.done, 'task-edited': isEdited}"
            class="task d-flex" variant="light" 
            @mouseover="hovered=true" @mouseleave="hovered=false" @dblclick="isEdited=true"
            draggable="true"
            :id="id"
        >
            <!-- <b-input v-if="isEdited" v-model="inputText" ref="newtext" @keyup.enter="saveChange" @keyup.esc="dropChange" @focus="focused=true" @blur="keepChange" autofocus></b-input> -->
            
            <b-form-textarea
                v-if="isEdited"
                v-model="inputText" ref="newtext"
                @keydown.enter.exact="saveChange" @keydown.ctrl.enter.exact="newLine" @keyup.esc="dropChange" @focus="focused=true" @blur="keepChange" autofocus
                rows="3" max-rows="6" style="overflow-y: hidden; resize: yes;"
            ></b-form-textarea>

            <span v-else
                style="hyphens: auto; -webkit-hyphens: auto; -moz-hyphens: auto;"
                v-html="renderText"
            ></span>
            

            <div v-if="hovered && !isEdited" class="overlay">
                <div class="close px-1">
                    <b-button class="text-muted p-1" size="sm" @click="isEdited=true;" variant="light">
                        <i class="fas fa-pen"></i>
                    </b-button>
                    <b-button class="text-muted p-1" size="sm" @click="task.done=!task.done;task.modified=new Date().toString();" variant="light">
                        <i class="fas fa-check"></i>
                    </b-button>
                    <b-button class="text-muted p-1" size="sm" @click="deleteMe(task)" variant="light">
                        <i class="fas fa-trash"></i>
                    </b-button>
                </div>
            </div>
        </b-list-group-item>
    `,
    delimiters: ['@{', '}'],
    
    data() {
        return {
            inputText: this.tasks[this.id].text,
            focused: false, isEdited: false, hovered: false,
            task: this.tasks[this.id],
        }
    },

    methods: {
        saveChange(){
            this.tasks[this.id].text = this.inputText;
            this.isEdited = false;
        },
        dropChange(){
            this.inputText = this.tasks[this.id].text;
            this.isEdited = false;
        },
        keepChange(){
            this.focused = false;
            this.isEdited = false;
        },
        deleteMe(task){
            console.log({parent: this.$parent});
            this.$parent.deleteTask(task);
        },
        
        newLine(e) {
            let caret = e.target.selectionStart;
            e.target.setRangeText("\n", caret, caret, "end");
            this.inputText = e.target.value;
        }
    },

    watch: {
        task: {
            deep: true,
            handler: function(updatedTask){
                dbtools.updateTask(updatedTask);
            }
        },
    },

    computed: {
        renderText(){
            var converter = new showdown.Converter(),
            
            text = this.tasks[this.id].text;
            html = converter.makeHtml(text);
            
            // console.log("text before: "+ html);
            if (html.startsWith('<p>') && html.endsWith('</p>')) {
                html = html.slice(3,-4);
            }
            // console.log("text after: "+ html);

            return html;
        },
    }

});


// Vue.component('todo-list-options', {
//     props: ['todoList'],
//     delimiters: ['@{', '}'],
    
//     created() {
//         this.$options.template = this.template
//         console.log({'$options.template': this.$options.template})
//     },

// })


Vue.component('todo-list-group', {
    props: ['todos', 'template', 'tasks'],
    delimiters: ['@{', '}'],
    
    created() {
        this.$options.template = this.template;
        console.log({'$options.template': this.$options.template});
    },

})

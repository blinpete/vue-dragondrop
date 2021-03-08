
const manager = {

    previewNode: {
        parentId: "__preview_hidden__",
        id: "__preview_node__",
        style: {
            width: '200px',
            height: '80px',
            border: '2px dashed #abc',
            boxSizing: 'border-box',
            margin: '3px 0',
        },
    },

    intervals: {},


    init(){
      this.cache = {};          // to cache something within a DnD action
      this.dragging = null;     // Draggable compo that is dragging

      this.hovered = null;      // Draggable compo that is hovered
      this.container = null;    // Container compo (parent of this.hovered)

      this.oldLocation = null;  // {array, index} where the draggable item taken
      this.newLocation = null;  // {array, index} where the draggable item dropped

      this.scroll = {
        edges: {x: {}, y: {}},   // container edges (document coordinates)

        window: document.scrollingElement,
        windowEdges: {
          x: {min: 20, max: window.innerWidth-20},
          y: {min: 20, max: window.innerHeight-20},
        },        // window edges (viewport coordinates)
      };


      // this.useWindowAsScrollContainer = false;
    },


    updateContainer(c){
      if(this.container === c) return;

      this.container = c;
      this.scroll.container = c.$el;

      const cRect = c.$el.getBoundingClientRect();

      if (c.axis.includes('x')) {
        this.scroll.edges.x = {
          min: window.pageXOffset + cRect.left,
          max: window.pageXOffset + cRect.left + cRect.width,
        }
      }

      if (c.axis.includes('y')) {
        this.scroll.edges.y = {
          min: window.pageXOffset + cRect.top,
          max: window.pageXOffset + cRect.top + cRect.height,
        }
      }


    },

};

// preview element
document.getElementsByTagName("body")[0].innerHTML += `
  <div id="${manager.previewNode.parentId}" hidden>
    <div id="${manager.previewNode.id}">
    </div>
  </div>
`;

manager.previewNode.parentNode = document.getElementById(manager.previewNode.parentId);
manager.previewNode.node = document.getElementById(manager.previewNode.id);

Object.entries(manager.previewNode.style).forEach(([k,v]) => {
    manager.previewNode.node.style[k] = v;
});


manager.init();
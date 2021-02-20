
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

    
    init(){
      this.cache = {};          // to cache something within a DnD action
      this.dragging = null;     // Draggable compo that is dragging

      this.hovered = null;      // Draggable compo that is hovered
      this.container = null;    // Container compo (parent of this.hovered)

      this.oldLocation = null;  // {array, index} where the draggable item taken
      this.newLocation = null;  // {array, index} where the draggable item dropped
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
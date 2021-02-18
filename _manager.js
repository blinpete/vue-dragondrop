
const manager = {
    activeIndex: null,
    node: null,
    dragging: null,

    previewNode: {
        parentId: "__preview_hidden__",
        id: "__preview_node__",
        style: {
            width: '200px',
            height: '80px',
            border: '2px dashed #abc',
            boxSizing: 'border-box',
            marginTop: '3px',
        },
    }
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

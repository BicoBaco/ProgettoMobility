function toggleEdit(buttonId) {
    parentChildren = document.getElementById(buttonId).parentNode.children;
    
    input = parentChildren[1];
    button = parentChildren[3];

    input.disabled = !input.disabled;
    button.classList.toggle("disabled");
}
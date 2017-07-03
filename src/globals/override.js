overrideElements(".label-select-menu .discussion-sidebar-heading.discussion-sidebar-toggle");

function overrideElements(menuSelector) {

    if(!overrideMenu(document.querySelector(menuSelector))){
        var observer = new MutationObserver(processMutations);
        observer.observe(document, {subtree:true, childList:true});
        document.addEventListener('DOMContentLoaded', function() { observer.disconnect(); });
    }

    function processMutations(mutations) {
        for (var i = 0; i < mutations.length; ++i) {
            var addedNodes = mutations[i].addedNodes;
            for (var j = 0; j < addedNodes.length; ++j) {
                var node = addedNodes[j];
                if (node.nodeType == Node.ELEMENT_NODE && overrideMenu(node.querySelector(menuSelector))){
                    observer.disconnect();
                    return true;
                }
            }
        }
        return false;
    }

    function overrideMenu(element) {
        return element && !element.classList.remove("js-menu-target");
    }
}
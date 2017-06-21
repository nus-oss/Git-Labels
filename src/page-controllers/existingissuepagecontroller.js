var ExistingIssuePageController = function(layoutManager) {
    this.GitLabelListQuery = ".sidebar-labels .select-menu-modal";
    this.GitLabelListLocation = ".sidebar-labels .select-menu-modal-holder .js-select-menu-deferred-content";
    this.GitLabelListNewLocation = ".sidebar-labels .select-menu-modal-holder .js-select-menu-deferred-content .select-menu-list .select-menu-item";
     /*
        this.storage,
        this.layoutManager
    */
}

ExistingIssuePageController.prototype.getDataForPOSTRequest = function() {

    var formElement = document.querySelector(".discussion-sidebar .sidebar-labels .js-issue-sidebar-form");

    if(!formElement){
        return null;
    }

    var url = formElement.getAttribute("action");

    if(!url){
        return null;
    }

    var utf8TokenElement = formElement.querySelector("input[name='utf8']");

    if(!utf8TokenElement){
        return null;
    }

    var utf8Token = utf8TokenElement.getAttribute("value");

    if(typeof(utf8Token) !== "string"){
        return null;
    }

    var postMethodElement = formElement.querySelector("input[name='_method']");

    if(!postMethodElement){
        return null;
    }

    var postMethod = postMethodElement.getAttribute("value");

    if(typeof(postMethod) !== "string"){
        return null;
    }

    var tokenElement = formElement.querySelector("input[name='authenticity_token']");

    if(!tokenElement){
        return null;
    }

    var token = tokenElement.getAttribute("value");

    if(typeof(token) !== "string"){
        return null;
    }

    return { url: url, utf8Token: utf8Token, postMethod: postMethod ,token: token };
}

ExistingIssuePageController.prototype.handleExternalApplyLabelsEvent = function() {

    if(!this.storage || !this.layoutManager){
        return false;
    }

    var postInfo = this.getDataForPOSTRequest();

    if(!postInfo){
        return false;
    }

    var data = "utf8=" + encodeURIComponent(postInfo.utf8Token) + "&_method=" + encodeURIComponent(postInfo.postMethod);
    data += ("&authenticity_token=" + encodeURIComponent(postInfo.token));
    data += ("&" + encodeURIComponent("issue[labels][]") + "=");

    var selectedItemIDsIter = this.storage.getSelectedItemIDsIterator();
    while(true){

        var itemIDObj = selectedItemIDsIter.next();

        if(itemIDObj.done){
            break;
        }

        var itemID = itemIDObj.value;
        var item = this.storage.getItem(itemID);

        if(!item){
            continue;
        }

        data += ("&" + encodeURIComponent("issue[labels][]") + "=" + encodeURIComponent((item.getFullName())));
    }

    $.post(postInfo.url, data)
     .always(this.handleAfterPostRequest.bind(this));

    return true;
}

ExistingIssuePageController.prototype.handleAfterPostRequest = function() {
    this.retrieveLabelsFromGETRequest();
}

ExistingIssuePageController.prototype.recoverLabelsInGitDOM = function(data) {

    var parent = document.body.querySelector(this.GitLabelListLocation);

    if(!parent){
        return false;
    }

    $(parent).html(data);

    return true;
}

ExistingIssuePageController.prototype.processGETResponse = function(data) {
    if(this.layoutManager){
        this.recoverLabelsInGitDOM(data);
        this.storage = this.getLabelsFromDOM();
        this.layoutManager.initializeUI(this.storage);
    }
}

ExistingIssuePageController.prototype.retrieveLabelsFromGETRequest = function() {

    var urlElement = document.querySelector( ".discussion-sidebar .sidebar-labels div.label-select-menu" );

    if(!urlElement){
        return false;
    }

    var url = urlElement.getAttribute("data-contents-url");

    if(!url){
        return false;
    }

    $.get(url)
     .done(this.processGETResponse.bind(this));

    return true;
}

ExistingIssuePageController.prototype.getLabelsFromDOM = function() {

    var items = document.body.querySelectorAll(this.GitLabelListNewLocation);

    if(items.length <= 0){
        return null;
    }

    var storage = new ItemStorage();

    for(var i = 0; i < items.length; ++i){

        var item = items[i];

        var nameNode = item.querySelector(".select-menu-item-text .color-label");
        if(!nameNode){
            continue;
        }

        var name = nameNode.getAttribute("data-name");
        if(!name){
            continue;
        }

        var colorNode = item.querySelector(".select-menu-item-text .color");
        if(!colorNode){
            continue;
        }
        
        var color = colorNode.style.backgroundColor;
        if(!color){
            continue;
        }

        var selectedNode = item.querySelector(".select-menu-item-text input");
        if(!selectedNode){
            continue;
        }
        var isSelected = selectedNode.hasAttribute("checked");

        storage.addItem(new LabelItem(name, color, isSelected));
    }

    return storage;
}

ExistingIssuePageController.prototype.hasPermissionToManageLabels = function() {
    return document.body.querySelector(this.GitLabelListQuery) != null;
}

ExistingIssuePageController.prototype.run = function(layoutManager) {
    if(layoutManager && this.hasPermissionToManageLabels()){
        this.layoutManager = layoutManager;
        this.storage = this.getLabelsFromDOM();
        if(!this.storage){
            this.retrieveLabelsFromGETRequest();
        } else {
            this.layoutManager.initializeUI(this.storage);
        }
    }
}
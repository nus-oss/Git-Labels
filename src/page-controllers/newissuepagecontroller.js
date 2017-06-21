var NewIssuePageController = function() {
    this.GitLabelListQuery = ".sidebar-labels .select-menu-modal";
    this.GitLabelsPostDataQueryString = ".discussion-sidebar-item.sidebar-labels .js-issue-sidebar-form";
    this.GitLabelsReplaceElementQueryString = ".discussion-sidebar-item.sidebar-labels.js-discussion-sidebar-item";
    this.GitLabelsQueryString = ".sidebar-labels .select-menu-modal-holder .select-menu-list .select-menu-item";
    /*
        this.storage,
        this.layoutManager
    */
}

NewIssuePageController.prototype.getDataForPOSTRequest = function() {

    var dataEle = document.querySelector(this.GitLabelsPostDataQueryString);

    if(!dataEle || dataEle.length <= 0){
        return null;
    }

    var url = dataEle.getAttribute("data-url");

    if(!url){
        return null;
    }

    var token = dataEle.getAttribute("data-authenticity-token");

    if(!token){
        return null;
    }

    return { url: url, token: token };
}

NewIssuePageController.prototype.handleExternalApplyLabelsEvent = function() {

    if(!this.storage || !this.layoutManager){
        return false;
    }

    var postInfo = this.getDataForPOSTRequest();

    if(!postInfo){
        return false;
    }

    var data = encodeURIComponent("issue[labels][]") + "=";

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

    data += ("&" + encodeURIComponent("authenticity_token") + "=" + encodeURIComponent(postInfo.token));

    
    $.post(postInfo.url, data)
     .done(this.handleSuccessfulPostRequest.bind(this))
     .fail(this.handleFailedPostRequest.bind(this))
     .always(this.handleAfterPostRequest.bind(this));

    return true;
}

NewIssuePageController.prototype.handleSuccessfulPostRequest = function(data) {

    if(!data || typeof data !== "string"){
        return false;
    }

    var elementToBeReplaced = document.querySelector(this.GitLabelsReplaceElementQueryString);

    if(!elementToBeReplaced){
        return false;
    }

    $(elementToBeReplaced).replaceWith($(data));

    return true;
}

NewIssuePageController.prototype.handleFailedPostRequest = function() {
    console.error("Post call unsuccessful!");
}

NewIssuePageController.prototype.handleAfterPostRequest = function() {
    if(this.layoutManager){
        this.storage = this.getLabelsFromDOM();
        this.layoutManager.updateUI(this.storage);
    }
}

NewIssuePageController.prototype.getLabelsFromDOM = function() {

    var labels = document.querySelectorAll(this.GitLabelsQueryString);

    if(!labels){
        return null;
    }

    var storage = new ItemStorage();

    for( var i = 0; i < labels.length; ++i ) {

        let label = labels[i];

        let nameNode = label.querySelector(".name");
        if(!nameNode){
            continue;
        }

        let itemName = nameNode.textContent;
        if(!itemName){
            continue;
        }

        let colorNode = label.querySelector(".color");
        if(!colorNode){
            continue;
        }

        let itemColor = colorNode.style.backgroundColor;
        if(!itemColor){
            continue;
        }

        var isItemSelected = label.classList.contains("selected");
        storage.addItem(new LabelItem(itemName, itemColor, isItemSelected));
    }

    return storage;
}

NewIssuePageController.prototype.hasPermissionToManageLabels = function() {
    return document.body.querySelector(this.GitLabelListQuery) != null;
}

NewIssuePageController.prototype.run = function(layoutManager) {
    if(layoutManager && this.hasPermissionToManageLabels()){
        this.layoutManager = layoutManager;
        this.storage = this.getLabelsFromDOM();
        if(this.storage){
            this.layoutManager.initializeUI(this.storage);
        }
    }
}
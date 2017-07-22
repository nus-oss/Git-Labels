var NewIssuePageController = function() {
    this.GitLabelModalBoxLocation = ".sidebar-labels .select-menu-modal";
    this.GitLabelsPostDataQueryString = ".discussion-sidebar-item.sidebar-labels .js-issue-sidebar-form";
    this.GitLabelsReplaceElementQueryString = ".discussion-sidebar-item.sidebar-labels.js-discussion-sidebar-item";
    this.GitLabelModalBoxButtonLocation = ".sidebar-labels .label-select-menu button.discussion-sidebar-toggle";
    this.GitLabelModalBoxButtonTriggerClass = "js-menu-target";
    this.GitLabelFormName = "issue[labels][]";
    this.GitLabelListLocation = ".sidebar-labels .select-menu-modal-holder .select-menu-list";
    this.GitLabelListItemClassName = "select-menu-item";
    this.GitLabelListItemExactLocation = ".select-menu-item";
    /*
        this.storage,
        this.layoutManager
    */
}

NewIssuePageController.prototype.getDataForPOSTRequest = function() {

    var dataEle = document.querySelector(this.GitLabelsPostDataQueryString);

    if(!dataEle){
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

    var data = encodeURIComponent(this.GitLabelFormName) + "=";

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

        data += ("&" + encodeURIComponent(this.GitLabelFormName) + "=" + encodeURIComponent((item.getFullName())));
    }
    data += ("&" + encodeURIComponent("authenticity_token") + "=" + encodeURIComponent(postInfo.token));

    $.post(postInfo.url, data)
     .done(this.handleSuccessfulPostRequest.bind(this))
     .fail(this.handleFailedPostRequest.bind(this))
     .always(this.handleAfterPostRequest.bind(this));

    return true;
}

NewIssuePageController.prototype.handleSuccessfulPostRequest = function(data) {

    if(typeof(data) !== "string"){
        return false;
    }

    var elementToBeReplaced = document.querySelector(this.GitLabelsReplaceElementQueryString);

    if(!elementToBeReplaced){
        return false;
    }

    $(elementToBeReplaced).replaceWith($(data));

    this.overrideLabelModalButtonListeners();

    return true;
}

NewIssuePageController.prototype.handleFailedPostRequest = function() {
    console.error("Post call unsuccessful!");
}

NewIssuePageController.prototype.handleAfterPostRequest = function() {
    if(this.layoutManager){
        this.storage = this.getLabelsFromDOM();
        this.layoutManager.updateUIWithData(this.storage);
    }
}

NewIssuePageController.prototype.cleanup = function() {
    this.layoutManager.cleanup();
}

NewIssuePageController.prototype.updateToken = function($parsedResponse) {

    var $newTokenElement = $parsedResponse.find(this.GitLabelsPostDataQueryString);
    if($newTokenElement.length <= 0){
        return false;
    }

    var newToken = $newTokenElement[0].getAttribute("data-authenticity-token");
    if(typeof(newToken) !== "string" ){
        return false;
    }

    var oldTokenElement = document.querySelector(this.GitLabelsPostDataQueryString);
    if(!oldTokenElement){
        return false;
    }

    oldTokenElement.setAttribute("data-authenticity-token", newToken);

    return true;
}

NewIssuePageController.prototype.getLabelsFromRequestData = function(data) {

    try {

        var $doc = $("<div></div>").append($.parseHTML(data));

        this.updateToken($doc);

        var $lists = $doc.find(this.GitLabelListLocation);
        if($lists.length <= 0){
            return null;
        }

        var labels = $lists[0].getElementsByClassName(this.GitLabelListItemClassName);

        var storage = new ItemStorage();
        for( var i = 0; i < labels.length; ++i ) {

            let label = labels[i];

            let nameNode = label.querySelector(".color-label");
            if(!nameNode){
                continue;
            }

            let itemName = nameNode.getAttribute("data-name");;
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

    } catch(Exception) {}

    return null;
}

NewIssuePageController.prototype.handleSuccessfulGetLabelsRequest = function(data, updateType) {
    this.storage = this.getLabelsFromRequestData(data);
    if(this.storage){
        this.layoutManager.populateUIWithData(updateType, this.storage);
    } else {
        this.cleanup();
    }
}

NewIssuePageController.prototype.handleFailedGetLabelsRequest = function() {
    this.cleanup();
}

NewIssuePageController.prototype.getLabelsFromRequest = function(updateType) {

    if(!this.layoutManager){
        return false;
    }

    var postInfo = this.getDataForPOSTRequest();

    if(!postInfo){
        return false;
    }

    var data = encodeURIComponent(this.GitLabelFormName) + "=";
    data += ("&" + encodeURIComponent("authenticity_token") + "=" + encodeURIComponent(postInfo.token));

    $.post(postInfo.url, data)
     .done(function(data){this.handleSuccessfulGetLabelsRequest(data, updateType)}.bind(this))
     .fail(this.handleFailedGetLabelsRequest.bind(this));

    return true;
}

NewIssuePageController.prototype.getLabelsFromDOM = function() {

    var list = document.querySelector(this.GitLabelListLocation);

    if(!list){
        return null;
    }
    
    var labels = list.getElementsByClassName(this.GitLabelListItemClassName);

    var storage = new ItemStorage();
    for( var i = 0; i < labels.length; ++i ) {

        let label = labels[i];

        let nameNode = label.querySelector(".color-label");
        if(!nameNode){
            continue;
        }

        let itemName = nameNode.getAttribute("data-name");;
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
    return document.body.querySelector(this.GitLabelModalBoxLocation) != null;
}

NewIssuePageController.prototype.handleClickEvent = function() {
    if(this.layoutManager){
        this.layoutManager.toggleSideBar();
    }
}

NewIssuePageController.prototype.overrideLabelModalButtonListeners = function() {
    var labelModalButton = document.body.querySelector(this.GitLabelModalBoxButtonLocation);
    if(labelModalButton){
        labelModalButton.classList.remove(this.GitLabelModalBoxButtonTriggerClass);
        labelModalButton.removeEventListener("click", this.handleClickEvent.bind(this), true);
        labelModalButton.addEventListener("click", this.handleClickEvent.bind(this), true);
        return true;
    }
    return false;
}

NewIssuePageController.prototype.setupPageListeners = function() {
    this.overrideLabelModalButtonListeners();
}

NewIssuePageController.prototype.isSafeToRun = function(isSafeParams) {
    if(isSafeParams){
        if(!isSafeParams.a && document.querySelector(this.GitLabelModalBoxLocation)){
            isSafeParams.a = true;
        }
        if(!isSafeParams.b && document.querySelector(this.GitLabelModalBoxButtonLocation)){
            isSafeParams.b = true;
        }
        if(!isSafeParams.c && document.querySelector(this.GitLabelsPostDataQueryString)){
            isSafeParams.c = true;
        }
        return isSafeParams.a && isSafeParams.b && isSafeParams.c;
    } else {
        return document.getElementById(this.sideBarId)
            && document.querySelector(this.GitLabelModalBoxButtonLocation)
            && document.querySelector(this.GitLabelsPostDataQueryString);
    } 
}

NewIssuePageController.prototype.run = function(layoutManager) {
    if(layoutManager && this.hasPermissionToManageLabels()){
        this.layoutManager = layoutManager;
        this.setupPageListeners();
        var updateType = this.layoutManager.initializeUI();
        this.storage = this.getLabelsFromDOM();
        if(this.storage){
            this.layoutManager.populateUIWithData(updateType, this.storage);
        } else {
            this.cleanup();
        }
    }
}

NewIssuePageController.prototype.runBeforeDocumentEnd = function(layoutManager) {
    if(layoutManager && this.hasPermissionToManageLabels()){
        this.layoutManager = layoutManager;
        this.setupPageListeners();
        var updateType = this.layoutManager.initializeUI();
        this.getLabelsFromRequest(updateType);
    }
}
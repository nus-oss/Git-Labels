var NewPullRequestPageController = function() {
    this.GitLabelListQuery = ".sidebar-labels .select-menu-modal";
    this.GitLabelsPostDataQueryString = ".discussion-sidebar-item.sidebar-labels .js-issue-sidebar-form";
    this.GitLabelsReplaceElementQueryString = ".discussion-sidebar-item.sidebar-labels.js-discussion-sidebar-item";
    this.GitLabelsQueryString = ".sidebar-labels .select-menu-modal-holder .select-menu-list .select-menu-item";
    /*
        this.storage,
        this.layoutManager,
        this.isUIInitialized
    */
}

NewPullRequestPageController.prototype.getDataForPOSTRequest = function() {

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

NewPullRequestPageController.prototype.handleExternalApplyLabelsEvent = function() {

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

NewPullRequestPageController.prototype.handleSuccessfulPostRequest = function(data) {

    if(!data || typeof data !== "string"){
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

NewPullRequestPageController.prototype.handleFailedPostRequest = function() {
    console.error("Post call unsuccessful!");
}

NewPullRequestPageController.prototype.handleAfterPostRequest = function() {
    if(this.layoutManager){
        this.storage = this.getLabelsFromDOM();
        this.layoutManager.updateUI(this.storage);
    }
}

NewPullRequestPageController.prototype.getLabelsFromDOM = function() {

    var labels = document.querySelectorAll(this.GitLabelsQueryString);

    if(!labels){
        return null;
    }

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

NewPullRequestPageController.prototype.hasPermissionToManageLabels = function() {
    return document.body.querySelector(this.GitLabelListQuery) != null;
}

NewPullRequestPageController.prototype.handleClickEvent = function() {
    if(this.layoutManager){
        this.layoutManager.toggleSideBar();
    }
}

NewPullRequestPageController.prototype.overrideLabelModalButtonListeners = function() {
    
    var labelModalButton = document.body.querySelector(".sidebar-labels .label-select-menu button.discussion-sidebar-toggle");

    if(labelModalButton){
        labelModalButton.classList.remove("js-menu-target");
        labelModalButton.removeEventListener("click", this.handleClickEvent.bind(this), true);
        labelModalButton.addEventListener("click", this.handleClickEvent.bind(this), true);
    }
}

NewPullRequestPageController.prototype.setupPageListeners = function() {
    this.overrideLabelModalButtonListeners();
}

NewPullRequestPageController.prototype.handleAfterScriptInitialized = function(mutation) {
    
    var target = mutation.target;

    if(!target || target.className !== "pre-mergability" || target.querySelector(".text-pending")){
        return false;
    }

    if(!this.isUIInitialized && this.layoutManager && this.storage){
        this.isUIInitialized = true;
        this.layoutManager.initializeUI(this.storage);
        return true;
    }

    return false;
}

NewPullRequestPageController.prototype.canUIInitialize = function() {

    var textPendingEle = document.body.querySelector(".gh-header .pre-mergability .text-pending");

    if(!textPendingEle){
        return true;
    }

    var observer = new MutationObserver(function(mutations){
        for( let i = 0, sz = mutations.length; i < sz; ++i ){
            if(this.handleAfterScriptInitialized(mutations[i])){
                observer.disconnect();
                break;
            }
        }
    }.bind(this));

    var config = { childList: true, subtree: true }
    var observable = document.body.querySelector(".gh-header .range-editor");
    observer.observe(observable, config);

    return document.body.querySelector(".gh-header .pre-mergability .text-pending") == null;
}

NewPullRequestPageController.prototype.run = function(layoutManager) {
    if(layoutManager && this.hasPermissionToManageLabels()){
        this.layoutManager = layoutManager;
        this.isUIInitialized = false;
        this.setupPageListeners();
        this.storage = this.getLabelsFromDOM();
        if(this.storage && this.canUIInitialize()){
            this.isUIInitialized = true;
            this.layoutManager.initializeUI(this.storage);
        }
    }
}
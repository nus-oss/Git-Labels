var ExistingIssuePageController = function(layoutManager) {
    this.GitLabelModalBoxLocation = ".sidebar-labels .select-menu-modal";
    this.GitLabelDeferredListLocation = ".sidebar-labels .select-menu-modal-holder .js-select-menu-deferred-content";
    this.GitLabelListLocation = ".sidebar-labels .select-menu-modal-holder .js-select-menu-deferred-content .select-menu-list";
    this.GitLabelListItemClassName = "select-menu-item";
    this.GitLabelFormLocation = ".discussion-sidebar .sidebar-labels .js-issue-sidebar-form";
    this.GitLabelFormExactLocation = ".discussion-sidebar-item.sidebar-labels.js-discussion-sidebar-item form.js-issue-sidebar-form";
    this.GitSelectedLabelsLocation = ".discussion-sidebar-item.sidebar-labels.js-discussion-sidebar-item .labels.css-truncate";
    this.GitSelectedLabelsClassName = "label css-truncate-target";
    this.RetrieveGitLabelUrlLocation = ".discussion-sidebar .sidebar-labels div.label-select-menu";
    this.GitLabelModalBoxButtonLocation = ".sidebar-labels .label-select-menu button.discussion-sidebar-toggle";
    this.GitLabelModalBoxButtonTriggerClass = "js-menu-target";
    this.GitSelectedLabelExactLocation = ".labels.css-truncate";
    this.GitLabelFormName = "issue[labels][]";
    this.GitLabelFormUTF8DataLocation = "input[name='utf8']";
    this.GitLabelFormMethodDataLocation = "input[name='_method']";
    this.GitLabelFormTokenDataLocation = "input[name='authenticity_token']";
    this.sideBarClassName = "discussion-sidebar";
    this.sideBarLocation = ".discussion-sidebar";
    this.sideBarId = "partial-discussion-sidebar";
    this.GitLabelNameLocation = ".select-menu-item-text .color-label";
    this.GitLabelColorLocation = ".select-menu-item-text .color";
    this.GitLabelSelectionStatusLocation = ".select-menu-item-text input";
    /*
        this.storage,
        this.layoutManager,
        this.sideBarObserver
    */
}

ExistingIssuePageController.prototype.getDataForPOSTRequest = function() {

    var formElement = document.querySelector(this.GitLabelFormLocation);

    if(!formElement){
        return null;
    }

    var url = formElement.getAttribute("action");

    if(!url){
        return null;
    }

    var utf8TokenElement = formElement.querySelector(this.GitLabelFormUTF8DataLocation);

    if(!utf8TokenElement){
        return null;
    }

    var utf8Token = utf8TokenElement.getAttribute("value");

    if(typeof(utf8Token) !== "string"){
        return null;
    }

    var postMethodElement = formElement.querySelector(this.GitLabelFormMethodDataLocation);

    if(!postMethodElement){
        return null;
    }

    var postMethod = postMethodElement.getAttribute("value");

    if(typeof(postMethod) !== "string"){
        return null;
    }

    var tokenElement = formElement.querySelector(this.GitLabelFormTokenDataLocation);

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
    data += ("&" + encodeURIComponent(this.GitLabelFormName) + "=");

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

    $.post(postInfo.url, data)
     .done(this.handleSuccessfulPostRequest.bind(this))
     .fail(this.handleUnsuccessfulPostRequest.bind(this));

    return true;
}

ExistingIssuePageController.prototype.handleSuccessfulPostRequest = function(response) {
    this.retrieveLabelsFromGETRequest();
    this.updatedGitLabelsDisplay(response);
}

ExistingIssuePageController.prototype.handleUnsuccessfulPostRequest = function() {
    this.retrieveLabelsFromGETRequest();
}

ExistingIssuePageController.prototype.replaceGitFormData = function(newUTF8Value, newMethodValue, newAuthTokenValue) {

    var oldForm = document.body.querySelector(this.GitLabelFormExactLocation);

    if(!oldForm){
        return false;
    }

    if(newUTF8Value){
        var oldUTF8 = oldForm.querySelector(this.GitLabelFormUTF8DataLocation);
        if(oldUTF8){
            oldUTF8.setAttribute("value", newUTF8Value);
        }
    }

    if(newMethodValue){
        var oldMethod = oldForm.querySelector(this.GitLabelFormMethodDataLocation);
        if(oldMethod){
            oldMethod.setAttribute("value", newMethodValue);
        }
    }

    if(newAuthTokenValue){
        var oldAuthToken = oldForm.querySelector(this.GitLabelFormTokenDataLocation);
        if(oldAuthToken){
            oldAuthToken.setAttribute("value", newAuthTokenValue);
        }
    }

    return true;
}

ExistingIssuePageController.prototype.updateGitFormData = function($parsedResponse) {

    var $newForm = $parsedResponse.find(this.GitLabelFormExactLocation);

    if($newForm.length <= 0){
        return false;
    }

    var $newUTF8 = $newForm.find(this.GitLabelFormUTF8DataLocation);
    if($newUTF8.length > 0){
        var newUTF8Value = $newUTF8[0].getAttribute("value");
    }

    var $newMethod = $newForm.find(this.GitLabelFormMethodDataLocation);
    if($newMethod.length > 0){
        var newMethodValue = $newMethod[0].getAttribute("value");
    }

    var $newAuthToken = $newForm.find(this.GitLabelFormTokenDataLocation);
    if($newAuthToken.length > 0){
        var newAuthTokenValue = $newAuthToken[0].getAttribute("value");
    }
    
    return this.replaceGitFormData(newUTF8Value, newMethodValue, newAuthTokenValue);
}

ExistingIssuePageController.prototype.replaceGitLabelsDisplay = function(labelSideBarItem) {

    if(!labelSideBarItem){
        return false;
    }

    try{

        var $labelSideBarItem = $("<div></div>").append($.parseHTML(labelSideBarItem));

        this.updateGitFormData($labelSideBarItem);

        $newLabelsDisplay = $labelSideBarItem.find(this.GitSelectedLabelExactLocation);
        if($newLabelsDisplay.length <= 0){
            return false;
        }

        var oldLabelsDisplay = document.body.querySelector(this.GitSelectedLabelsLocation);
        if(!oldLabelsDisplay){
            return false;
        }

        $(oldLabelsDisplay).replaceWith($newLabelsDisplay);

        return true;

    } catch(exception){}

    return false;
}

ExistingIssuePageController.prototype.processReplyForSideBar = function(reply) {

    if(!reply){
        return false;
    }

    try{

        var $reply = $("<div></div>").append($.parseHTML(reply));

        this.updateGitFormData($reply);

        var $newLabelsDisplay = $reply.find(this.GitSelectedLabelsLocation); 
        if($newLabelsDisplay.length <= 0){
            return false;
        }

        var oldLabelsDisplay = document.body.querySelector(this.GitSelectedLabelsLocation);
        if(!oldLabelsDisplay){
            return false;
        }

        $(oldLabelsDisplay).replaceWith($newLabelsDisplay);
        return true;

    } catch(exception) {}

    return false;
}

ExistingIssuePageController.prototype.updatedGitLabelsDisplay = function(response) {

    var discussionSideBar = document.getElementById(this.sideBarId);

    if(!discussionSideBar){
        return this.replaceGitLabelsDisplay(response);
    }

    var url = discussionSideBar.getAttribute("data-url");

    if(!url){
        return this.replaceGitLabelsDisplay(response);
    }

    $.get(url)
     .done(function(reply){if(!this.processReplyForSideBar(reply)){this.replaceGitLabelsDisplay(response);}}.bind(this))
     .fail(function(){this.replaceGitLabelsDisplay(response);}.bind(this));

    return true;
}

ExistingIssuePageController.prototype.onUpdatedGitlabelDisplayResponse = function(reply) {

    if(!reply){
        return false;
    }

    try{

        var $reply = $("<div></div>").append($.parseHTML(reply));

        this.updateGitFormData($reply);

        var $newLabelsDisplay = $reply.find(this.GitSelectedLabelsLocation); 
        if($newLabelsDisplay.length <= 0){
            return false;
        }

        var oldLabelsDisplay = document.body.querySelector(this.GitSelectedLabelsLocation);
        if(!oldLabelsDisplay){
            return false;
        }

        var oldLabels = oldLabelsDisplay.getElementsByClassName(this.GitSelectedLabelsClassName);
        var newLabels = $newLabelsDisplay[0].getElementsByClassName(this.GitSelectedLabelsClassName);

        if( oldLabels.length === newLabels.length ) {
            var isSame = true;
            for(var i = 0; i < oldLabels.length; ++i){
                if(oldLabels[i].textContent !== newLabels[i].textContent){
                    isSame = false;
                    break;
                }
            }
            if(isSame){
                return true;
            }
        }
        $(oldLabelsDisplay).replaceWith($newLabelsDisplay);
        return true;

    } catch(exception) {}

    return false;
}

ExistingIssuePageController.prototype.refreshGitLabelDisplay = function() {

    var discussionSideBar = document.getElementById(this.sideBarId);

    if(!discussionSideBar){
        return false;
    }

    var url = discussionSideBar.getAttribute("data-url");

    if(!url){
        return false;
    }

    $.get(url)
     .done(this.onUpdatedGitlabelDisplayResponse.bind(this));

    return true;
}

ExistingIssuePageController.prototype.recoverLabelsInGitDOM = function(data) {

    var parent = document.body.querySelector(this.GitLabelDeferredListLocation);

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
        if(this.storage){
            this.layoutManager.populateUIWithData(UpdateUIType.UpdateData, this.storage);
            return true;
        }
    }
    return false;
}

ExistingIssuePageController.prototype.retrieveLabelsFromGETRequest = function() {

    var urlElement = document.querySelector(this.RetrieveGitLabelUrlLocation);

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

ExistingIssuePageController.prototype.processInitialGETResponse = function(data, updateType) {
    
    if(this.layoutManager){
        this.recoverLabelsInGitDOM(data);
        this.storage = this.getLabelsFromDOM();
        if(this.storage){
            this.layoutManager.populateUIWithData(updateType, this.storage);
            this.refreshGitLabelDisplay();
            return true;
        }
    }
    this.fullCleanup();
    return false;
}

ExistingIssuePageController.prototype.retrieveInitialLabelsFromGETRequest = function(updateType) {

    var urlElement = document.querySelector(this.RetrieveGitLabelUrlLocation);

    if(!urlElement){
        return false;
    }

    var url = urlElement.getAttribute("data-contents-url");

    if(!url){
        return false;
    }

    $.get(url)
     .done(function(data){this.processInitialGETResponse(data, updateType)}.bind(this))
     .fail(this.fullCleanup.bind(this));

    return true;
}

ExistingIssuePageController.prototype.getLabelsFromDOM = function() {

    var list = document.body.querySelector(this.GitLabelListLocation);
    if(!list){
        return null;
    }

    var items = list.getElementsByClassName(this.GitLabelListItemClassName);
    if(items.length <= 0){
        return null;
    }

    var storage = new ItemStorage();

    for(var i = 0; i < items.length; ++i){

        var item = items[i];

        var nameNode = item.querySelector(this.GitLabelNameLocation);
        if(!nameNode){
            continue;
        }

        var name = nameNode.getAttribute("data-name");
        if(!name){
            continue;
        }

        var colorNode = item.querySelector(this.GitLabelColorLocation);
        if(!colorNode){
            continue;
        }
        
        var color = colorNode.style.backgroundColor;
        if(!color){
            continue;
        }

        var selectedNode = item.querySelector(this.GitLabelSelectionStatusLocation);
        if(!selectedNode){
            continue;
        }
        var isSelected = selectedNode.hasAttribute("checked");

        storage.addItem(new LabelItem(name, color, isSelected));
    }

    return storage;
}

ExistingIssuePageController.prototype.hasPermissionToManageLabels = function() {
    return document.body.querySelector(this.GitLabelModalBoxLocation) != null;
}

ExistingIssuePageController.prototype.stopBodyObserver = function() {
    if(this.bodyObserver){
        this.bodyObserver.disconnect();
        this.bodyObserver = null;
    }
}

ExistingIssuePageController.prototype.runWithoutPusher = function() {

    this.bodyObserver = null;
    var pusher = null;

    pusher = document.createElement("div");
    pusher.classList.add("pusher");
    document.body.prepend(pusher);   

    this.bodyObserver = new MutationObserver(processBodyMutations);
    this.bodyObserver.observe(document.body, {childList:true});
    document.removeEventListener('DOMContentLoaded', this.stopBodyObserver.bind(this));
    document.addEventListener('DOMContentLoaded', this.stopBodyObserver.bind(this));

    processBodyMutations();
    
    function processBodyMutations() {
        var children = document.body.children;
        for(var i = 0, sz = children.length; i < sz;){
            var child = children[i];
            if(child.tagName === "SCRIPT" || child === pusher 
                || child.classList.contains("git-flash-labels-sidebar")
                || child.classList.contains("git-flash-labels-sidebar-launch-button") ){
                ++i;
            } else {
                pusher.appendChild(child);
                --sz;
            }
        }
    }
}

ExistingIssuePageController.prototype.processPage = function() {

    if(!document.body){
        return false;
    }

    this.bodyObserver = null;
    
    if(!document.body.querySelector(".pusher")){
        this.runWithoutPusher();
    }

    return true;
}

ExistingIssuePageController.prototype.partialRun = function(runParams, layoutManager, isEnd) {

    if(!runParams){
        if(isEnd) {
            this.layoutManager = null;
            this.storage = null;
        }
        return false;
    }

    if(!runParams.a && this.hasPermissionToManageLabels()){
        this.layoutManager = layoutManager;
        runParams.a = true;
    } 
    
    if(!runParams.a){
        if(isEnd) {
            this.layoutManager = null;
            this.storage = null;
        }
        return false;
    }

    if(!runParams.b && this.overrideLabelButtonListeners()){
        runParams.b = true;
    }

    if(!runParams.page && (isEnd || this.processPage())){
        runParams.page = true;
    }

    if(!runParams.c && this.attachGitSideBarObserver()){
        runParams.c = true;
    }

    if(typeof(runParams.h) !== "number"){
        runParams.h = 0;
    }

    if(!runParams.updateType && runParams.page){
        runParams.updateType = this.layoutManager.initializeUI();
        ++runParams.h;
    }

    if(!runParams.d && (isEnd || document.getElementById(this.sideBarId))){
        ++runParams.h;
        runParams.d = true;
    }

    if(!runParams.e && (isEnd || document.querySelector(this.RetrieveGitLabelUrlLocation))){
        ++runParams.h;
        runParams.e = true;
    }

    if(!runParams.f && (isEnd || document.querySelector(this.GitLabelDeferredListLocation))){
        ++runParams.h;
        runParams.f = true;
    }

    if(runParams.h < 4){
        if(isEnd) {
            this.layoutManager = null;
            this.storage = null;
        }
        return false;
    }

    if(!runParams.g){
        this.storage = this.getLabelsFromDOM();
        if(!this.storage){
            this.retrieveInitialLabelsFromGETRequest(runParams.updateType);
        } else {
            this.layoutManager.populateUIWithData(runParams.updateType, this.storage);
            this.refreshGitLabelDisplay();
        }
        runParams.g = true;
    }

    return runParams.b && runParams.c;
}

ExistingIssuePageController.prototype.run = function(layoutManager) {
    if(layoutManager && this.hasPermissionToManageLabels()){
        this.layoutManager = layoutManager;
        this.setupGitDOMListeners();
        var updateType = this.layoutManager.initializeUI();
        this.storage = this.getLabelsFromDOM();
        if(!this.storage){
            this.retrieveInitialLabelsFromGETRequest(updateType);
        } else {
            this.layoutManager.populateUIWithData(updateType, this.storage);
            this.refreshGitLabelDisplay();
        }
    }
}

ExistingIssuePageController.prototype.handleClickEvent = function() {
    if(this.layoutManager){
        this.layoutManager.toggleSideBar();
    }
}

ExistingIssuePageController.prototype.overrideLabelButtonListeners = function() {

    var gitLabelButton = document.body.querySelector(this.GitLabelModalBoxButtonLocation);

    if(gitLabelButton){
        gitLabelButton.classList.remove(this.GitLabelModalBoxButtonTriggerClass);
        gitLabelButton.removeEventListener("click", this.handleClickEvent.bind(this), true);
        gitLabelButton.addEventListener("click", this.handleClickEvent.bind(this), true);
        return true;
    }

    return false;
}

ExistingIssuePageController.prototype.attachGitSideBarObserver = function() {

    var gitSideBar = document.body.querySelector(this.sideBarLocation);

    if(!gitSideBar){
        return false;
    }

    this.sideBarObserver = new MutationObserver(function(mutations) {
        for(var i = 0; i < mutations.length; ++i){
            this.overrideLabelButtonListeners();
            this.updateUI(mutations[i]);
        }  
    }.bind(this));

    this.sideBarObserver.observe(gitSideBar, { childList: true });

    return true;
}

ExistingIssuePageController.prototype.fullCleanup = function() {
    if(this.sideBarObserver){
        this.sideBarObserver.disconnect();
        this.sideBarObserver = null;
    }
    this.layoutManager.cleanup();
    this.stopBodyObserver();
}

ExistingIssuePageController.prototype.cleanup = function() {
    if(this.sideBarObserver){
        this.sideBarObserver.disconnect();
        this.sideBarObserver = null;
    }
}

ExistingIssuePageController.prototype.setupGitDOMListeners = function() {
    this.overrideLabelButtonListeners();
    this.attachGitSideBarObserver();
}

ExistingIssuePageController.prototype.getFirstMatchedElementFromNodeList = function(nodeList, classNameQuery) {
    for(var i = 0; i < nodeList.length; ++i){
        var node = nodeList[i];
        if(node.nodeType === Node.ELEMENT_NODE){
            var element = node.querySelector(classNameQuery);
            if(element){
                return element;
            }
        }
    }
    return null;
}

ExistingIssuePageController.prototype.updateUI = function(mutation) {

    if(!this.layoutManager || !mutation.target || mutation.target.className !== this.sideBarClassName){
        return false;
    }

    var addedNodes = mutation.addedNodes;
    var removedNodes = mutation.removedNodes;

    if(!addedNodes || !removedNodes){
        return false;
    }

    var oldSelectedLabelList = this.getFirstMatchedElementFromNodeList(removedNodes, this.GitSelectedLabelExactLocation);
    var newSelectedLabelList = this.getFirstMatchedElementFromNodeList(addedNodes, this.GitSelectedLabelExactLocation);

    if(!oldSelectedLabelList || !newSelectedLabelList){
        return false;
    }

    var oldSelectedLabels = oldSelectedLabelList.getElementsByClassName(this.GitSelectedLabelsClassName);
    var newSelectedLabels = newSelectedLabelList.getElementsByClassName(this.GitSelectedLabelsClassName);

    if( oldSelectedLabels.length === newSelectedLabels.length ) {
        var isSame = true;
        for(var i = 0; i < oldSelectedLabels.length; ++i){
            if(oldSelectedLabels[i].textContent !== newSelectedLabels[i].textContent){
                isSame = false;
                break;
            }
        }
        if(isSame){
            return true;
        }
    }
    return this.retrieveLabelsFromGETRequest();
}
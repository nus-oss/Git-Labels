var IssuePageType = {
    NEW: 0,
    EXISTING: 1,
    NONE: 4
}

var IssuePageController = function() {
    this.issuePageType = IssuePageType.NONE;
    this.layoutManager = new LayoutManager();
    this.existingPageController = new ExistingIssuePageController();
    this.newPageController = new NewIssuePageController();
    this.subscribeToExternalEvents();
}

IssuePageController.prototype.stopBodyObserver = function() {
    if(this.bodyObserver){
        this.bodyObserver.disconnect();
        this.bodyObserver = null;
    }
}

IssuePageController.prototype.runBasedOnPageType = function(isDelayedRun) {
    
    switch(this.issuePageType){
        case IssuePageType.NEW:
            if(isDelayedRun){
                this.newPageController.run(this.layoutManager);
            } else {
                this.newPageController.runBeforeDocumentEnd(this.layoutManager);
            }
            break;
        case IssuePageType.EXISTING:
            this.existingPageController.run(this.layoutManager);
            break;
        default:
            break;
    }

}

IssuePageController.prototype.runWithoutPusher = function() {

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
    this.runBasedOnPageType(false);
    
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

IssuePageController.prototype.run = function() {

    if(!document.body){
        return false;
    }

    this.bodyObserver = null;
    
    if(document.body.querySelector(".pusher")){
        this.runBasedOnPageType(false);
    } else {
        this.runWithoutPusher();
    }

    return true;
}

IssuePageController.prototype.handleExternalApplyLabelsEvents = function() {
    switch(this.issuePageType) {
        case IssuePageType.NEW:
            return this.newPageController.handleExternalApplyLabelsEvent();
        case IssuePageType.EXISTING:
            return this.existingPageController.handleExternalApplyLabelsEvent();
        default:
            break;
    }
}

IssuePageController.prototype.subscribeToExternalEvents = function() {
    PubSub.subscribe("search-bar/apply-selected-labels", this.handleExternalApplyLabelsEvents.bind(this));
}

IssuePageController.prototype.cleanup = function() {
    this.issuePageType = IssuePageType.NONE;
    this.existingPageController.cleanup();
    this.layoutManager.cleanup();
    this.stopBodyObserver();
}

IssuePageController.prototype.isSafeToRunOnNewLabelsPage = function(isSafeParams) {
    return this.newPageController.isSafeToRun(isSafeParams);
}

IssuePageController.prototype.isSafeToRunOnExistingLabelsPage = function(isSafeParams) {
    return this.existingPageController.isSafeToRun(isSafeParams);
}

IssuePageController.prototype.runOnNewLabelsPage = function(isRunNow) {
    this.issuePageType = IssuePageType.NEW;
    if(isRunNow){
        this.runBasedOnPageType(true);
    } else {
        this.run();
    }
}

IssuePageController.prototype.runOnExistingLabelsPage = function(isRunNow) {
    this.issuePageType = IssuePageType.EXISTING;
    if(isRunNow){
        this.runBasedOnPageType(true);
    } else {
        this.run();
    }
}
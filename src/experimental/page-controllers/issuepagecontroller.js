var IssuePageType = {
    NEW: 0,
    EXISTING: 1,
    NEW_PULL_REQUEST: 2,
    NONE: 4
}

var IssuePageController = function() {
    this.issuePageType = IssuePageType.NONE;
    this.layoutManager = new LayoutManager();
    this.existingPageController = new ExistingIssuePageController();
    this.newPageController = new NewIssuePageController();
    this.newRequestPageController = new NewPullRequestPageController();
    this.subscribeToExternalEvents();
    // this.applySelectedLabelsEventToken
}

IssuePageController.prototype.stopBodyObserver = function() {
    if(this.bodyObserver){
        this.bodyObserver.disconnect();
        this.bodyObserver = null;
    }
}

IssuePageController.prototype.runBasedOnPageType = function() {
    
    switch(this.issuePageType){
        case IssuePageType.NEW:
            this.newPageController.run(this.layoutManager);
            break;
        case IssuePageType.EXISTING:
            this.existingPageController.run(this.layoutManager);
            break;
        case IssuePageType.NEW_PULL_REQUEST:
            this.newRequestPageController.run(this.layoutManager);
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
    this.runBasedOnPageType();
    
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
        this.runBasedOnPageType();
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
        case IssuePageType.NEW_PULL_REQUEST:
            return this.newRequestPageController.handleExternalApplyLabelsEvent();
        default:
            break;
    }
}

IssuePageController.prototype.subscribeToExternalEvents = function() {

    //$.subscribe("search-bar/apply-selected-labels", this.handleExternalApplyLabelsEvent.bind(this));
    this.applySelectedLabelsEventToken = PubSub.subscribe("search-bar/apply-selected-labels",               
                                                            this.handleExternalApplyLabelsEvents.bind(this));
}

IssuePageController.prototype.cleanup = function() {
    this.issuePageType = IssuePageType.NONE;
    this.existingPageController.cleanUp();
    this.layoutManager.cleanup();
    this.stopBodyObserver();
}

IssuePageController.prototype.isSafeToRun = function() {
    return document.body.querySelector(".sidebar-labels .select-menu-modal") != null;
}

IssuePageController.prototype.runOnNewLabelsPage = function(isRunNow) {
    this.issuePageType = IssuePageType.NEW;
    if(isRunNow){
        this.runBasedOnPageType();
    } else {
        this.run();
    }
}

IssuePageController.prototype.runOnExistingLabelsPage = function(isRunNow) {
    this.issuePageType = IssuePageType.EXISTING;
    if(isRunNow){
        this.runBasedOnPageType();
    } else {
        this.run();
    }
}

IssuePageController.prototype.runOnNewPullRequestPage = function(isRunNow) {
    this.issuePageType = IssuePageType.NEW_PULL_REQUEST;
    if(isRunNow){
        this.runBasedOnPageType();
    } else {
        this.run();
    }
}
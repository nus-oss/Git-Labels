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

IssuePageController.prototype.runBasedOnPageType = function() {
    
    switch(this.issuePageType){
        case IssuePageType.NEW:
            this.newPageController.run(this.layoutManager);
            break;
        case IssuePageType.EXISTING:
            this.existingPageController.run(this.layoutManager);
            break;
        default:
            break;
    }
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
}

IssuePageController.prototype.partialRunOnNewLabelsPage = function(runParams, isEnd) {
    this.issuePageType = IssuePageType.NEW;
    return this.newPageController.partialRun(runParams, this.layoutManager, isEnd);
}

IssuePageController.prototype.partialRunOnExistingLabelsPage = function(runParams, isEnd) {
    this.issuePageType = IssuePageType.EXISTING;
    return this.existingPageController.partialRun(runParams, this.layoutManager, isEnd);
}

IssuePageController.prototype.runOnNewLabelsPage = function() {
    this.issuePageType = IssuePageType.NEW;
    this.runBasedOnPageType();
}

IssuePageController.prototype.runOnExistingLabelsPage = function() {
    this.issuePageType = IssuePageType.EXISTING;
    this.runBasedOnPageType();
}
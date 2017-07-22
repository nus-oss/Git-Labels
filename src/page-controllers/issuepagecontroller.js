var IssuePageType = {
    NEW: 0,
    EXISTING: 1,
    NEW_PULL_REQUEST: 2
}

var IssuePageController = function() {
    this.issuePageType = IssuePageType.NEW;
    this.layoutManager = new LayoutManager();
    this.existingPageController = new ExistingIssuePageController();
    this.newPageController = new NewIssuePageController();
    this.newRequestPageController = new NewPullRequestPageController();
    this.subscribeToExternalEvents();
    // this.applySelectedLabelsEventToken
}

IssuePageController.prototype.handleExternalApplyLabelsEvents = function() {
    switch(this.issuePageType){
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
    this.existingPageController.cleanup();
    this.layoutManager.cleanup();
}

IssuePageController.prototype.runOnNewLabelsPage = function() {
    this.issuePageType = IssuePageType.NEW;
    this.newPageController.run(this.layoutManager);
}

IssuePageController.prototype.runOnExistingLabelsPage = function() {
    this.issuePageType = IssuePageType.EXISTING;
    this.existingPageController.run(this.layoutManager);
}

IssuePageController.prototype.runOnNewPullRequestPage = function() {
    this.issuePageType = IssuePageType.NEW_PULL_REQUEST;
    this.newRequestPageController.run(this.layoutManager)
}
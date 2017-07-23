var RunType = {
    NEW_ISSUE: 0,
    EXISTING_ISSUE: 1,
    NEW_LABELS: 2,
    NEW_PULL_REQUEST: 3,
    EXISTING_PULL_REQUEST: 4,
    NONE: 5
}

var PageControlDelegator = function() {

    this.issuePageController = new IssuePageController();
    this.labelPageController = new LabelPageController();
    this.hasRun = false;

    this.AnalyticsContentForNewIssue = "/<user-name>/<repo-name>/issues/new";
    this.AnalyticsContentForExistingIssue = "/<user-name>/<repo-name>/issues/show";
    this.AnalyticsContentForNewLabels = "/<user-name>/<repo-name>/labels/index";
    this.AnalyticsContentForNewPullRequest = "/<user-name>/<repo-name>/compare/show";
    this.AnalyticsContentForExistingPullRequest = "/<user-name>/<repo-name>/pull_requests/show";
}

PageControlDelegator.prototype.cleanup = function() {
    this.docObserver = null;
    this.runType = null;
    this.runParams = null;
    this.issuePageController.cleanup();
}

PageControlDelegator.prototype.getRunType = function() {

    var location = document.head.querySelector("meta[name='analytics-location']");
    if(!location) {
        return false;
    }

    var locationContent = location.getAttribute("content");
    if(typeof(locationContent) !== "string"){
        return false;
    }

    switch(locationContent){
        case this.AnalyticsContentForNewIssue:
            return RunType.NEW_ISSUE;
        case this.AnalyticsContentForNewPullRequest:
            return RunType.NEW_PULL_REQUEST;
        case this.AnalyticsContentForExistingIssue:
            return RunType.EXISTING_ISSUE;
        case this.AnalyticsContentForExistingPullRequest:
            return RunType.EXISTING_PULL_REQUEST;
        default:
            break;
    }
    
    return RunType.NONE;
}

PageControlDelegator.prototype.partialRun = function(runType, runParams, isEnd) {
    switch(runType){
        case RunType.NEW_ISSUE:
        case RunType.NEW_PULL_REQUEST:
            return this.issuePageController.partialRunOnNewLabelsPage(runParams, isEnd);
        case RunType.EXISTING_ISSUE:
        case RunType.EXISTING_PULL_REQUEST:
            return this.issuePageController.partialRunOnExistingLabelsPage(runParams, isEnd);
        default:
            break;
    }
    return false;
}

PageControlDelegator.prototype.runPageController = function(runType) {

    switch(runType){
        case RunType.NEW_ISSUE:
        case RunType.NEW_PULL_REQUEST:
            this.issuePageController.runOnNewLabelsPage();
            return true;
        case RunType.EXISTING_ISSUE:
        case RunType.EXISTING_PULL_REQUEST:
            this.issuePageController.runOnExistingLabelsPage();
            return true;
        default:
            break;
    }
    
    return false;
}

PageControlDelegator.prototype.stopDocObserver = function() {
    
    if(this.docObserver){

        this.docObserver.disconnect();
        this.docObserver = null;
        
        if(this.runType === null){
            this.runType = this.getRunType();
        }
        this.partialRun(this.runType, this.runParams, true);

        this.runParams = null;
        this.runType = null;
    }
}

PageControlDelegator.prototype.processBody = function() {

    if(!document.body){
        return false;
    }

    if(this.runType === null){
        this.runType = this.getRunType();
    }

    if(!this.partialRun(this.runType, this.runParams, false)){
        return false;
    }

    if(this.docObserver){
        this.docObserver.disconnect();
        this.docObserver = null;
    }
    this.runParams = null;
    this.runType = null;

    return true;
}

PageControlDelegator.prototype.waitForBody = function() {

    this.docObserver = null;
    this.runType = null;
    this.runParams = {};

    if(!this.processBody()){
        this.docObserver = new MutationObserver(this.processBody.bind(this));
        this.docObserver.observe(document, {subtree:true, childList:true});
        document.removeEventListener('DOMContentLoaded', this.stopDocObserver.bind(this));
        document.addEventListener('DOMContentLoaded', this.stopDocObserver.bind(this));
    }
}

PageControlDelegator.prototype.runAtEndOfPushState = function() {
    this.cleanup();
    setTimeout(function(){
        var runType = this.getRunType();
        this.runPageController(runType);
    }.bind(this), 0);
}

PageControlDelegator.prototype.run = function() {
    if(!this.hasRun){
        this.hasRun = true;
        document.addEventListener("pjax:end", this.runAtEndOfPushState.bind(this));
        this.cleanup();
        this.waitForBody();
    }
}

// Main
var pageControllerDelegatorInstance = new PageControlDelegator();
pageControllerDelegatorInstance.run();
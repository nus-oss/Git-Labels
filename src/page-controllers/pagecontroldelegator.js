var PageControlDelegator = function() {

    this.issuePageController = new IssuePageController();
    this.labelPageController = new LabelPageController();

    this.AnalyticsContentForNewIssue = "/<user-name>/<repo-name>/issues/new";
    this.AnalyticsContentForExistingIssue = "/<user-name>/<repo-name>/issues/show";
    this.AnalyticsContentForNewLabels = "/<user-name>/<repo-name>/labels/index";
    this.AnalyticsContentForNewPullRequest = "/<user-name>/<repo-name>/compare/show";
    this.AnalyticsContentForExistingPullRequest = "/<user-name>/<repo-name>/pull_requests/show";
}

PageControlDelegator.prototype.cleanup = function() {
    this.issuePageController.cleanup();
}

PageControlDelegator.prototype.runPageController = function() {

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
            this.issuePageController.runOnNewLabelsPage();
            return true;
        case this.AnalyticsContentForNewPullRequest:
            this.issuePageController.runOnNewPullRequestPage();
            return true;
        case this.AnalyticsContentForExistingIssue:
        case this.AnalyticsContentForExistingPullRequest:
            this.issuePageController.runOnExistingLabelsPage();
            return true;
        default:
            break;
    }
    
    return false;
}

PageControlDelegator.prototype.run = function() {
    this.cleanup();
    this.runPageController();
}

PageControlDelegator.prototype.attachUrlListener = function() {
    chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
        //$(document).ready(this.run.bind(this));
        this.run();
    }.bind(this));
}

// Singleton factory for page delegator
var PageControlDelegatorSingleton = (function(){
    var instance;
    return {
        attachUrlListener: function() {
            if(!instance){
                instance = new PageControlDelegator();
                instance.attachUrlListener();
                return true;
            }
            return false;
        }
    };
})();

// main
PageControlDelegatorSingleton.attachUrlListener();
var BackgroundManager = function() {}

BackgroundManager.prototype.attachListeners = function() {
    this.attachUrlUpdateListener();
}

BackgroundManager.prototype.handleUrlChange = function(tabId, changeInfo, tab) {
    if(changeInfo && changeInfo.status == "complete" && tab && this.isGithubUrl(tab.url)){
        chrome.tabs.sendMessage(tabId, {});
    }
}

BackgroundManager.prototype.attachUrlUpdateListener = function() {
    chrome.tabs.onUpdated.addListener(this.handleUrlChange.bind(this));
}

BackgroundManager.prototype.isGithubUrl = function(url){
    if(typeof(url) !== "string"){
        return false
    }
    return url.search(/^https?:\/\/github\.com(\/.*$|$)+/ig) >= 0;
}

var BackgroundManagerSingleton = (function(){
    var instance;
    return {
        attachListeners: function() {
            if(!instance){
                instance = new BackgroundManager();
                instance.attachListeners();
                return true;
            }
            return false;
        }
    };
})();

//main
BackgroundManagerSingleton.attachListeners();
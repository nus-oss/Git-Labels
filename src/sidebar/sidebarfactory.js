var SideBarFactory = function() {
    this.hasStateInitialized = false;
    this.subscribeToExternalEvents();

    // this.sideBar
}

SideBarFactory.prototype.handleExternalApplyLabelsEvent = function() {
    if(this.hasStateInitialized && this.sideBar){
        $(this.sideBar).sidebar('hide');
    }
}

SideBarFactory.prototype.subscribeToExternalEvents = function() {
    PubSub.subscribe( "search-bar/apply-selected-labels", this.handleExternalApplyLabelsEvent.bind(this));
}

SideBarFactory.prototype.createSideBar = function() {
    
    var sideBar = document.createElement("div");
    sideBar.classList.add( "git-flash-labels-sidebar" ,"ui", "right", "vertical", "inverted", "labeled", "wide", 
                                "sidebar", "menu");
    
    this.sideBar = sideBar;
    this.hasStateInitialized = false;
    
    return sideBar;
}

SideBarFactory.prototype.initializeSideBarState = function(sideBar) {
    
    if(!sideBar){
        return false;
    }

    $(sideBar).sidebar({
        dimPage: false,
        transition: 'overlay'
    }).sidebar('hide');

    if(sideBar === this.sideBar){
        this.hasStateInitialized = true;
    }

    return true;
}

SideBarFactory.prototype.create = function() {
    return this.createSideBar();
}
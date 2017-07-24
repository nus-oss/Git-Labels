var LayoutManager = function() {

    this.launchButtonFactory = new LaunchButtonFactory();
    this.sideBarFactory = new SideBarFactory();
    this.labelGroupsFactory = new LabelGroupsFactory();
    this.selectedLabelsFactory = new SelectedLabelsFactory();
    this.searchFactory = new SearchFactory();
    this.idGenerator = new InstanceIDGenerator();
    this.title = "Apply Labels"

    /*
        this.selectedLabelsAndSearchContainer,
        this.selectedLabels,
        this.sideBarContentContainer,
        this.groupLabels,
        this.sideBar,
        this.launchButton
    */
}

LayoutManager.prototype.isInitialized = function() {
    return (this.storage && this.sideBarFactory && this.labelGroupsFactory && this.selectedLabelsFactory && this.searchFactory);
}

LayoutManager.prototype.generateInstanceID = function() {
    var instanceID = this.idGenerator.getInstanceID();
    this.idGenerator.registerID(instanceID);
    return instanceID;
}

LayoutManager.prototype.publishUIUpdatedEvent = function() {
    var prevInstanceID = this.idGenerator.getPreviousRegisteredID();
    if(prevInstanceID){
        PubSub.publish("side-bar-ui/update-data", {instanceID: prevInstanceID});
    }
}

LayoutManager.prototype.createSideBarHeader = function( headerTitleText ) {

    var sideBarHeader = document.createElement("h3");
    sideBarHeader.classList.add("tag-container-header", "ui", "horizontal", "divider", "header");

    var sidebarHeaderIcon = document.createElement("i");
    sidebarHeaderIcon.classList.add("horizontally", "flipped", "tag", "icon");
    sideBarHeader.appendChild(sidebarHeaderIcon);

    var sidebarHeaderText = document.createElement("div");
    sidebarHeaderText.classList.add("content");

    var sidebarHeaderTextNode = document.createTextNode(headerTitleText);
    sidebarHeaderText.appendChild(sidebarHeaderTextNode);
    sideBarHeader.appendChild(sidebarHeaderText);

    return sideBarHeader;
}

LayoutManager.prototype.appendUIComponentsToContainer = function(container, components) {

    if(!components){
        return false;
    }

    if(Array.isArray(components)){
        for(var i = 0; i < components.length; ++i){
            container.appendChild(components[i]);
        }
    } else {
        container.appendChild(components);
    }

    return true;
}

LayoutManager.prototype.replaceElements = function( parentContainer, oldElements, newElements ) {

    if(!parentContainer || !oldElements || !newElements){
        return false;
    }

    if(Array.isArray(newElements)){

        if(!Array.isArray(oldElements) || newElements.length !== oldElements.length){
            return false;
        }

        for(let i = 0; i < newElements.length; ++i){
            parentContainer.replaceChild( newElements[i], oldElements[i] );
        }

    } else {
        parentContainer.replaceChild( newElements, oldElements );
    }

    return true;
}

LayoutManager.prototype.addUIComponentsToSideBar = function(headerTitleText, sideBar) {

    if(typeof(headerTitleText) !== "string" || !sideBar){
        return false;
    }

    var selectedLabels = this.selectedLabelsFactory.create();

    var sideBarContentContainer = document.createElement("div");
    sideBarContentContainer.classList.add("ui", "fluid", "droptaglistcontainer");

    var sideBarHeader = this.createSideBarHeader(headerTitleText);
    if(!this.appendUIComponentsToContainer(sideBarContentContainer, sideBarHeader)){
        return false;
    }

    var selectedLabelsAndSearchContainer = document.createElement("div");
    selectedLabelsAndSearchContainer.classList.add("tag-container", "ui", "raised", "segment");
    if(!this.appendUIComponentsToContainer(selectedLabelsAndSearchContainer, selectedLabels)){
        return false;
    }

    var searchComponents = this.searchFactory.create();
    if(!this.appendUIComponentsToContainer(selectedLabelsAndSearchContainer, searchComponents)){
        return false;
    }

    if(!this.appendUIComponentsToContainer(sideBarContentContainer, selectedLabelsAndSearchContainer)){
        return false;
    }

    var groupLabels = this.labelGroupsFactory.create();
    if(!this.appendUIComponentsToContainer(sideBarContentContainer, groupLabels)){
        return false;
    }

    if(!this.appendUIComponentsToContainer(sideBar, sideBarContentContainer)){
        return false;
    }

    this.selectedLabels = selectedLabels;
    this.sideBarContentContainer = sideBarContentContainer;
    this.selectedLabelsAndSearchContainer = selectedLabelsAndSearchContainer;
    this.groupLabels = groupLabels;

    return true;
}

LayoutManager.prototype.toggleSideBar = function() {
    if(this.sideBar){
        var $sideBar = $(this.sideBar);
        if(!$sideBar.sidebar("is visible")){
            PubSub.publishSync("side-bar-ui/visible", {});
        } else {
            PubSub.publishSync("side-bar-ui/hidden", {});
        }
        $sideBar.sidebar("toggle");
    }
}

LayoutManager.prototype.attachListenersToLaunchButton = function(launchButton, sideBar) {

    var $sideBar = $(sideBar);
    $(launchButton).click(function() {
        if(!$sideBar.sidebar("is visible")){
            PubSub.publishSync("side-bar-ui/visible", {});
        } else {
            PubSub.publishSync("side-bar-ui/hidden", {});
        }
        $sideBar.sidebar("toggle");
    });
}

LayoutManager.prototype.wrapBodyInContainer = function() {

    var container = document.getElementsByClassName("pusher");

    if(container.length > 0){
        return true;
    }

    container = document.createElement("div");
    container.classList.add("pusher");

    while (document.body.firstChild) {
        container.appendChild(document.body.firstChild);
    }
    document.body.appendChild(container);

    return true;
}

LayoutManager.prototype.showSidebar = function(sideBar) {
    sideBar.style.display = "block";
    return true;
}

LayoutManager.prototype.hideSidebar = function(sideBar) {
    sideBar.style.display = "none";
    return true;
}

LayoutManager.prototype.showLaunchButton = function(launchButton) {
    launchButton.style.display = "block";
    return true;
}

LayoutManager.prototype.hideLaunchButton = function(launchButton) {
    launchButton.style.display = "none";
    return true;
}

LayoutManager.prototype.injectSideBarUI = function() {

    this.wrapBodyInContainer();
    document.body.classList.add("pushable");

    var sideBar = this.sideBarFactory.create();
    if(!sideBar){
        return false;
    }

    if(!this.addUIComponentsToSideBar(this.title, sideBar)){
        return false;
    }

    this.sideBar = sideBar;

    document.body.prepend(sideBar);
    this.attachListenersToLaunchButton(this.launchButton, sideBar);
    this.sideBarFactory.initializeSideBarState(sideBar);

    return true;
}

LayoutManager.prototype.injectLaunchButtonUI = function() {

    this.wrapBodyInContainer();
    document.body.classList.add("pushable");

    var launchButton = this.launchButtonFactory.create(this.title);
    if(!launchButton) {
        return false;
    }
    this.launchButton = launchButton;

    if(this.sideBar.nextSibling){
        document.body.insertBefore(launchButton, this.sideBar.nextSibling);
    } else {
        document.body.appendChild(launchButton);
    }

    this.attachListenersToLaunchButton(launchButton, this.sideBar);

    return true;
}

LayoutManager.prototype.injectUI = function() {

    this.wrapBodyInContainer();
    document.body.classList.add("pushable");

    var sideBar = this.sideBarFactory.create();
    if(!sideBar){
        return false;
    }
    
    var launchButton = this.launchButtonFactory.create(this.title);
    if(!launchButton) {
        return false;
    }

    if(!this.addUIComponentsToSideBar(this.title, sideBar)){
        return false;
    }

    this.launchButton = launchButton;
    this.sideBar = sideBar;

    document.body.prepend(launchButton);
    document.body.prepend(sideBar);
    
    this.attachListenersToLaunchButton(launchButton, sideBar);
    this.sideBarFactory.initializeSideBarState(sideBar);

    return true;
}

LayoutManager.prototype.initializeUI = function() {

    var hasSideBar = this.sideBar != null && document.body.contains(this.sideBar);
    var hasLaunchButton = this.launchButton != null && document.body.contains(this.launchButton);

    if(hasSideBar && hasLaunchButton){
        document.body.classList.add("pushable");
        if(this.showSidebar(this.sideBar) && this.showLaunchButton(this.launchButton)){
            return UpdateUIType.UpdateData;
        }
    } else if ( !hasSideBar && !hasLaunchButton ){
        if(this.injectUI()){
            return UpdateUIType.UpdateData;
        }
    } else if (!hasSideBar) {
        if(this.injectSideBarUI() && this.showLaunchButton(this.launchButton)){
            return UpdateUIType.UpdateData;
        }
    } else {
        if(this.injectLaunchButtonUI() && this.showSidebar(this.sideBar)){
            return UpdateUIType.UpdateData;
        }
    }
    return UpdateUIType.Error;
}

LayoutManager.prototype.updateUIWithData = function(storage) {
    
    if(!(storage instanceof ItemStorage) || !this.selectedLabelsAndSearchContainer || !this.selectedLabels 
            || !this.sideBarContentContainer || !this.groupLabels){
        return false;
    }

    this.publishUIUpdatedEvent();
    var instanceID = this.generateInstanceID();

    var selectedLabels = this.selectedLabelsFactory.create(storage);
    if(!this.replaceElements(this.selectedLabelsAndSearchContainer, this.selectedLabels, selectedLabels)){
        return false;
    }

    var groupLabels = this.labelGroupsFactory.create(storage, instanceID);
    if(!this.replaceElements(this.sideBarContentContainer, this.groupLabels, groupLabels)){
        return false;
    }

    if(!this.searchFactory.updateSearchData(storage)){
        return false;
    }
   
    this.storage = storage;
    this.selectedLabels = selectedLabels;
    this.groupLabels = groupLabels;

    return false;
}

LayoutManager.prototype.updateUIWithDataAsync = async function(storage) {
    await this.updateUIWithData(storage);
}

LayoutManager.prototype.populateUIWithData = function(updateUIType, storage) {
    switch(updateUIType){
        case UpdateUIType.UpdateData:
            return this.updateUIWithDataAsync(storage);
        default:
            break;
    }
    return null;
}

LayoutManager.prototype.cleanup = function() {

    // Clean up for sidebar
    if(this.sideBar != null){
        $(this.sideBar).sidebar("hide");
        this.hideSidebar(this.sideBar);
    }
    if(this.launchButton != null) {
        this.hideLaunchButton(this.launchButton);
    }

    // Clean up for search input
    this.searchFactory.cleanup();
}
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
    return (this.storage && this.launchButtonFactory && this.sideBarFactory && this.labelGroupsFactory && 
                this.selectedLabelsFactory && this.searchFactory);
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
    sidebarHeaderIcon.classList.add("github", "icon");
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

LayoutManager.prototype.createSideBarWithContent = function( headerTitleText, instanceID ) {

    if(!this.isInitialized()){
        return null;
    }

    this.selectedLabels = this.selectedLabelsFactory.create(this.storage);

    var sideBar = this.sideBarFactory.create();

    this.sideBarContentContainer = document.createElement("div");
    this.sideBarContentContainer.classList.add("ui", "fluid", "droptaglistcontainer");

    var sideBarHeader = this.createSideBarHeader(headerTitleText);
    if(!this.appendUIComponentsToContainer(this.sideBarContentContainer, sideBarHeader)){
        return null;
    }

    this.selectedLabelsAndSearchContainer = document.createElement("div");
    this.selectedLabelsAndSearchContainer.classList.add("tag-container", "ui", "raised", "segment");

    if(!this.appendUIComponentsToContainer(this.selectedLabelsAndSearchContainer, this.selectedLabels)){
        return null;
    }

    var searchComponents = this.searchFactory.create(this.storage);
    if(!this.appendUIComponentsToContainer(this.selectedLabelsAndSearchContainer, searchComponents)){
        return null;
    }

    if(!this.appendUIComponentsToContainer(this.sideBarContentContainer, this.selectedLabelsAndSearchContainer)){
        return null;
    }

    this.groupLabels = this.labelGroupsFactory.create(this.storage, instanceID);
    if(!this.appendUIComponentsToContainer(this.sideBarContentContainer, this.groupLabels)){
        return null;
    }

    if(!this.appendUIComponentsToContainer(sideBar, this.sideBarContentContainer)){
        return null;
    }

    return sideBar;
}

LayoutManager.prototype.attachListenersToLaunchButton = function(launchButton, sideBar) {
    
    var $sideBar = $(sideBar);
    
    $(launchButton).click(function() {
        if(!$sideBar.sidebar("is visible")){
            PubSub.publish("side-bar-ui/visible", {});
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

LayoutManager.prototype.hasUIComponentsForUpdate = function(){
    return this.selectedLabelsAndSearchContainer != null && this.selectedLabels != null
            && this.sideBarContentContainer != null && this.groupLabels != null;
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

LayoutManager.prototype.updateUI = function(storage) {

    if(!(storage instanceof ItemStorage) || !this.hasUIComponentsForUpdate()){
        return false;
    }

    this.publishUIUpdatedEvent();
    var instanceID = this.generateInstanceID();

    this.storage = storage;

    var selectedLabels = this.selectedLabelsFactory.create(this.storage);
    if(this.replaceElements(this.selectedLabelsAndSearchContainer, this.selectedLabels, selectedLabels)){
        this.selectedLabels = selectedLabels;
    }

    var groupLabels = this.labelGroupsFactory.create(this.storage, instanceID);
    if(this.replaceElements(this.sideBarContentContainer, this.groupLabels, groupLabels)){
        this.groupLabels = groupLabels;
    }

    this.searchFactory.updateSearchData(this.storage);

    return true;
}

LayoutManager.prototype.injectSideBarUI = function() {

    this.wrapBodyInContainer();
    document.body.classList.add("pushable");

    this.publishUIUpdatedEvent();
    var instanceID = this.generateInstanceID();

    var sideBar = this.createSideBarWithContent(this.title, instanceID);
    if(!sideBar) {
        return false;
    }

    this.sideBar = sideBar;

    document.body.prepend(this.sideBar);

    this.attachListenersToLaunchButton(this.launchButton, this.sideBar);
    this.sideBarFactory.initializeSideBarState(this.sideBar);

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
        document.body.insertBefore(this.launchButton, this.sideBar.nextSibling);
    } else {
        document.body.appendChild(this.launchButton);
    }

    this.attachListenersToLaunchButton(this.launchButton, this.sideBar);

    return true;
}

LayoutManager.prototype.injectUI = function() {

    this.wrapBodyInContainer();
    document.body.classList.add("pushable");

    this.publishUIUpdatedEvent();
    var instanceID = this.generateInstanceID();

    var sideBar = this.createSideBarWithContent(this.title, instanceID);
    if(!sideBar) {
        return false;
    }
    
    var launchButton = this.launchButtonFactory.create(this.title);
    if(!launchButton) {
        return false;
    }

    this.sideBar = sideBar;
    this.launchButton = launchButton;

    document.body.prepend(launchButton);
    document.body.prepend(sideBar);
    
    this.attachListenersToLaunchButton(launchButton, sideBar);
    this.sideBarFactory.initializeSideBarState(sideBar);

    return true;
}

LayoutManager.prototype.initializeUI = function(storage) {

    if(!(storage instanceof ItemStorage)){
        return false;
    }

    this.storage = storage;

    var hasSideBar = this.sideBar != null && document.body.contains(this.sideBar);
    var hasLaunchButton = this.launchButton != null && document.body.contains(this.launchButton);

    if(hasSideBar && hasLaunchButton){
        document.body.classList.add("pushable");
        this.showSidebar(this.sideBar);
        this.showLaunchButton(this.launchButton);
        return this.updateUI(this.storage);
    } else if ( !hasSideBar && !hasLaunchButton ){
        return this.injectUI();
    } else if (!hasSideBar) {
        return this.injectSideBarUI() && this.showLaunchButton(this.launchButton);
    } else {
        this.showSidebar(this.sideBar);
        return this.injectLaunchButtonUI() && this.updateUI(this.storage);
    }
}

LayoutManager.prototype.cleanup = function() {

    // Clean up for sidebar
    if(this.sideBar != null && document.body.contains(this.sideBar)){
        this.hideSidebar(this.sideBar);
    }
    if(this.launchButton != null && document.body.contains(this.launchButton)) {
        this.hideLaunchButton(this.launchButton);
    }
    document.body.classList.remove("pushable");

    // Clean up for search input
    this.searchFactory.cleanup();
}
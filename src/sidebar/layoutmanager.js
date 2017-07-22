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

LayoutManager.prototype.createSideBarContent = function(headerTitleText, instanceID) {

    var selectedLabels = this.selectedLabelsFactory.create(this.storage);
    if(!selectedLabels){
        throw new Error(-1);
    }

    var sideBarContentContainer = document.createElement("div");
    if(!sideBarContentContainer){
        throw new Error(-1);
    }
    sideBarContentContainer.classList.add("ui", "fluid", "droptaglistcontainer");

    var sideBarHeader = this.createSideBarHeader(headerTitleText);
    if(!this.appendUIComponentsToContainer(sideBarContentContainer, sideBarHeader)){
        throw new Error(-1);
    }

    var selectedLabelsAndSearchContainer = document.createElement("div");
    if(!selectedLabelsAndSearchContainer){
        throw new Error(-1);
    }
    selectedLabelsAndSearchContainer.classList.add("tag-container", "ui", "raised", "segment");

    if(!this.appendUIComponentsToContainer(selectedLabelsAndSearchContainer, selectedLabels)){
        throw new Error(-1);
    }

    var searchComponents = this.searchFactory.create(this.storage);
    if(!this.appendUIComponentsToContainer(selectedLabelsAndSearchContainer, searchComponents)){
        throw new Error(-1);
    }

    if(!this.appendUIComponentsToContainer(sideBarContentContainer, selectedLabelsAndSearchContainer)){
        throw new Error(-1);
    }

    var groupLabels = this.labelGroupsFactory.create(this.storage, instanceID);
    if(!this.appendUIComponentsToContainer(sideBarContentContainer, groupLabels)){
        throw new Error(-1);
    }

    if(!this.appendUIComponentsToContainer(this.sideBar, sideBarContentContainer)){
        throw new Error(-1);
    }

    this.selectedLabels = selectedLabels;
    this.sideBarContentContainer = sideBarContentContainer;
    this.selectedLabelsAndSearchContainer = selectedLabelsAndSearchContainer;
    this.groupLabels = groupLabels;
}

LayoutManager.prototype.createSideBarContentAsync = async function(headerTitleText, instanceID) {
    await this.createSideBarContent(headerTitleText, instanceID);
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
            return UpdateUIType.CreateAll;
        }
    } else if (!hasSideBar) {
        if(this.injectSideBarUI() && this.showLaunchButton(this.launchButton)){
            return UpdateUIType.CreateAll;
        }
    } else {
        if(this.injectLaunchButtonUI() && this.showSidebar(this.sideBar)){
            return UpdateUIType.UpdateData;
        }
    }
    return UpdateUIType.Error;
}

LayoutManager.prototype.hasUIComponentsForUpdate = function(){
    return this.selectedLabelsAndSearchContainer != null && this.selectedLabels != null
            && this.sideBarContentContainer != null && this.groupLabels != null;
}

LayoutManager.prototype.updateUIWithData = function(storage) {
    
    if(!(storage instanceof ItemStorage) || !this.hasUIComponentsForUpdate()){
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

    this.storage = storage;
    this.selectedLabels = selectedLabels;
    this.groupLabels = groupLabels;
    this.searchFactory.updateSearchData(storage);

    return false;
}

LayoutManager.prototype.populateSideBarWithContents = function(storage) {

    if(!(storage instanceof ItemStorage) || !this.sideBar || !this.launchButton){
        return false;
    }
    this.storage = storage;

    this.publishUIUpdatedEvent();
    var instanceID = this.generateInstanceID();

    try{
        this.createSideBarContentAsync(this.title, instanceID);
    } catch(error){
        this.storage = null;
        console.error(error);
    }

    return true;
}

LayoutManager.prototype.populateUIWithData = function(updateUIType, storage) {
    switch(updateUIType){
        case UpdateUIType.CreateAll:
            return this.populateSideBarWithContents(storage);
        case UpdateUIType.UpdateData:
            return this.updateUIWithData(storage);
        default:
            break;
    }
    return false;
}

LayoutManager.prototype.cleanup = function() {

    // Clean up for sidebar
    if(this.sideBar != null && document.body.contains(this.sideBar)){
        $(this.sideBar).sidebar("hide");
        this.hideSidebar(this.sideBar);
    }
    if(this.launchButton != null && document.body.contains(this.launchButton)) {
        this.hideLaunchButton(this.launchButton);
    }
    document.body.classList.remove("pushable");

    // Clean up for search input
    this.searchFactory.cleanup();
}
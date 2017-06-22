var SelectedLabelsFactory = function() {

    this.subscribeToExternalEvents();

    /*  Other variables present in this class|
        -------------------------------------|
        this.storage,
        this.selectedContainer
    */

    // Events published
    // PubSub.publish("selected-label/select-item/"+groupID, {itemID: itemID} );
    // PubSub.publish("selected-label/unselect-item/"+groupID, {itemID: itemID} );

    /* Events handled
       PubSub.subscribe("group-label/unselect-item", this.handleExternalUnselectLabelEvent.bind(this));
       PubSub.subscribe("group-label/select-item", this.handleExternalSelectLabelEvent.bind(this));
       PubSub.subscribe("search/toggle-select-item", this.handleSearchSelectEvent.bind(this));
    */
}

SelectedLabelsFactory.prototype.subscribeToExternalEvents = function() {

    this.groupLabelUnselectItemEventToken = PubSub.subscribe("group-label/unselect-item", 
                                                               this.handleExternalUnselectLabelEvent.bind(this));

    this.groupLabelSelectItemEventToken = PubSub.subscribe("group-label/select-item", 
                                                                this.handleExternalSelectLabelEvent.bind(this));

    this.searchLabelSelectItemEventToken = PubSub.subscribe("search/toggle-select-item", 
                                                                this.handleSearchToggleSelectEvent.bind(this));
}

SelectedLabelsFactory.prototype.addLabel = function(itemID) {

    var item = this.storage.getItem(itemID);
        
    if(!item){
        return false;
    }
    
    var groupID = item.getGroupID();
    var groupInfo = this.storage.getGroupDetails(groupID);

    if(!groupInfo){
        return false;
    }

    label = this.createLabelHTML(groupID, groupInfo, item);
    if(!this.processLabel(label)){
        return false;
    }

    return this.handleLabelSelection(label);
}

SelectedLabelsFactory.prototype.handleSearchToggleSelectEvent = function(msg, data) {

    if(!data){
        return false;
    }

    var itemID = data.itemID;

    if(typeof(itemID) !== "string"){
        return false;
    }

    var label = this.selectedContainer.querySelector(".custom-label[data-item-id='"+itemID+"']");

    if(!label){
        return this.addLabel(itemID);
    } else if(!this.isLabelSelected(label)) {
        return this.handleLabelSelection(label);
    } else {
        return this.unselectLabel(label, true);
    }
}

SelectedLabelsFactory.prototype.handleExternalUnselectLabelEvent = function(msg, data) {

    if(!data){
        return false;
    }

    var itemID = data.itemID;

    if(typeof(itemID) !== "string"){
        return false;
    }

    var label = this.selectedContainer.querySelector(".custom-label[data-item-id='"+itemID+"']");

    if(!label){
        return false;
    }

    if(this.isLabelSelected(label)){
        return this.unselectLabel(label, true);
    }
    return true;
}

SelectedLabelsFactory.prototype.handleExternalSelectLabelEvent = function(msg, data) {

    if(!data){
        return false;
    }

    var groupID = data.groupID;
    var itemID = data.itemID;

    if(typeof(groupID) !== "string" || typeof(itemID) !== "string"){
        return false;
    }

    var label = this.selectedContainer.querySelector(".custom-label[data-item-id='"+itemID+"']");

    if(!label){
        return this.addLabel(itemID);
    }

    return this.isLabelSelected(label) || this.handleLabelSelection(label);
}

SelectedLabelsFactory.prototype.handleExternalUnselectLabelEvent = function(msg, data) {

    if(!data){
        return false;
    }

    var itemID = data.itemID;

    if(typeof(itemID) !== "string"){
        return false;
    }

    var label = this.selectedContainer.querySelector(".custom-label[data-item-id='"+itemID+"']");

    if(!label){
        return false;
    }

    if(this.isLabelSelected(label)){
        return this.unselectLabel(label, true);
    }
    return true;
}

SelectedLabelsFactory.prototype.createLabelHTML = function( groupID, groupInfo, item ) {

    var label = document.createElement("a");
    label.classList.add( "ui", "large", "label", "selected-label", "custom-label" );
    label.setAttribute( "data-item-id", item.getID() );
    label.setAttribute( "data-group-id", groupID );

    var labelColorIcon = document.createElement("i");
    labelColorIcon.classList.add("square", "icon", "left-side");
    labelColorIcon.style.setProperty("color", item.getColor());
    label.appendChild(labelColorIcon);

    var labelContent = document.createElement("span");
    labelContent.classList.add("label-content");

    var labelContentTextNode = document.createTextNode(item.getFullName());
    labelContent.appendChild(labelContentTextNode);

    label.appendChild(labelContent);

    return label;
}

SelectedLabelsFactory.prototype.isEligibleForSelection = function(groupID, groupInfo) {

    if(!this.selectedContainer){
        return false;
    }

    if(!groupInfo.isExclusive()){
        return true;
    } else {
        return !this.selectedContainer.querySelector(".custom-label[data-group-id='"+groupID+"']");
    }
}

SelectedLabelsFactory.prototype.updateStorage = function(itemID, isSelected) {
    if(isSelected){
        this.storage.selectItem(itemID);
    } else {
        this.storage.unselectItem(itemID);
    }
}

SelectedLabelsFactory.prototype.create = function(storage) {

    if(!(storage instanceof ItemStorage)){
        return null;
    }

    this.storage = storage;

    this.selectedContainer = document.createElement("div");
    this.selectedContainer.classList.add("selected-group-container");

    var itemItr = this.storage.getSelectedItemIDsIterator();
    while(true){

        var itemObj = itemItr.next();

        if(itemObj.done){
            break;
        }

        var itemID = itemObj.value;
        var item = this.storage.getItem(itemID);
        
        if(!item){
            continue;
        }

        var groupID = item.getGroupID();
        var groupInfo = this.storage.getGroupDetails(groupID);

        if(!groupInfo){
            continue;
        }
        
        var label = this.createLabelHTML( groupID, groupInfo, item );

        if(!this.isEligibleForSelection(groupID, groupInfo)){
            this.styleLabelForUnselection(label);
            this.updateStorage(itemID, false);
        }

        this.processLabel(label);
    }

    return this.selectedContainer;
}

SelectedLabelsFactory.prototype.processLabel = function(label) {
    if(this.selectedContainer){
        this.attachLabelEventListeners(label);
        this.selectedContainer.appendChild(label);
        return true;
    }
    return false;
}

SelectedLabelsFactory.prototype.attachLabelEventListeners = function(label) {
    $(label).on("mousedown", {label: label}, this.handleLabelClickEvent.bind(this));
}

SelectedLabelsFactory.prototype.handleLabelClickEvent = function(event) {
    
    if(!event || event.which !== MouseButtonType.Left ){
        return true;
    }

    var data = event.data;

    if(!data || !data.hasOwnProperty("label")){
        return true;
    }

    var label = data.label;

    var isPropagateEvent;
    if(!this.isLabelSelected(label)){
        isPropagateEvent = !this.handleLabelSelection(label);
    } else {
        isPropagateEvent = !this.unselectLabel(label, true);
    }

    return isPropagateEvent;
}

SelectedLabelsFactory.prototype.isLabelSelected = function(label) {
    return !label.classList.contains("removed");
}

SelectedLabelsFactory.prototype.handleLabelSelection = function(label){

    if(!this.selectedContainer){
        return false;
    }

    var groupID = label.getAttribute("data-group-id");

    if(!groupID){
        return false;
    }

    var groupInfo = this.storage.getGroupDetails(groupID);
    var isGroupExclusive = groupInfo.isExclusive();

    if(!isGroupExclusive){
        return this.handleNonExclusiveGroupsLabelSelection(label);
    } else {
        return this.handleExclusiveGroupsLabelSelection(label);
    }
}

SelectedLabelsFactory.prototype.handleNonExclusiveGroupsLabelSelection = function(label) {
    return this.selectLabel(label, true);
}

SelectedLabelsFactory.prototype.selectLabel = function(label, isEmitEvent) {
    
    var groupID = label.getAttribute("data-group-id");
    var itemID = label.getAttribute("data-item-id");

    if(typeof(groupID) !== "string" || typeof(itemID) !== "string"){
        return false;
    }

    return this.selectLabelWithIDs(label, groupID, itemID, isEmitEvent);
}

SelectedLabelsFactory.prototype.selectLabelWithIDs = function(label, groupID, itemID, isEmitEvent) {
    this.styleLabelForSelection(label);
    this.updateStorage(itemID, true);
    if(isEmitEvent){
        this.publishSelectLabelEvent(groupID, itemID);
    } 
    return true;
}

SelectedLabelsFactory.prototype.styleLabelForSelection = function(label) {
    label.classList.remove("removed");
}

SelectedLabelsFactory.prototype.publishSelectLabelEvent = function(groupID, itemID) {
    if(typeof(groupID) === "string"){
        PubSub.publish("selected-label/select-item/"+groupID, {itemID: itemID} );
    }
}

SelectedLabelsFactory.prototype.handleExclusiveGroupsLabelSelection = function(label) {

    var groupID = label.getAttribute("data-group-id");
    var itemID = label.getAttribute("data-item-id");

    if(typeof(groupID) !== "string" || typeof(itemID) !== "string"){
        return false;
    }

    this.selectLabelWithIDs(label, groupID, itemID, true);

    var queryStr = ".custom-label[data-item-id][data-group-id='"+groupID+"']:not([data-item-id='"+itemID+"'])";
    var sameGroupLabels = this.selectedContainer.querySelectorAll(queryStr);

    var isUnselected = true;
    for(let i = 0; i < sameGroupLabels.length; ++i){
        isUnselected &= this.unselectLabel(sameGroupLabels[i], true);
    }

    return isUnselected;
}

SelectedLabelsFactory.prototype.unselectLabel = function(label, isEmitEvent) {
    
    var groupID = label.getAttribute("data-group-id");
    var itemID = label.getAttribute("data-item-id");

    if(typeof(groupID) !== "string" || typeof(itemID) !== "string"){
        return false;
    }

    return this.unselectLabelWithIDs(label, groupID, itemID, isEmitEvent);
}

SelectedLabelsFactory.prototype.unselectLabelWithIDs = function(label, groupID, itemID, isEmitEvent) {
    this.styleLabelForUnselection(label);
    this.updateStorage(itemID, false);
    if(isEmitEvent){
        this.publishUnselectLabelEvent(groupID, itemID);
    } 
    return true;
}

SelectedLabelsFactory.prototype.styleLabelForUnselection = function(label) {
    label.classList.add("removed");
}

SelectedLabelsFactory.prototype.publishUnselectLabelEvent = function(groupID, itemID) {
    if(typeof(groupID) === "string"){
        PubSub.publish("selected-label/unselect-item/"+groupID, {itemID: itemID} );
    }
}
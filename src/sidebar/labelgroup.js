var LabelGroup = function( groupID, groupInfo, instanceID ) {
    
    this.groupID = groupID;
    this.groupInfo = groupInfo;
    this.instanceID = instanceID;
    this.items = [];

    this.subscribeToExternalEvents();

    /* Events published
    
       PubSub.publish("group-label/unselect-item", {itemID: itemID} );
       PubSub.publish("group-label/select-item", {itemID: itemID, groupID: this.groupID} );
    */

    /* Events handled

       PubSub.subscribe("selected-label/unselect-item/"+this.groupID, this.handleExternalUnselectLabelEvent.bind(this);
       PubSub.subscribe("selected-label/select-item/"+this.groupID, this.handleExternalSelectLabelEvent.bind(this));
       PubSub.subscribe("side-bar-ui/update-data", this.handleDestroyedEvent.bind(this) );
    */

    /* Additional variables

       this.selectedLabelsUnselectItemEventToken,
       this.selectedLabelsSelectItemEventToken,
       this.destroyedEventToken
    */
}

LabelGroup.prototype.getGroupName = function() {
    return this.groupInfo.getGroupName();
}

LabelGroup.prototype.getGroupType = function() {
    return this.groupInfo.getGroupType();
}

LabelGroup.prototype.addItem = function( item ) {
    if(item){
        this.items.push(item);
        return true;
    }
    return false;
}

LabelGroup.prototype.handleExternalSelectLabelEvent = function(msg, data) {

    if(!data){
        return false;
    }

    var itemID = data.itemID;

    if(typeof(itemID) !== "string"){
        return false;
    }

    var label = this.expandedInnerContainer.querySelector(".group-label[data-item-id='"+itemID+"']");

    if(!label){
        return false;
    }
    
    return this.isLabelSelected(label) || this.selectLabel(label);
}

LabelGroup.prototype.handleExternalUnselectLabelEvent = function(msg, data) {

    if(!data){
        return false;
    }

    var itemID = data.itemID;

    if(typeof(itemID) !== "string"){
        return false;
    }

    var label = this.expandedInnerContainer.querySelector(".group-label[data-item-id='"+itemID+"']");

    if(!label){
        return false;
    }

    return !this.isLabelSelected(label) || this.unselectLabel(label);
}

LabelGroup.prototype.handleDestroyedEvent = function(msg, data) {

    if(!data){
        return false;
    }

    var instanceID = data.instanceID;

    if(typeof(instanceID) !== "string" || this.instanceID !== instanceID){
        return false;
    }

    PubSub.unsubscribe(this.selectedLabelsUnselectItemEventToken);
    PubSub.unsubscribe(this.selectedLabelsSelectItemEventToken);
    PubSub.unsubscribe(this.destroyedEventToken);

    return true;
}

LabelGroup.prototype.subscribeToExternalEvents = function() {

    if(!this.groupID){
        return false;
    }

    this.selectedLabelsUnselectItemEventToken = PubSub.subscribe("selected-label/unselect-item/"+this.groupID, 
                                                        this.handleExternalUnselectLabelEvent.bind(this));


    this.selectedLabelsSelectItemEventToken = PubSub.subscribe("selected-label/select-item/"+this.groupID, 
                                                        this.handleExternalSelectLabelEvent.bind(this));

    this.destroyedEventToken = PubSub.subscribe("side-bar-ui/update-data", this.handleDestroyedEvent.bind(this) );

    return true;
}

LabelGroup.prototype.getCollapsedContainerStartingTextNode = function() {
    switch(this.groupInfo.getGroupType()){
        case GroupType.Dash:
            return document.createTextNode(this.groupInfo.getGroupName() + "-[labels] group");
        case GroupType.Dot:
            return document.createTextNode(this.groupInfo.getGroupName() + ".[labels] group");
        case GroupType.None:
            return document.createTextNode("Non-grouped labels");
        default:
            return document.createTextNode("Unknown labels");
    }
}

LabelGroup.prototype.createCollapsedContainer = function(isCacheDOM) {

    var outerCollapsedContainer = document.createElement("div");
    outerCollapsedContainer.classList.add("collapsed-group-container", "ui", "raised", "segment");
    outerCollapsedContainer.setAttribute("data-group-id", this.groupID);
    outerCollapsedContainer.setAttribute("data-group-type", this.groupInfo.getGroupType()+"");

    var innerCollapsedContainer = document.createElement("div");
    innerCollapsedContainer.classList.add("ui", "container");

    var collapsedContainerIcon = document.createElement("i")
    collapsedContainerIcon.classList.add("big", "caret", "down", "icon");
    innerCollapsedContainer.appendChild(collapsedContainerIcon);

    var collapsedContainerTextNode = document.createElement("span")
    collapsedContainerTextNode.classList.add("content");

    var collapsedContainerText = this.getCollapsedContainerStartingTextNode();
    collapsedContainerTextNode.appendChild(collapsedContainerText);
    innerCollapsedContainer.appendChild(collapsedContainerTextNode);

    outerCollapsedContainer.appendChild(innerCollapsedContainer);
    
    if(isCacheDOM){
        this.collapsedInnerContainer = innerCollapsedContainer;
        this.collapsedOuterContainer = outerCollapsedContainer;
        this.collapsedContainerIcon = collapsedContainerIcon;
    }

    return outerCollapsedContainer;
};

LabelGroup.prototype.styleLabelIconForUnselection = function(labelIcon) {
    labelIcon.classList.remove("check", "square");
    labelIcon.classList.add("square");
}

LabelGroup.prototype.styleLabelIconForSelection = function(labelIcon) {
    labelIcon.classList.remove("square");
    labelIcon.classList.add("check", "square");
}

LabelGroup.prototype.createLabel = function(labelItem) {

    var label = document.createElement("a");
    label.classList.add("ui", "large", "label", "custom-label", "group-label");
    label.setAttribute("data-item-id", labelItem.getID());
    
    var labelColorIcon = document.createElement("i");
    labelColorIcon.classList.add("icon", "left-side");

    if(labelItem.isSelected()){
        this.styleLabelIconForSelection(labelColorIcon);
    } else {
        this.styleLabelIconForUnselection(labelColorIcon);
    }

    labelColorIcon.style.setProperty("color", labelItem.getColor());
    label.appendChild(labelColorIcon);

    var labelTextNode = document.createElement("span");
    labelTextNode.classList.add("label-content");

    var labelText = document.createTextNode(labelItem.getName());
    labelTextNode.appendChild(labelText);
    label.appendChild(labelTextNode);

    return label;
}

LabelGroup.prototype.publishUnselectLabelEvent = function(itemID) {
    PubSub.publish("group-label/unselect-item", {itemID: itemID} );
}

LabelGroup.prototype.unselectLabelWithoutEmittingEvent = function(label) {
    
    var labelIcon = label.getElementsByClassName("icon");

    if(labelIcon.length <= 0){
        return false;
    }

    this.styleLabelIconForUnselection(labelIcon[0]);
    return true;
}

LabelGroup.prototype.unselectLabel = function(label) {

    var itemID = label.getAttribute("data-item-id");

    if(!itemID ){
        return false;
    }

    if(this.unselectLabelWithoutEmittingEvent(label)){
        this.publishUnselectLabelEvent(itemID);
    }
    
    return true;
}

LabelGroup.prototype.publishSelectLabelEvent = function(itemID) {
    PubSub.publish("group-label/select-item", {itemID: itemID, groupID: this.groupID} );
}

LabelGroup.prototype.selectLabelWithoutEmittingEvent = function(label) {
    
    var labelIcon = label.getElementsByClassName("icon");

    if(labelIcon.length <= 0){
        return false;
    }

    this.styleLabelIconForSelection(labelIcon[0]);
    return true;
}

LabelGroup.prototype.selectLabel = function(label) {
    
    var itemID = label.getAttribute("data-item-id");

    if(!itemID ){
        return false;
    }

    if(this.selectLabelWithoutEmittingEvent(label)){
        this.publishSelectLabelEvent(itemID);
    }

    return true;
}

LabelGroup.prototype.isLabelSelected = function(label) {
    
    var labelIcon = label.getElementsByClassName("icon");

    if(labelIcon.length <= 0){
        return false;
    }
    
    return labelIcon[0].classList.contains("check", "square");
}

LabelGroup.prototype.toggleLabelSelection = function(label) {
    if(!this.isLabelSelected(label)){
        return this.selectLabel(label);
    } else {
        return this.unselectLabel(label);
    }
}

// Boolean return values for this function is to indicate whether events should be propagated upwards
// if true -> should be propagated upwards
// If false -> should stop propagating upwards
LabelGroup.prototype.handleLabelClickEvent = function(event) {

    if(!event || event.which !== MouseButtonType.Left){
        return true;
    }

    var data = event.data;

    if(!data || !data.hasOwnProperty("label")){
        return true;
    }

    var label = data.label;

    if(!label){
        return true;
    }

    return !this.toggleLabelSelection(label);
}

LabelGroup.prototype.attachListenerToLabel = function(label) {
    $(label).on("mousedown", {label: label}, this.handleLabelClickEvent.bind(this));
}

LabelGroup.prototype.getExpandedContainerStartingTextNode = function() {
    switch(this.groupInfo.getGroupType()){
        case GroupType.Dash:
            return document.createTextNode(this.groupInfo.getGroupName() + " - ");
        case GroupType.Dot:
            return document.createTextNode(this.groupInfo.getGroupName() + " . ");
        case GroupType.None:
            return document.createTextNode("Non-grouped labels: ");
        default:
            return document.createTextNode("Unknown labels: ");
    }
}

LabelGroup.prototype.createExpandedContainer = function(isCacheDOM) {

    var outerExpandedContainer = document.createElement("div");
    outerExpandedContainer.classList.add("group-container", "ui", "raised", "segment", "transition", "hidden");
    outerExpandedContainer.setAttribute("data-group-id", this.groupID);
    outerExpandedContainer.setAttribute("data-group-type", this.groupInfo.getGroupType()+"");

    var innerExpandedContainer = document.createElement("div");
    innerExpandedContainer.classList.add("ui", "container");

    var innerExpandedContainerIcon = document.createElement("i");
    innerExpandedContainerIcon.classList.add("big", "caret", "up", "icon");
    innerExpandedContainer.appendChild(innerExpandedContainerIcon);

    var innerExpandedContainerTextNode = document.createElement("span");
    innerExpandedContainerTextNode.classList.add("content");

    var innerExpandedContainerText = this.getExpandedContainerStartingTextNode();
    innerExpandedContainerTextNode.appendChild(innerExpandedContainerText);
    innerExpandedContainer.appendChild(innerExpandedContainerTextNode);

    for(var  i = 0, size = this.items.length; i < size; ++i){

        var label = this.createLabel(this.items[i]);
        this.attachListenerToLabel(label);

        innerExpandedContainer.appendChild(label);
    }

    outerExpandedContainer.appendChild(innerExpandedContainer);

    if(isCacheDOM){
        this.expandedInnerContainer = innerExpandedContainer;
        this.expandedOuterContainer = outerExpandedContainer;
        this.expandedContainerIcon = innerExpandedContainerIcon;
    }

    return outerExpandedContainer;
}

LabelGroup.prototype.attachListenerToCollapsedContainerCaret = function(outerCollapsedContainer,       
                                                                            outerExpandedContainer, 
                                                                                collapsedContainerCaret) {

    var $collapsedContainer = $(outerCollapsedContainer);
    var $expandedContainer = $(outerExpandedContainer);
    var $icon = $(collapsedContainerCaret);

    var handleDownCaretClickEvent = function() {
		$collapsedContainer.transition({
			animation: 'fade',
            duration: '200ms',
			onComplete: function() {
				$expandedContainer.transition('slide down', '200ms');
			}
		});
	}

    $icon.click(handleDownCaretClickEvent);
}

LabelGroup.prototype.attachListenerToExpandedContainerCaret = function ( outerCollapsedContainer, 
                                                                            outerExpandedContainer, 
                                                                                expandedContainerCaret ) {

    var $collapsedContainer = $(outerCollapsedContainer);
    var $expandedContainer = $(outerExpandedContainer);
    var $icon = $(expandedContainerCaret);

    var handleUpCaretClickEvent = function() {
		$expandedContainer.transition({
			animation: 'slide down',
            duration: '200ms',
			onComplete: function() {
				$collapsedContainer.transition('fade', '200ms');
			}
		});
	}

    $icon.click(handleUpCaretClickEvent);
}

LabelGroup.prototype.create = function() {

    var outerCollapsedContainer = this.createCollapsedContainer(true);
    var outerExpandedContainer = this.createExpandedContainer(true);

    this.attachListenerToCollapsedContainerCaret(this.collapsedOuterContainer, this.expandedOuterContainer,     
                                                    this.collapsedContainerIcon);

    this.attachListenerToExpandedContainerCaret(this.collapsedOuterContainer, this.expandedOuterContainer, 
                                                    this.expandedContainerIcon);

    return [outerCollapsedContainer, outerExpandedContainer];
}


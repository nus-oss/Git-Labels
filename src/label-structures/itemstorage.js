var ItemStorage = function() {

    this.groupRegexExp = new RegExp("\\.|\-", "g");
    this.idGenerator = new IDGenerator();

    this.items = new Map();
    this.groups = new Map();
    this.groupNameToIDMap = [];

    this.addedItemNames = new Set();
    this.selectItemsIDs = new Set();
}

ItemStorage.prototype.getGroupData = function(fullItemName) {

    if(typeof fullItemName !== "string" || fullItemName.length <= 0){
        return null;
    }

    var index = fullItemName.search(this.groupRegexExp);

    if(index < 0){
        return { groupType: GroupType.None, groupName: "", itemName: fullItemName };
    }

    var grpName = fullItemName.slice(0, index);
    var itmName = fullItemName.slice(index+1);

    if(grpName.trim().length <= 0 || itmName.trim().length <= 0){
        return { groupType: GroupType.None, groupName: "", itemName: fullItemName };
    } 
    
    switch(fullItemName[index]){
        case ".":
            return { groupType: GroupType.Dot, groupName: grpName, itemName: itmName };
        case "-":
            return { groupType: GroupType.Dash, groupName: grpName, itemName: itmName };
        default:
            return { groupType: GroupType.None, groupName: "", itemName: fullItemName };
    }
}

ItemStorage.prototype.addItemToGroup = function( groupType, groupName, isExclusive, labelItem ) {

    var groupNames = this.groupNameToIDMap[groupType];

    if(!groupNames){
        this.groupNameToIDMap[groupType] = {};
        groupNames = this.groupNameToIDMap[groupType];
    }

    var groupID = groupNames[groupName]

    if(!groupID){
        var groupInfo = new GroupInfo(groupName, groupType, isExclusive);
        groupID = this.idGenerator.getGroupID(groupName);
        groupNames[groupName] = groupID;
        this.groups.set(groupID, groupInfo);
    }

    labelItem.setGroupID(groupID);

    return true;
}

ItemStorage.prototype.addItem = function(labelItem) {

    if(!(labelItem instanceof LabelItem)){
        return false;
    }

    var itemFullName = labelItem.getFullName();

    if(this.addedItemNames.has(itemFullName)){
        return false;
    } else {
        this.addedItemNames.add(itemFullName);
    }

    var groupDetails = this.getGroupData(itemFullName);
    if(!groupDetails){
        return false;
    }

    var itemID = this.idGenerator.getItemID(itemFullName);
    labelItem.setName(groupDetails.itemName);
    labelItem.setID(itemID);
    this.items.set(itemID, labelItem);

    var isAdded = false;
    var groupType = groupDetails.groupType;

    switch(groupType){
        case GroupType.Dot:
            isAdded = this.addItemToGroup(groupType, groupDetails.groupName, true, labelItem);
            break;
        case GroupType.Dash:
        case GroupType.None:
            isAdded = this.addItemToGroup(groupType, groupDetails.groupName, false, labelItem);
            break;
        default:
            break;
    }

    if(isAdded && labelItem.isSelected()){
        this.selectItemsIDs.add(itemID);
    }

    return isAdded;
}

ItemStorage.prototype.getGroupDetails = function(groupID) {

    var groupInfo = this.groups.get(groupID);

    if(!groupInfo){
        return null;
    }

    return groupInfo;
}

ItemStorage.prototype.getItem = function(itemID) {
    return this.items.get(itemID);
}

ItemStorage.prototype.isItemSelected = function(itemID) {

    var item = this.items.get(itemID);

    if(!item){
        return false;
    }

    return item.isSelected();
}

ItemStorage.prototype.selectItem = function(itemID) {

    var item = this.items.get(itemID);

    if(!item){
        return false;
    }

    item.setSelected(true);
    this.selectItemsIDs.add(itemID);

    return true;
}

ItemStorage.prototype.unselectItem = function(itemID) {

    var item = this.items.get(itemID);

    if(!item){
        return false;
    }

    item.setSelected(false);
    this.selectItemsIDs.delete(itemID);

    return true;
}

ItemStorage.prototype.getItemsIterator = function() {
    return this.items.values();
}

ItemStorage.prototype.getSelectedItemIDsIterator = function() {
    return this.selectItemsIDs.keys();
}

ItemStorage.prototype.getItemCount = function() {
    return this.items.size;
}
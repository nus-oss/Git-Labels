var LabelGroupsFactory = function() {

    /*  Other variables present in this class|
        -------------------------------------|
        
    */
}

LabelGroupsFactory.prototype.createLabelGroupsList = function(storage, instanceID) {

    var groupIDToIndexMap = new Map();
    var labelGroupsList = [];

    var itemItr = storage.getItemsIterator();
    while(true){

        var itemObj = itemItr.next();

        if(itemObj.done){
            break;
        }

        var item = itemObj.value;
        var groupID = item.getGroupID();

        var groupListIndex = groupIDToIndexMap.get(groupID);
        var labelGroup;
        if(typeof(groupListIndex) === "number"){
            labelGroup = labelGroupsList[groupListIndex];
        } else {
            var groupInfo = storage.getGroupDetails(groupID);
            if(!groupInfo){
                continue;
            }
            labelGroup = new LabelGroup(groupID, groupInfo, instanceID);
            groupIDToIndexMap.set(groupID, labelGroupsList.length);
            labelGroupsList.push(labelGroup);
        }

        labelGroup.addItem(item);
    }

    return labelGroupsList;
}

LabelGroupsFactory.prototype.getScore = function(groupType) {
    switch(groupType){
        case GroupType.Dot:
            return 0;
        case GroupType.Dash:
            return 1;
        case GroupType.None:
            return 2;
        default:
            return 3;
    }
}

LabelGroupsFactory.prototype.compareFunction = function(a, b) {

    var aScore = this.getScore(a.getGroupType());
    var bScore = this.getScore(b.getGroupType());
    var scoreDiff = aScore - bScore;

    if(scoreDiff){
        return scoreDiff;
    } else {
        var aName = a.getGroupName();
        var bName = b.getGroupName();
        return aName.localeCompare(bName);
    }
}

LabelGroupsFactory.prototype.appendComponents = function(parent, child) {
    if(Array.isArray(child)){
        for(var i = 0, size = child.length; i < size; ++i){
            parent.appendChild(child[i]);
        }
    } else {
        parent.appendChild(child);
    }
}

LabelGroupsFactory.prototype.createGroups = function(labelGroupsList) {

    var groupContainer = document.createElement("div");

    for( var i = 0, size = labelGroupsList.length; i < size; ++i ){
        var groupComponents = labelGroupsList[i].create();
        this.appendComponents(groupContainer, groupComponents);
    }

    return groupContainer;
}

LabelGroupsFactory.prototype.create = function(storage, instanceID) {

    if(!(storage instanceof ItemStorage) || typeof(instanceID) !== "string"){
        return document.createElement("div");
    }

    var labelGroupsList = this.createLabelGroupsList(storage, instanceID);
    labelGroupsList.sort(this.compareFunction.bind(this));
    return this.createGroups(labelGroupsList);
}
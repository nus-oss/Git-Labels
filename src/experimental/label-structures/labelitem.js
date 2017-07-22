var LabelItem = function(fullName, color, selected) {
    this.fullName = fullName;
    this.name = "";
    this.color = color;
    this.selected = selected;
    this.id = "";
    this.groupID = "";
}

LabelItem.prototype.getFullName = function() {
    return this.fullName;
}

LabelItem.prototype.getName = function() {
    return this.name;
}

LabelItem.prototype.getColor = function() {
    return this.color
}

LabelItem.prototype.isSelected = function() {
    return this.selected;
}

LabelItem.prototype.getID = function() {
    return this.id;
}

LabelItem.prototype.getGroupID = function() {
    return this.groupID
}

LabelItem.prototype.setName = function(name) {
    return this.name = name;
}

LabelItem.prototype.setSelected = function(isSelected) {
    this.selected = isSelected;
}

LabelItem.prototype.setID = function(id) {
    this.id = id;
}

LabelItem.prototype.setGroupID = function(groupID) {
    this.groupID = groupID;
}
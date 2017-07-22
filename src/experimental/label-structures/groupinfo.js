var GroupInfo = function( groupName, groupType, isExclusive ) {
    this.groupName = groupName;
    this.groupType = groupType;
    this.isGroupExclusive = isExclusive;
}

GroupInfo.prototype.getGroupType = function() {
    return this.groupType;
}

GroupInfo.prototype.getGroupName = function() {
    return this.groupName;
}

GroupInfo.prototype.isExclusive = function() {
    return this.isGroupExclusive;
}

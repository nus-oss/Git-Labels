var IDGenerator = function() {
    this.uuidUsed = new Set();
    this.groupNamespace = generateRandomNamespace();
    this.itemNamespace = generateRandomNamespace();
}

IDGenerator.prototype.fallBackGroupID = function(groupName) {
    for(let i = 0; i < 10; ++i){
        this.groupNamespace = generateRandomNamespace();
        var id = v5(groupName, this.groupNamespace);
        if(!this.uuidUsed.has(id)){
            this.uuidUsed.add(id);
            return id;
        }
    }
    throw "Unable to generate unique id";
}

IDGenerator.prototype.getGroupID = function(groupName) {
    var id = v5(groupName, this.groupNamespace);
    if(this.uuidUsed.has(id)){
        return this.fallBackGroupID(groupName);
    }
    this.uuidUsed.add(id);
    return id;
}

IDGenerator.prototype.fallBackItemID = function(itemName) {
    var count = 0;
    var id;
    do {
        this.itemNamespace = generateRandomNamespace();
        var id = v5(itemName, this.itemNamespace);
        if(!this.uuidUsed.has(id)){
            this.uuidUsed.add(id);
            return id;
        }
        ++count;
    } while(count <= 5);
    return id;
}

IDGenerator.prototype.getItemID = function(itemName) {
    var id = v5(itemName, this.itemNamespace);
    if(this.uuidUsed.has(id)){
        return this.fallBackItemID(itemName);
    }
    this.uuidUsed.add(id);
    return id;
}

IDGenerator.prototype.unregisterID = function(id) {
    this.uuidUsed.delete(id)
}
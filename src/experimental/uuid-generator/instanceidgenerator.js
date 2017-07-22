var InstanceIDGenerator = function() {
    this.previouslyUsedInstanceID = null;
    this.instanceNamespace = generateRandomNamespace();
}

InstanceIDGenerator.prototype.fallBackInstanceID = function() {
    for(let i = 0; i < 10; ++i){
        this.instanceNamespace = generateRandomNamespace();
        var id = v5("instance", this.instanceNamespace);
        if(this.previouslyUsedInstanceID !== id){
            return id;
        }
    }
    throw "Unable to generate unique id";
}

InstanceIDGenerator.prototype.getInstanceID = function() {
    var id = v5("instance", this.instanceNamespace);
    if(this.previouslyUsedInstanceID === id){
        return this.fallBackInstanceID();
    }
    return id;
}

InstanceIDGenerator.prototype.getPreviousRegisteredID = function() {
    return this.previouslyUsedInstanceID;
}

InstanceIDGenerator.prototype.registerID = function(id) {
    this.previouslyUsedInstanceID = id;
}
var LaunchButtonFactory = function() {
    /*  Other variables present in this class|
        -------------------------------------|
        this.outerContainer,
        this.innerContainer,
        this.buttonText,
        this.buttonIcon
    */
}

LaunchButtonFactory.prototype.cacheLaunchButton = function( outerContainer, innerContainer, buttonText, buttonIcon ) {
    this.outerContainer = outerContainer;
    this.innerContainer = innerContainer;
    this.buttonText = buttonText;
    this.buttonIcon = buttonIcon;
}

LaunchButtonFactory.prototype.createLaunchButton = function( buttonText, isCacheDOM ) {

    var outerContainer = document.createElement("div");
    outerContainer.classList.add( "git-flash-labels-sidebar-launch-button", "launch-container");

    var innerContainer = document.createElement("div");
    innerContainer.classList.add("ui", "black", "big", "launch", "left", "attached", "fixed", "button");

    var buttonTextElement = document.createElement("span");
    buttonTextElement.classList.add("ui", "text");

    var buttonTextNode = document.createTextNode(buttonText);
    buttonTextElement.appendChild(buttonTextNode);
    innerContainer.appendChild(buttonTextElement);

    var buttonIcon = document.createElement("i");
    buttonIcon.classList.add("tag", "icon");
    innerContainer.appendChild(buttonIcon);

    outerContainer.appendChild(innerContainer);

    if(isCacheDOM){
        this.cacheLaunchButton(outerContainer, innerContainer, buttonTextElement, buttonIcon);
    }

    return outerContainer;
}

LaunchButtonFactory.prototype.attachListenersToLaunchButton = function(innerContainer, buttonIcon, buttonText) {

    if(!innerContainer || !buttonIcon || !buttonText){
        return false;
    }

    var $innerContainer = $(innerContainer);
    var $buttonIcon = $(buttonIcon)
    var $buttonText = $(buttonText);

    var originalWidth;
    var innerContainerWidth;
    var buttonTextWidth;

    $innerContainer.mouseenter(function() {

        if(originalWidth === undefined){
            originalWidth = $innerContainer.outerWidth(true);
        }
        if(innerContainerWidth === undefined) {
            innerContainerWidth = $innerContainer.outerWidth();
        }
        if(buttonTextWidth === undefined){
            buttonTextWidth = $buttonText.outerWidth();
        }

        $innerContainer.stop().animate({
            width: 1.5*(innerContainerWidth+buttonTextWidth)
        }, 150, function() {
            $buttonText.show();
        });

    }).mouseleave(function(){

        $buttonText.hide();
        $innerContainer.stop().animate({width: originalWidth}, 150);
    });

    return true;
}

LaunchButtonFactory.prototype.initializeLaunchButtonState = function(buttonText) {
    if(!buttonText){
        return false;
    }
    $(buttonText).hide();
    return true;
}

LaunchButtonFactory.prototype.create = function(buttonText) {
    var launchButton = this.createLaunchButton(buttonText, true);
    this.attachListenersToLaunchButton(this.innerContainer, this.buttonIcon, this.buttonText);
    this.initializeLaunchButtonState(this.buttonText);
    return launchButton;
}
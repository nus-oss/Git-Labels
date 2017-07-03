var LabelPageController = function() {

    /*
        this.colorEditorInput,
        this.colorEditorBg,
        this.colorEditorMenu,
        this.colorPickerAnchor
    */
}

LabelPageController.prototype.getColorPickerInitialColor = function( defaultColor = "#d93f0b" ) {

    var color = this.colorEditorInput.getAttribute("value");

    if(color){
        return color;
    }

    color = this.colorEditorBg.style.getProperty("background-color");

    if(color){
        return color;
    }

    return defaultColor;
}

LabelPageController.prototype.removeAllChildNodes = function(parent) {

    if(!parent){
        return false;
    }

    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }

    return true;
}

LabelPageController.prototype.handleMoveSpectrumEvent = function(color) {
    if(color){
        this.colorEditorInput.setAttribute("value", color.toHexString());
        this.colorEditorBg.style.setProperty("background-color", color.toHexString());
    }
}

LabelPageController.prototype.attachHandlerForInputClickEvent = function(colorEditorInput) {
    var $colorPickerAnchor = $(this.colorPickerAnchor);
    $(colorEditorInput).click(function(){
        $colorPickerAnchor.spectrum("reflow");
    });
}

LabelPageController.prototype.overrideDropDownMenu = function() {

    if(this.isOverwritten()){
        return true;
    }

    this.removeAllChildNodes(this.colorEditorMenu);

    var colorPickerAnchor = document.createElement("input");
    colorPickerAnchor.classList.add("git-flash-sp-container-popup");
    this.colorEditorMenu.appendChild(colorPickerAnchor);
    
    this.cacheColorPickerAnchor(colorPickerAnchor);

    var initialColor = this.getColorPickerInitialColor();

    var colorBox = this.colorEditorBg;
    var inputBox = this.colorEditorInput;

    $(colorPickerAnchor).spectrum({
        color: initialColor,
        preferredFormat: "hex",
        flat: true,
        showInput: false,
        showButtons: false,
        showInitial: true,
        move: this.handleMoveSpectrumEvent.bind(this)
    });

    this.attachHandlerForInputClickEvent(this.colorEditorInput);

    return true;
}

LabelPageController.prototype.cacheColorPickerAnchor = function(colorPickerAnchor) {
    this.colorPickerAnchor = colorPickerAnchor;
}

LabelPageController.prototype.isOverwritten = function() {
    return document.getElementsByClassName("git-flash-sp-container-popup").length > 0
}

LabelPageController.prototype.cacheDOM = function() {
    this.colorEditorInput = document.querySelector(".label-edit .color-editor .color-editor-input");
    this.colorEditorBg = document.querySelector(".label-edit .color-editor .color-editor-bg");
    this.colorEditorMenu = document.querySelector(".label-edit .color-editor .dropdown-menu");
    return this.colorEditorInput != null && this.colorEditorBg != null && this.colorEditorMenu != null;
}

LabelPageController.prototype.handleInputValueChanges = function(mutation, defaultColor = "#d93f0b") {

    if(!mutation || !mutation.target){
        return false;
    }

    var target = mutation.target;

    if(target.getAttribute("value") !== "#undefined"){
        return true;
    }

    target.setAttribute("value", defaultColor);
    target.setAttribute("data-original-color", defaultColor);

    this.colorEditorBg.style.setProperty("background-color", defaultColor);

    var $colorPickerAnchor = $(this.colorPickerAnchor);
    if(mutation.oldValue){
        $colorPickerAnchor.spectrum( "changeInitialColor", mutation.oldValue );
    }
    $colorPickerAnchor.spectrum( "set", defaultColor );

    return true;
}

LabelPageController.prototype.attachInputValueObserver = function() {

    var observer = new MutationObserver(function(mutations){
        for(var i = 0; i < mutations.length; ++i){
            this.handleInputValueChanges(mutations[i]);
            observer.disconnect();
        }
    }.bind(this));

    var config = {
        attributes: true,
        attributeFilter: ["value"],
        attributeOldValue: true
    }

    observer.observe(this.colorEditorInput, config);

    return true;
}

LabelPageController.prototype.handleSubmitBtnClickEvent = function() {
    if(this.attachInputValueObserver()){
        this.submitButton.classList.add(".git-flash-btn-override");
    }
}

LabelPageController.prototype.cacheSubmitButton = function(submitButton) {
    this.submitButton = submitButton
}

LabelPageController.prototype.attachSubmitBtnClickEventHandler = function() {

    if(document.querySelector(".git-flash-btn-override")){
        return true;
    }

    var submitBtn = document.querySelector(".js-create-label .btn-primary[type='submit']");

    if(!submitBtn){
        return false;
    }

    this.cacheSubmitButton(submitBtn);

    $(submitBtn).click(this.handleSubmitBtnClickEvent.bind(this));

    return true;
}

LabelPageController.prototype.handleColorBoxStyleChanges = function(mutation){
    
    if(!mutation || !mutation.target){
        return false;
    }

    var styleData = mutation.target.style.backgroundColor;

    if(!styleData){
        return false;
    }

    $(this.colorPickerAnchor).spectrum( "set", styleData );
    this.colorEditorInput.setAttribute("value", tinycolor(styleData).toHexString());
    return true;
}

LabelPageController.prototype.attachBoxColorChangeListener = function() {

    if(document.querySelector(".git-flash-input-override")){
        return true;
    }

    var observer = new MutationObserver(function(mutations){
        for(var i = 0; i < mutations.length; ++i){
            this.handleColorBoxStyleChanges(mutations[i]);
        }
    }.bind(this));

    var config = {
        attributes: true,
        attributeFilter: ["style"]
    }

    this.colorEditorBg.classList.add("git-flash-input-override");

    observer.observe(this.colorEditorBg, config);

    return true;
}

LabelPageController.prototype.attachColorPicker = function() {
    if(this.cacheDOM()){
        this.overrideDropDownMenu();
        this.attachBoxColorChangeListener();
        this.attachSubmitBtnClickEventHandler();
    }
}

LabelPageController.prototype.run = function() {
    this.attachColorPicker();
}
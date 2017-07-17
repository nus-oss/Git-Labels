var SearchFactory = function() {

    this.originalInput = "";
    this.maxItems = 10;

    this.subscribeToExternalEvents();

    /*
        this.storage
        this.searchContainer,
        this.clearSearchIcon,
        this.searchIcon,
        this.searchField,
        this.searchInput,
        this.searchMenuContainer,
        this.searchMenuList,
        this.nameToIDMap,
        this.sideBar,
        this.nameArrayList,
        this.nameArrayListIDs
    */

    /*  Events Published

        PubSub.publish("search-bar/apply-selected-labels", {} );
        PubSub.publish("search/toggle-select-item", {itemID: item.getID()});
    */

    /*  Internal Events

        $(searchInput).on('input propertychange paste focusin', this.handleInputChangeEvent.bind(this));
        $(searchInput).keydown(this.handleKeyDownEvent.bind(this));
        $(searchInput).focusout(this.handleFocusOffEvent.bind(this));
        $(searchList).on("mousedown", "div.item", this.handleListItemClickEvent.bind(this));
    */

    /*  Events subscribed

        PubSub.subscribe("selected-label/toggle-select-item-finished", this.handleApplyEvent.bind(this));
        PubSub.subscribe("side-bar-ui/hidden", this.handleSideBarHiddenEvent.bind(this));
        PubSub.subscribe("side-bar-ui/visible", this.handleSideBarVisibleEvent.bind(this));
    */
}

SearchFactory.prototype.handleSideBarVisibleEvent = function() {
    if(this.searchInput){
        this.searchInput.focus();
    }
}

SearchFactory.prototype.handleSideBarHiddenEvent = function() {
    if(this.searchInput){
        this.searchInput.blur();
    }
}

SearchFactory.prototype.subscribeToExternalEvents = function() {
    PubSub.subscribe("side-bar-ui/visible", this.handleSideBarVisibleEvent.bind(this));
    PubSub.subscribe("side-bar-ui/hidden", this.handleSideBarHiddenEvent.bind(this));
    PubSub.subscribe("selected-label/toggle-select-item-finished", this.handleApplyEvent.bind(this));
}

SearchFactory.prototype.createSearchMenu = function(isCacheDOM) {

    var searchMenuContainer = document.createElement("div");
    searchMenuContainer.classList.add("custom-list-menu-container");

    var searchMenuList = document.createElement("div");
    searchMenuList.classList.add("custom-list-menu", "ui", "list", "transition");
    this.styleSearchListToHide(searchMenuList);

    searchMenuContainer.appendChild(searchMenuList);

    if(isCacheDOM){
        this.searchMenuContainer = searchMenuContainer;
        this.searchMenuList = searchMenuList;
    }

    return searchMenuContainer;
}

SearchFactory.prototype.createSearchBar = function( placeholderText, isCacheDOM ) {

    var searchContainer = document.createElement("div");
    searchContainer.classList.add("search-container", "ui", "raised", "segment");

    var clearSearchIcon = document.createElement("i");
    clearSearchIcon.classList.add("clear-search-icon", "large", "remove", "icon");
    searchContainer.appendChild(clearSearchIcon);

    var searchIcon = document.createElement("i");
    searchIcon.classList.add("search-icon", "large", "search", "icon");
    searchContainer.appendChild(searchIcon);

    var searchField = document.createElement("span");
    searchField.classList.add("search-field");

    var searchInput = document.createElement("input");
    searchInput.setAttribute("type", "text");
    searchInput.setAttribute("autocomplete", "off");
    searchInput.setAttribute("spellcheck", "false");
    searchInput.setAttribute("placeholder", placeholderText);
    searchInput.classList.add("ui", "find");
    searchField.appendChild(searchInput);
    searchContainer.appendChild(searchField);

    if(isCacheDOM){
        this.searchContainer = searchContainer;
        this.clearSearchIcon = clearSearchIcon;
        this.searchIcon = searchIcon;
        this.searchField = searchField;
        this.searchInput = searchInput;
    }

    return searchContainer;
}

SearchFactory.prototype.createSearchStructures = function(storage) {

    var numItems = storage.getItemCount();

    var nameToIDMap = new Map();
    var nameArrayList = new Array(numItems);
    var nameArrayListIDs = new Array(numItems);

    var index = 0;
    var itemItr = storage.getItemsIterator();
    while(true){

        var itemObj = itemItr.next();

        if(itemObj.done){
            break;
        }

        var item = itemObj.value;

        nameToIDMap.set( item.getFullName().toLowerCase(), item.getID() );
        nameArrayList[index] = this.createArrayFromString(item.getFullName());
        nameArrayListIDs[index] = item.getID();

        ++index;
    }

    return [nameToIDMap, nameArrayList, nameArrayListIDs];
}

SearchFactory.prototype.updateSearchData = function(storage) {

    if(!(storage instanceof ItemStorage)){
        return false;
    }

    this.storage = storage;
    var structures = this.createSearchStructures(storage);

    this.nameToIDMap = structures[0];
    this.nameArrayList = structures[1];
    this.nameArrayListIDs = structures[2];

    return true;
}

SearchFactory.prototype.create = function(storage) {

    if(!this.updateSearchData(storage)){
        return null;
    }

    var searchBar = this.createSearchBar("Search For Labels", true);
    var searchMenu = this.createSearchMenu(true);

    this.attachInputListenerToSearchField(this.searchInput);

    return [searchBar, searchMenu];
}

SearchFactory.prototype.attachInputListenerToSearchField = function(searchInput) {

    if(!searchInput){
        return false;
    }

    var $searchInput = $(searchInput)

    $searchInput.on("input propertychange paste focusin", this.handleInputChangeEvent.bind(this));
    $searchInput.keydown(this.handleKeyDownEvent.bind(this));
    $searchInput.focusout(this.handleFocusOffEvent.bind(this));

    return true;
}

SearchFactory.prototype.handleFocusOffEvent = function() {
    this.hideSearchlist(this.searchMenuList);
}

SearchFactory.prototype.handleApplyEvent = function() {
    this.handleSideBarHiddenEvent();
    PubSub.publish("search-bar/apply-selected-labels", {} );
    this.clearSearchInput();
    return false;
}

SearchFactory.prototype.handleEnterKeyEvent = function() {
    
    if(!this.searchInput || !this.nameToIDMap || !this.storage || !this.searchMenuList){
        return this.handleApplyEvent();
    }

    var inputString = this.searchInput.value;
    if(!inputString){
        return this.handleApplyEvent();
    }

    var itemID = this.nameToIDMap.get(inputString.toLowerCase());
    if(!itemID){
        var firstListItem = this.searchMenuList.firstChild;
        if( !firstListItem ){
            return this.handleApplyEvent();
        }
        itemID = firstListItem.getAttribute("data-item-id");
    }

    var item = this.storage.getItem(itemID);
    if(!item){
        return this.handleApplyEvent();
    }
    
    PubSub.publish("search/toggle-select-item", {itemID: item.getID(), isReturnEvent: true});

    this.clearSearchInput();
    this.hideSearchlist(this.searchMenuList);

    return false;
}

SearchFactory.prototype.handleSpaceKeyEvent = function() {

    if(!this.searchInput || !this.nameToIDMap || !this.storage || !this.searchMenuList){
        return false;
    }

    var inputString = this.searchInput.value;
    if(!inputString){
        return false;
    }

    var itemID = this.nameToIDMap.get(inputString.toLowerCase());
    if(!itemID){
        var firstListItem = this.searchMenuList.firstChild;
        if( !firstListItem ){
            return false;
        }
        itemID = firstListItem.getAttribute("data-item-id");
    }

    var item = this.storage.getItem(itemID);
    if(!item){
        return false;
    }

    PubSub.publish("search/toggle-select-item", {itemID: item.getID()});

    this.clearSearchInput();
    this.hideSearchlist(this.searchMenuList);

    return false;
}

SearchFactory.prototype.styleListItemAsSelected = function(listItem) {
    listItem.classList.add("selected");
}

SearchFactory.prototype.styleListItemAsUnselected = function(listItem) {
    listItem.classList.remove("selected");
}

SearchFactory.prototype.setInputWithListItemContent = function(listItem) {

    if(!this.searchInput){
        return false;
    }

    var contentNode = listItem.querySelector(".list-content");
    
    if(!contentNode){
        return false;
    }

    var content = contentNode.textContent;

    if(typeof(content) !== "string" ){
        return false;
    }

    this.searchInput.value = content;

    return true;
}

SearchFactory.prototype.scrollIntoView = function( container, item ) {
    $(item).scrollintoview({ duration: 10, direction: "y", parent: $(container) });
}

SearchFactory.prototype.handleUpArrowEvent = function() {

    if(!this.isSearchMenuListShown(this.searchMenuList)){
        return false;
    }

    var selectedItem = this.searchMenuList.querySelector( ".item.selected" );

    if(!selectedItem){
        var lastItem = this.searchMenuList.lastChild;
        if(!lastItem){
            return false;
        }
        this.styleListItemAsSelected(lastItem);
        this.setInputWithListItemContent(lastItem);
        this.scrollIntoView(this.searchMenuList, lastItem);
    } else {

        this.styleListItemAsUnselected(selectedItem);

        var previousItem = selectedItem.previousSibling;
        if(previousItem){
            this.styleListItemAsSelected(previousItem);
            this.setInputWithListItemContent(previousItem);
            this.scrollIntoView(this.searchMenuList, previousItem);
        } else if(this.searchInput){
            this.searchInput.value = this.originalInput;
        } else {
            return false;
        }
    }

    return true;
}

SearchFactory.prototype.handleDownArrowEvent = function() {

    if(!this.isSearchMenuListShown(this.searchMenuList)){
        return false;
    }

    var selectedItem = this.searchMenuList.querySelector( ".item.selected" );

    if(!selectedItem){

        var firstItem = this.searchMenuList.firstChild;
        if(!firstItem){
            return false;
        }
        this.styleListItemAsSelected(firstItem);
        this.setInputWithListItemContent(firstItem);
        this.scrollIntoView(this.searchMenuList, firstItem);
    } else {

        this.styleListItemAsUnselected(selectedItem);

        var nextItem = selectedItem.nextSibling;
        if(nextItem){
            this.styleListItemAsSelected(nextItem);
            this.setInputWithListItemContent(nextItem);
            this.scrollIntoView(this.searchMenuList, nextItem);
        } else if(this.searchInput){
            this.searchInput.value = this.originalInput;
        } else {
            return false;
        }
    }

    return true;
}

SearchFactory.prototype.handleEscKeyEvent = function() {
    if(this.searchMenuList && this.isSearchMenuListShown(this.searchMenuList)){
        this.styleSearchListToHide(this.searchMenuList);
    } else {
        this.handleSideBarHiddenEvent();
        PubSub.publish("search-bar/escape-key-triggered");
    }
    return true;
}

SearchFactory.prototype.handleKeyDownEvent = function(event) {

    switch(event.key){
        case "Enter":
            return this.handleEnterKeyEvent();
        case " ":
            return this.handleSpaceKeyEvent();
        case "ArrowUp":
            return !this.handleUpArrowEvent();
        case "ArrowDown":
            return !this.handleDownArrowEvent();
        case "Escape":
            return !this.handleEscKeyEvent();
        default:
            break;
    }
    return true;
}

SearchFactory.prototype.handleInputChangeEvent = function() {
    
    this.originalInput = "";

    if(!this.searchInput || !this.searchMenuList){
        return true;
    }

    var inputString = this.searchInput.value;

    if(!inputString){
        this.styleSearchInputForMatch(this.searchInput);
        this.hideSearchlist(this.searchMenuList);
        return true;
    }

    this.numItemsAdded = this.populateSearchList(inputString);

    if(this.numItemsAdded > 0){
        this.originalInput = inputString;
        this.styleSearchInputForMatch(this.searchInput);
        this.showSearchList(this.searchMenuList);
    } else {
        this.styleSearchInputForNoMatch(this.searchInput);
        this.hideSearchlist(this.searchMenuList);
    }

    return true;
}

SearchFactory.prototype.getSideBarHeight = function() {
    if(!this.$sideBar) {
        var sideBar = document.body.querySelector(".git-flash-labels-sidebar");
        if(!sideBar){
            return -1;
        }
        this.$sideBar = $(sideBar);
    }
    return this.$sideBar.height();
}

SearchFactory.prototype.populateSearchList = function(pattern) {

    if(!this.searchMenuList || typeof(pattern) !== "string"){
        return 0;
    }

    var matchedList = this.createMatchedList(pattern);

    if(!matchedList){
        return 0;
    }

    var resultsList = this.searchMenuList.cloneNode(false);
    resultsList.style.height = "auto";

    for(var i = 0, size = matchedList.length; i < size; ++i){
        var listItem = this.createListItem(matchedList[i]);
        resultsList.appendChild(listItem);
    }

    this.searchMenuList.parentNode.replaceChild(resultsList, this.searchMenuList);
    this.searchMenuList = resultsList;

    this.attachListenersToSearchList(this.searchMenuList);

    var sideBarMaxHeight = this.getSideBarHeight();
    if(sideBarMaxHeight > 0){
        var maxHeight = Math.ceil(0.6*sideBarMaxHeight);
        if($(this.searchMenuList).height() > maxHeight){
            this.searchMenuList.style.height = maxHeight + "px";
        }
    }

    return matchedList.length;
}

SearchFactory.prototype.createArrayFromString = function( str ) {

	const strItr = str[Symbol.iterator]();
	var strArray = [];

	while(true){
		var strCharObj = strItr.next();
		if(strCharObj.done){
			break;
		}
		strArray.push(strCharObj.value.toLowerCase());
	}

	return strArray;
}

SearchFactory.prototype.isSpecialCharacters = function(characters) {
	return /^[!-/:-@\[-`{-~\s]+$/.test(characters);
}

SearchFactory.prototype.getMatchingIndices = function( patternArray, itemNameArray ) {

	if(patternArray.length <= 0){
		return null;
	}

	var firstIndexMatchedArray = new Array(itemNameArray.length);
	var lastIndexMatchedArray = new Array(itemNameArray.length);

	for(let i = 0, sz = itemNameArray.length - patternArray.length; i <= sz; ++i){

		var matchedArrayLength = 0;
		var isMatched = false;
		var lastMatchedIndex = -1;
		var firstMatchedIndex = -1;
        var numMismatch = 0;

		for(let j = 0, k = i, len = patternArray.length; j < len;){

			if(k >= itemNameArray.length){
				isMatched = false;
				break;
			}

			if(patternArray[j] === itemNameArray[k]){
				if( firstMatchedIndex < i ) {
					firstMatchedIndex = k;
				}
				lastMatchedIndex = k;
				isMatched = true;
				++j;
				++k;
				continue;
			}

			if(!this.isSpecialCharacters(patternArray[j]) && this.isSpecialCharacters(itemNameArray[k])){
				
				if(firstMatchedIndex >= i){
					firstIndexMatchedArray[matchedArrayLength] = firstMatchedIndex;
					lastIndexMatchedArray[matchedArrayLength] = lastMatchedIndex;
					++matchedArrayLength;
                    ++numMismatch;
					firstMatchedIndex = -1;
					lastMatchedIndex = -1;
				}
				++k;

			} else {
				isMatched = false;
				break;
			}
		}

		if(isMatched){
			if(firstMatchedIndex >= i && lastMatchedIndex >= i){
				firstIndexMatchedArray[matchedArrayLength] = firstMatchedIndex;
				lastIndexMatchedArray[matchedArrayLength] = lastMatchedIndex;
				++matchedArrayLength;
			}
			return [firstIndexMatchedArray, lastIndexMatchedArray, matchedArrayLength, numMismatch];
		}
	}

	return null;
}

SearchFactory.prototype.createFormattedMatchedString = function( str, firstIndexMatchedArray, lastIndexMatchedArray, 
                                                                    matchedArrayLength, numMismatch ) {

	var numMatched = 0;
	var totalLength = 0;
	var formattedStr = "";
	var startFrom = 0;
	const strItr = str[Symbol.iterator]();

	for(let j = 0; j < matchedArrayLength; ++j ){

		let first = firstIndexMatchedArray[j];
		let last = lastIndexMatchedArray[j];
		numMatched += (last-first+1);

		for(let i = startFrom; i < first; ++i){
			var strCharObj = strItr.next();
			if(strCharObj.done){
				return null;
			}
			++totalLength;
			formattedStr += strCharObj.value;
		}

		formattedStr += "<b>";

		for(let i = first; i <= last; ++i){
			var strCharObj = strItr.next();
			if(strCharObj.done){
				return null;
			}
			++totalLength;
			formattedStr += strCharObj.value;
		}

		formattedStr += "</b>";

		startFrom = last + 1;
	}

	while(true){
		var strCharObj = strItr.next();
		if(strCharObj.done){
			break;
		}
		++totalLength;
		formattedStr += strCharObj.value;
	}

	var score = (totalLength > 0 ? ((numMatched-numMismatch)/totalLength) : 0);

	return [score, formattedStr];
}

SearchFactory.prototype.createMatchedList = function(pattern) {

    if(!this.storage){
        return null;
    }

    var list = [];
    var patternStringArray = this.createArrayFromString(pattern);

    for(var i = 0, size = this.nameArrayList.length; i < size; ++i){

        var indices = this.getMatchingIndices(patternStringArray, this.nameArrayList[i]);

        if(!indices){
            continue;
        }

        var itemID = this.nameArrayListIDs[i];
        var item = this.storage.getItem(itemID);

        if(!item){
            continue;
        }

        var fullItemName = item.getFullName();
        var result = this.createFormattedMatchedString(fullItemName, indices[0], indices[1], indices[2], indices[3]);

        var itemInfo = {
            score: result[0],
            formattedStr: result[1],
            id: item.getID(),
            color: item.getColor(),
            isSelected: item.isSelected()
        }

        list.push(itemInfo);
    }

    list.sort(this.searchListCompareFunc);

    return list;
}

SearchFactory.prototype.searchListCompareFunc = function(a, b){
    return b.score-a.score;
}

SearchFactory.prototype.createListItem = function(itemInfo) {

     var item = document.createElement("div");
     item.setAttribute("data-item-id", itemInfo.id);
     item.classList.add("item");
     if(itemInfo.isSelected){
         item.classList.add("taken");
     }

     var itemColorIcon = document.createElement("i");
     itemColorIcon.classList.add("square", "icon");
     itemColorIcon.style.setProperty("color", itemInfo.color);
     item.appendChild(itemColorIcon);

     var itemText = document.createElement("div");
     itemText.classList.add("list-content");
     itemText.innerHTML = itemInfo.formattedStr;

     item.appendChild(itemText);

     return item;
}

SearchFactory.prototype.attachListenersToSearchList = function(searchList) {

    if(!searchList){
        return false;
    }

    $(searchList).on("mousedown", "div.item", this.handleListItemClickEvent.bind(this));
    $(searchList).on("mouseenter", "div.item", this.handleListItemMouseEnterEvent.bind(this));
    $(searchList).on("mouseleave", "div.item", this.handleListItemMouseLeaveEvent.bind(this));

    return true;
}

SearchFactory.prototype.handleListItemMouseLeaveEvent = function(event) {

    if(!event.currentTarget){
        return true;
    }

    this.styleListItemAsUnselected(event.currentTarget);
    return true;
}

SearchFactory.prototype.handleListItemMouseEnterEvent = function(event) {

    if(!event.currentTarget || !this.searchMenuList){
        return true;
    }

    var selectedItem = this.searchMenuList.querySelector(".item.selected");
    if(selectedItem){
        this.styleListItemAsUnselected(selectedItem);
    }

    this.styleListItemAsSelected(event.currentTarget);
    return true;
}

SearchFactory.prototype.handleListItemClickEvent = function(event) {

    if(!event.currentTarget){
        return true;
    }

    var selectedItemID = event.currentTarget.getAttribute("data-item-id");

    if(!selectedItemID || !this.searchInput || !this.storage){
        return true;
    }

    var item = this.storage.getItem(selectedItemID);

    if(!item) {
        return true;
    }

    this.searchInput.value = item.getFullName();

    setTimeout(function() {
        this.searchInput.focus();
        this.hideSearchlist(this.searchMenuList);
    }.bind(this),1);

    return true;
}

SearchFactory.prototype.styleSearchInputForMatch = function(searchInput) {
    searchInput.classList.remove("no-match");
}

SearchFactory.prototype.showSearchList = function(searchMenuList) {
    if(!this.isSearchMenuListShown(searchMenuList)) {
        this.styleSearchListToShow(searchMenuList);
    }
}

SearchFactory.prototype.isSearchMenuListShown = function(searchMenuList) {
    return searchMenuList.classList.contains("visible");
}

SearchFactory.prototype.styleSearchListToShow = function(searchMenuList) {
    searchMenuList.classList.remove("hidden");
    searchMenuList.classList.add("visible");
}

SearchFactory.prototype.styleSearchInputForNoMatch = function(searchInput) {
    searchInput.classList.add("no-match");
}

SearchFactory.prototype.hideSearchlist = function(searchMenuList) {
    if(this.isSearchMenuListShown(searchMenuList)) {
        this.styleSearchListToHide(searchMenuList);
    }
}

SearchFactory.prototype.isSearchMenuListShown = function(searchMenuList) {
    return searchMenuList.classList.contains("visible");
}

SearchFactory.prototype.styleSearchListToHide = function(searchMenuList) {
    searchMenuList.classList.remove("visible");
    searchMenuList.classList.add("hidden");
}

SearchFactory.prototype.clearSearchInput = function() {
    this.originalInput = "";
    if(this.searchInput){
        this.searchInput.value = "";
    }
}

SearchFactory.prototype.cleanup = function() {
    this.originalInput = "";
    if(this.searchInput){
        this.searchInput.blur();
        this.searchInput.value = "";
    }
}
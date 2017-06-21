var GroupType = {
    Dot: 0,
    Dash: 1,
    None: 2,
    Invalid: 3
};

var MouseButtonType = {
    Left: 1,
    Middle: 2,
    Right: 3
}

/*

  Event types:

    Unselect item from group labels (The collapsable and expandable one):
      group-label/unselect-item AND params: {itemID}

    Select item from group labels (The collapsable and expandable one):
      group-label/select-item AND params: {groupID, itemID}

    Unselect item from selected labels (The one above the search bar):
      selected-label/unselect-item/<group uid> AND params {itemID}

    Select item from selected labels (The one above the search bar):
      selected-label/select-item/<group uid> AND params: {itemID}

    User wants to permanently apply the labels selected:
      search-bar/apply-selected-labels AND params: {}

    UI needs to be updated with new data
      side-bar-ui/update-data AND params: {instanceID}

    Sidebar is being shown
      side-bar-ui/visible AND params: {}

*/
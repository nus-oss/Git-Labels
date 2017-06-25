Git Labels
==========

![](readme-resources/images/main.png)

Git Labels is a google chrome extension that help users better manage grouped labels within their Github repository. This extension helps organize labels into different groups and restricts user's selection of labels based on label group exclusivity rules. It currently supports three different label group types and they are dot, dashed and non-grouped.

## Getting Started

These instructions will get you a copy of the project and run it as a Google Chrome Extension within Google Chrome on your local machine. See [wiki](https://github.com/jiajunGit/Git-Labels/wiki) for this project's developer notes.

### Prerequisites

```
Google Chrome 56.0.2924 or above with javascript enabled
```

### Download

#### Direct Link

**[Click here to download latest version](https://github.com/jiajunGit/Git-Labels/archive/master.zip)**

#### Code on Github

The full git repository is at: <https://github.com/jiajunGit/Git-Labels> Get it using the following command:

        $ git clone https://github.com/jiajunGit/Git-Labels.git

### Installation

1. **Download Git Labels**

    Download a [copy](#download) of the project onto your local machine and unzip its contents. Ensure that the root structure of your folder is as shown below:

    ![step one](readme-resources/images/installation-step-one.png)

2. **Navigate to Chrome Extensions**

    Navigate to [chrome://extensions/](chrome://extensions/) in Google Chrome

3. **Enable Developer Mode**

    Tick on the checkbox with the words "Developer mode" on its right

    ![step three](readme-resources/images/installation-step-three.png)

4. **Load unpacked extension**

    Click on the "Load unpacked extension..." button and select the folder containing the project. Ensure that after loading the extension, your Google Chrome extension page has an entry for Git Labels as shown below:

    ![step four](readme-resources/images/installation-step-four.png)
    
## Features

1. **Labels search**
    
    If you have many labels, Git Labels search will help you quickly find labels that you are looking for.

    ![search](readme-resources/images/search.png)

2. **Organize grouped labels**

    Labels are organized according to their groups (dot, dashed or non-grouped).

    ![grouped-labels](readme-resources/images/grouped-labels.png)

3. **Convenient label selection and unselection**

    Selected labels are displayed above the search bar for easy reference. Furthermore, the selection status of labels can be toggled on or off by clicking on those labels.
    
    ![select-label](readme-resources/images/select-label.png)
    ![unselect-label](readme-resources/images/unselect-label.png)

4. **Resolve conflicts among selected labels within exclusive groups**

    Git Labels will prevent any conflicts due to selection of labels from exclusive groups. Only one label within a exclusive group should be selected at any one time for an issue and thus selection of more than one label from such a group will result in a conflict. In the example below, d.FirstTimers and d.Contributors belong to the same group (i.e d dot group).

    ![selected-labels](readme-resources/images/selected-labels.png)

5. **Colorpicker**

    Instead of a fixed color palette, Git labels offers its users a colorpicker for selecting colors for newly created labels.

    ![colorpicker](readme-resources/images/colorpicker.png)

## Built With

jQuery - ([https://github.com/jquery/jquery](https://github.com/jquery/jquery))

Semantic UI - ([https://github.com/semantic-org/semantic-ui/](https://github.com/semantic-org/semantic-ui/))

PubSubJS - ([https://github.com/mroderick/PubSubJS](https://github.com/mroderick/PubSubJS))

ScrollIntoView - ([https://github.com/litera/jquery-scrollintoview](https://github.com/litera/jquery-scrollintoview))

Spectrum - ([https://github.com/bgrins/spectrum](https://github.com/bgrins/spectrum))

## For Developers

See [wiki](https://github.com/jiajunGit/Git-Labels/wiki) for this project's developer notes.

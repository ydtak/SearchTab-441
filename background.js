/** Currently open tab data. */
var tabs = [];

/** 
 * Callback method is triggered when all currently open chrome browser windows 
 * are retrieved.
 */
var onGetWindows = function(windows) {
    for (var i = 0; i < windows.length; ++i) {
        tabs = tabs.concat(windows[i].tabs);
    }
}

function init() {
    chrome.windows.getAll({populate: true}, onGetWindows);
}

init();
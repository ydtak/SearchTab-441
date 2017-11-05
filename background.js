/** Currently open tab data. */
var tabs = [];

/** Last search query (persist between opening and closing the extension). */
var last_search_query = "";

/** 
 * Callback method is triggered when all currently open chrome browser windows 
 * are retrieved.
 */
var onGetWindows = function(windows) {
	tabs = [];
    for (var i = 0; i < windows.length; ++i) {
        tabs = tabs.concat(windows[i].tabs);
    }
}

/** Callback method is triggered when open tabs are updated. */
function onUpdateTabs() {
    chrome.windows.getAll({populate: true}, onGetWindows);
}

function init() {
    chrome.windows.getAll({populate: true}, onGetWindows);      
    chrome.tabs.onUpdated.addListener(onUpdateTabs);
    chrome.tabs.onRemoved.addListener(onUpdateTabs);
}

init();
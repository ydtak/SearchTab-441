/** Reference to background page. */
var bg = chrome.extension.getBackgroundPage();

/** Normalize string for string content comparisons. */
function normalizeString(str) {
    return str.trim().toUpperCase();
}

/** Returns true if str is a match for query. */
function isMatch(str, query) {
    return normalizeString(str).match(normalizeString(query));
}

/** Adds HTML for search result item and appends to div. */
function addSearchResult(div, tab) {
    var button = document.createElement("button");
    button.innerHTML = tab.title;
    button.onclick = function() {activateTab(tab.windowId, tab.id)};
    div.appendChild(button);
}

/** Switches to tab identified by window_id and tab_id. */
function activateTab(window_id, tab_id) {
    chrome.windows.update(window_id, {focused: true});
    chrome.tabs.update(tab_id, {active: true});
}

/** Renders new search results on popup. */
function renderSearchResults(search_query) {
    // clear all old search results
    var div = document.getElementById("content");
    div.innerHTML = "";

    if (search_query.trim() != "") {
        for (var i = 0; i < bg.tabs.length; ++i) {
            var tab = bg.tabs[i];
            if (isMatch(tab.title, search_query)) {
                addSearchResult(div, tab);
            }
        }    
    }
}

/** Callback method is triggered when user modifies search query in the search box. */
var onSearchInputChanged = function(event) {
    var input_search_tab = document.getElementById("input_search_tab");
    renderSearchResults(input_search_tab.value);
}


window.onload = function() {
    var input_search_tab = document.getElementById("input_search_tab");
    input_search_tab.addEventListener("input", onSearchInputChanged);
}
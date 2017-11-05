/** Reference to background page. */
var bg = chrome.extension.getBackgroundPage();

/** Normalize string for string content comparisons. */
function normalizeString(str) {
    return str.trim().toUpperCase();
}

/** Returns true if tab is a match for query. */
function isMatch(tab, query) {
    return normalizeString(tab.title).match(normalizeString(query)) 
        || normalizeString(tab.url).match(normalizeString(query));
}

/** Adds HTML for search result item and appends to div. */
function addSearchResult(div, tab) {
    var button = document.createElement("button");
    button.classList.add("btn");
    button.classList.add("btn-block");
    button.innerHTML = tab.title;
    button.onclick = function() {activateTab(tab.windowId, tab.id)};
    div.appendChild(button);
}

/** Switches to tab identified by window_id and tab_id. */
function activateTab(window_id, tab_id) {
    chrome.windows.update(window_id, {focused: true});
    chrome.tabs.update(tab_id, {active: true});
}

/** Onclick method for autogroup button. */
function onClickAutogroup() {
    var input_search_tab = document.getElementById("input_search_tab");
    var div = document.getElementById("content");
    div.innerHTML = "";
    appendGroup(
        div, 
        "Stackoverflow", 
        function(tab) {
            return normalizeString(tab.url).match(normalizeString("stackoverflow"))
        });
    appendGroup(
        div, 
        "Misc", 
        function(tab) {
            return !normalizeString(tab.url).match(normalizeString("stackoverflow"))
        });
}

function appendGroup(div, group_title, matcher) {
    // create group title
    var title_h3 = document.createElement("h3");
    title_h3.innerHTML = group_title;
    div.appendChild(title_h3);

    // add tabs
    for (var i = 0; i < bg.tabs.length; ++i) {
        var tab = bg.tabs[i];
        if (matcher(tab)) {
            addSearchResult(div, tab);
        }
    }    
}

/** Renders new search results on popup. */
function renderSearchResults(search_query) {
    // clear all old search results
    var div = document.getElementById("content");
    div.innerHTML = "";

    if (search_query.trim() != "") {
        for (var i = 0; i < bg.tabs.length; ++i) {
            var tab = bg.tabs[i];
            if (isMatch(tab, search_query)) {
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

    var button_autogroup = document.createElement("button");
    button_autogroup.innerHTML = "Autogroup";
    button_autogroup.onclick = function() {onClickAutogroup()};
    button_autogroup.classList.add("btn");
    document.getElementById("autogroup_div").appendChild(button_autogroup);
}
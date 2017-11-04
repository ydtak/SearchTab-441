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

/** Generates HTML for search result item. */
function createSearchResult(title) {
    return `<p>` + title + `</p>`;
}

/** Renders new search results on popup. */
function renderSearchResults(search_query) {
    var search_contents = "";
    if (search_query.trim() != "") {
        for (var i = 0; i < bg.tabs.length; ++i) {
            var tab_title = bg.tabs[i].title;
            if (isMatch(tab_title, search_query)) {
                search_contents += createSearchResult(tab_title);
            }
        }    
    }
    document.getElementById("content").innerHTML = search_contents;
}

/** Callback method is triggered when user modifies search query in the search box. */
var onSearchInputChanged = function(event) {
    console.log(event); // TODO: remove debug message
    var input_search_tab = document.getElementById("input_search_tab");
    renderSearchResults(input_search_tab.value);
}


window.onload = function() {
    var input_search_tab = document.getElementById("input_search_tab");
    input_search_tab.addEventListener("input", onSearchInputChanged);
}
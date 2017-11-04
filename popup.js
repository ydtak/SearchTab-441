/** Reference to background page. */
var bg = chrome.extension.getBackgroundPage();

/** Generates HTML for search result item. */
function createSearchResult(title) {
    return `<p>` + title + `</p>`;
}

/** Renders new search results on popup. */
function renderSearchResults(/* TODO */) {
    var search_contents = "";
    for (var i = 0; i < bg.tabs.length; ++i) {
        var matches = true;
        // TODO: implement matching
        if (matches) {
            search_contents += createSearchResult(bg.tabs[i].title);
        }
    }
    document.getElementById("content").innerHTML = search_contents;
}

/** Callback method is triggered when user modifies search query in the search box. */
var onSearchInputChanged = function(event) {
    console.log(event); // TODO: remove debug message
    var input_search_tab = document.getElementById("input_search_tab");
    if (input_search_tab.value.trim() != "") {
        renderSearchResults();
    } else {
        document.getElementById("content").innerHTML = "";
    }

}


window.onload = function() {
    var input_search_tab = document.getElementById("input_search_tab");
    input_search_tab.addEventListener("input", onSearchInputChanged);
}
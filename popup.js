/** Reference to background page. */
var bg = chrome.extension.getBackgroundPage();

/** Generates HTML for search result item. */
function createSearchResult(title) {
    return `<p>` + title + `</p>`;
}

window.onload = function() {
    var search_contents = "";
    for (var i = 0; i < bg.tabs.length; ++i) {
        search_contents += createSearchResult(bg.tabs[i].title);
    }
    document.getElementById("content").innerHTML = search_contents;
}
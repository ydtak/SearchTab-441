
/** UI States. */
const UI_AUTOGROUP = "UI_AUTOGROUP";
const UI_NORMAL = "UI_NORMAL";

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

    var search_result_div = document.createElement("row");
    var icon_div = document.createElement("img");
    var br = document.createElement("BR");
    icon_div.setAttribute("src",tab.favIconUrl);
    var span_div = document.createElement("span");
    span_div.innerHTML = tab.title;
    var switch_tab_button = document.createElement("div");
    var close_tab_button = document.createElement("div");
    
    switch_tab_button.classList.add("btn", "btn-secondary", "col-10");
    close_tab_button.classList.add("btn", "btn-danger", "col-2");
    switch_tab_button.appendChild(icon_div);
    switch_tab_button.appendChild(span_div);
    close_tab_button.innerHTML = "Close";

    search_result_div.appendChild(switch_tab_button);
    search_result_div.appendChild(close_tab_button);


    switch_tab_button.onclick = function() {activateTab(tab.windowId, tab.id)};
    close_tab_button.onclick = function() {removeTab(div, search_result_div, tab.id)};
    div.appendChild(search_result_div);
}

/** Switches to tab identified by window_id and tab_id. */
function activateTab(window_id, tab_id) {
    chrome.windows.update(window_id, {focused: true});
    chrome.tabs.update(tab_id, {active: true});
}

/** Closes tab identified by tab_id. */
function removeTab(div, button_group_div, tab_id) {
    previous = button_group_div.previousSibling;
    next = button_group_div.nextSibling;
    div.removeChild(button_group_div);
    if(previous.nodeName == "H3" && next.nodeName == "H3"){
        previous.parentNode.removeChild(previous);
    }
    chrome.tabs.remove(tab_id);
}

/** Onclick method for UI toggle button. */
function onClickToggleUi() {
    bg.ui_state = bg.ui_state === UI_NORMAL ? UI_AUTOGROUP : UI_NORMAL;
    renderSearchResults(document.getElementById("input_search_tab").value);
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

    var domains = {};
    for (var i = 0; i < bg.tabs.length; ++i) {
        var tab = bg.tabs[i];
        var url = new URL(tab.url)
        var domain = url.hostname
        domains[domain] = domain;
    }    
    console.log(domains);
    if (bg.ui_state === UI_AUTOGROUP) {

        for(var domain in domains){
            cleanedDomain = domain;
            cleanedDomain = cleanDomain(cleanedDomain,true)
            appendGroup(
            div, 
            cleanedDomain, 
            function(tab) {
                return normalizeString(tab.url).match(normalizeString(domain)) 
                    && isMatch(tab, search_query);
            }); 
        } 
    } else {
        appendGroup(div, "", function(tab) {return isMatch(tab, search_query);})
    }
}

function cleanDomain(url, subdomain) {
    subdomain = subdomain || false;

    url = url.replace(/(https?:\/\/)?(www.)?/i, '');
    lastDotIndex = url.lastIndexOf(".");
    if (!subdomain) {
        url = url.split('.');

        url = url.slice(url.length - 2).join('.');
    }

    if (url.indexOf('/') !== -1) {
        return url.split('/')[0];
    }
    //.com from word
    if(lastDotIndex != -1){
        url = url.substring(0,lastDotIndex);
    }
    //
    remainingDotIdx = url.indexOf(".");
    if(remainingDotIdx != -1){
        newurl = url.split(".");
        temp = newurl[newurl.length-1];
        newurl[newurl.length-1] = titleCase(newurl[0]);
        newurl[0] = titleCase(temp);
        url = newurl.join(" ");
    }

    return titleCase(url);
}

function titleCase(str) {
  return str.toLowerCase().split(' ').map(function(word) {
    return (word.charAt(0).toUpperCase() + word.slice(1));
  }).join(' ');
}

/** Callbcka method is triggered when user modifies search query in the search box. */
var onSearchInputChanged = function(event) {
    var input_search_tab = document.getElementById("input_search_tab");
    bg.last_search_query = input_search_tab.value;
    renderSearchResults(input_search_tab.value);
}


window.onload = function() {
    var input_search_tab = document.getElementById("input_search_tab");
    input_search_tab.addEventListener("input", onSearchInputChanged);

    // reinput last query
    input_search_tab.value = bg.last_search_query;
    input_search_tab.select();
    renderSearchResults(input_search_tab.value);

    // create autogroup button
    var button_toggle_ui = document.createElement("button");
    button_toggle_ui.id = "button_toggle_ui";
    button_toggle_ui.innerHTML = "Autogroup";
    button_toggle_ui.onclick = function() {onClickToggleUi()};
    button_toggle_ui.classList.add("btn");
    document.getElementById("autogroup_div").appendChild(button_toggle_ui);
}
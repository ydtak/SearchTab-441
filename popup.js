/** UI States. */
// const UI_AUTOGROUP = "UI_AUTOGROUP";
// const UI_NORMAL = "UI_NORMAL";
const CRTL_KEYCODE = 17;
const UP_KEYCODE = 38;
const DOWN_KEYCODE = 40;
const RIGHT_KEYCODE = 39;
const LEFT_KEYCODE = 37;
const ENTER_KEYCODE = 13;
const SHIFT_KEYCODE = 16;
const S_KEYCODE = 83;

/** Reference to background page. */
var bg = chrome.extension.getBackgroundPage();

let pressed = {};
document.addEventListener('keydown', (event)=> {
    pressed[event.keyCode] = true;
});

document.addEventListener('keyup', (event)=> {
    delete pressed[event.keyCode];
    console.log(pressed);
}); 

document.addEventListener('keydown', (event)=> {
    if(pressed[CRTL_KEYCODE] && pressed[UP_KEYCODE]){
        focusChange("up");
    }
    else if(pressed[CRTL_KEYCODE] && pressed[DOWN_KEYCODE]){
        focusChange("down");
    }
    else if(pressed[CRTL_KEYCODE] && pressed[RIGHT_KEYCODE]){
        focusChange("right");
    }
    else if(pressed[CRTL_KEYCODE] && pressed[LEFT_KEYCODE]){
        focusChange("left");
    } else if(pressed[CRTL_KEYCODE] && pressed[ENTER_KEYCODE]) {
        clickPressed();
    } else if(pressed[CRTL_KEYCODE] && pressed[SHIFT_KEYCODE] && pressed[S_KEYCODE]){
        setFocusToSearch();
    }
});


/** Used for hotkeys **/
var resultElementSelected = false;
var closeElementSelected = false;
var elementSelected = false;


function clickPressed(){
    if(closeElementSelected) {
        $('.focusedClosed').click();
        closeElementSelected = false;
        elementSelected = false;
    } else if(resultElementSelected){
        elementSelected = false;
        resultElementSelected = false;
        $('.focusedResult').click()
        $('.focusedResult').removeClass("focusedResult");

    }
}


function scrollIntoViewElement(node){
    var headerHeight = $("#header").height();
    node.scrollIntoView(true);
    var scrolledY = window.scrollY;

    if(scrolledY){
        window.scroll(0, scrolledY - headerHeight - 23);
    }
}

function isScrolledIntoView(elem) {
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();

    var elemTop = $(elem).offset().top;
    var elemBottom = elemTop + $(elem).height();

    return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
}

function setFocusToSearch(){
    document.getElementById("input_search_tab").focus();
}

function focusChange(keypress){
    if (elementSelected == false) {
        nextToSelect = $('#content').find('.first').next()
        console.log(nextToSelect[0].tagName);
        if(nextToSelect[0].tagName == "H3"){

            nextToSelect.next().find('.btn-secondary').addClass("focusedResult");
        } else{
            nextToSelect.find('.btn-secondary').addClass("focusedResult");
        }
        elementSelected = true;
        resultElementSelected = true;
        // $('.focusedResult')[0].scrollIntoView();
        scrollIntoViewElement($('.focusedResult')[0])
    } else {
        if(resultElementSelected) {
            if(keypress == "right"){
                var nextToSelect = $('.focusedResult').next();
                console.log(nextToSelect);
                $('.focusedResult').removeClass('focusedResult');
                nextToSelect.addClass("focusedClosed");
                resultElementSelected = false;
                closeElementSelected = true;
                // $('.focusedClosed')[0].scrollIntoView();
                scrollIntoViewElement($('.focusedClosed')[0])
            }
            var nextToSelect = nextDivElementForFocus(keypress, '.focusedResult');
            if(nextToSelect != null) {
                $('.focusedResult').removeClass('focusedResult');
                nextToSelect.find('.btn-secondary').addClass("focusedResult");
                // $('.focusedResult')[0].scrollIntoView();
                scrollIntoViewElement($('.focusedResult')[0])
            } 
        }
        if(closeElementSelected){
            if(keypress == "left"){
                var nextToSelect = $('.focusedClosed').prev();
                console.log(nextToSelect);
                $('.focusedClosed').removeClass('focusedClosed');
                nextToSelect.addClass("focusedResult");
                closeElementSelected = false;
                resultElementSelected = true;
                // $('.focusedClosed')[0].scrollIntoView();
                scrollIntoViewElement($('.focusedClosed')[0])
            }

            var nextToSelect = nextDivElementForFocus(keypress, '.focusedClosed');
            if(nextToSelect != null) {
                $('.focusedClosed').removeClass('focusedClosed');
                nextToSelect.find('.btn-danger').addClass("focusedClosed");
                // $('.focusedClosed')[0].scrollIntoView();
                scrollIntoViewElement($('.focusedClosed')[0])
            }

        }

    }
}

function nextDivElementForFocus(keypress, focus){
    if(keypress == "up"){
        var nextToSelect = $(focus).parent().prev();

        if(nextToSelect[0].tagName == "H3"){
            nextToSelect = nextToSelect.prev();
        }
        if(nextToSelect.hasClass("first")) {
            return null
        }

        return nextToSelect
    } else if(keypress == "down"){
        var nextToSelect = $(focus).parent().next();
        if(nextToSelect.hasClass("last")) {
            return null
        }
        if(nextToSelect[0].tagName == "H3"){
            nextToSelect = nextToSelect.next();
        }
        return nextToSelect
    }
}

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
    chrome.tabs.update(tab_id, {active: true});
    chrome.windows.update(window_id, {focused: true});

}

/** Closes tab identified by tab_id. */
function removeTab(div, button_group_div, tab_id) {
    previous = button_group_div.previousSibling;
    next = button_group_div.nextSibling;
    console.log(next);
    div.removeChild(button_group_div);
    if(previous.nodeName == "H3" && (next.classList.contains("last") || next.nodeName=="H3")){
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
    title_h3.innerHTML = "<br>" + group_title;

    // add tabs
    //if a domain group does not have a result
    //use this to ensure that title_h3 does not get added
    title_added = false;
    for (var i = 0; i < bg.tabs.length; ++i) {
        var tab = bg.tabs[i];
        if (matcher(tab)) {
            if(!title_added) {
                div.appendChild(title_h3);
            }

            title_added = true;
            addSearchResult(div, tab);
        }
    }

}

/** Renders new search results on popup. */
function renderSearchResults(search_query) {
    // clear all old search results
    var div = document.getElementById("content");
    div.innerHTML = "";

    //used to help identify position for shortcut
    var first = document.createElement("div");
    first.classList.add("first");
    div.appendChild(first);

    var unorderedDomains = {};
    for (var i = 0; i < bg.tabs.length; ++i) {
        var tab = bg.tabs[i];
        var url = new URL(tab.url)
        var domain = url.hostname
        var cleanedDomain = cleanDomain(domain,true)
        unorderedDomains[cleanedDomain] = domain;
    }    

    var domains = {};
    Object.keys(unorderedDomains).sort().forEach(function(key) {
      domains[key] = unorderedDomains[key];
    });

    for(var domain in domains){
        appendGroup(
            div, 
            domain, 
            function(tab) {
                return normalizeString(tab.url).match(normalizeString(domains[domain])) 
                && isMatch(tab, search_query);
            }); 
    } 

    //used to help identify position for shortcut
    var last = document.createElement("div");
    last.classList.add("last");
    div.appendChild(last);
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

    // // create autogroup button
    // var button_toggle_ui = document.createElement("button");
    // button_toggle_ui.id = "button_toggle_ui";
    // button_toggle_ui.innerHTML = "Autogroup";
    // button_toggle_ui.onclick = function() {onClickToggleUi()};
    // button_toggle_ui.classList.add("btn");
    // // document.getElementById("autogroup_div").appendChild(button_toggle_ui);
}


// // When the user scrolls the page, execute scrollNavbar 
// window.onscroll = function() {scrollNavbar()};

// // Get the navbar
// var navbar = document.getElementById("navbar");

// // Get the offset position of the navbar
// var sticky = navbar.offsetTop;

// // Add the sticky class to the navbar when you reach its scroll position. Remove "sticky" when you leave the scroll position
// function scrollNavbar() {
//   if (window.pageYOffset >= sticky) {
//     navbar.classList.add("sticky")
//   } else {
//     navbar.classList.remove("sticky");
//   }
// }
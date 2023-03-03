chrome.browserAction.onClicked.addListener(function (tab) {
    var newUrl = sortUrl(tab.url);
    chrome.tabs.update(tab.id, {url: newUrl});
});

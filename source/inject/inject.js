chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
    if (changeInfo.status === 'complete') {
        chrome.tabs.executeScript(tabId, {
            allFrames: true, 
            file: 'source/inject/payload.js'
        });
    }
});
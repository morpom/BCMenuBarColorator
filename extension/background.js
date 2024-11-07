chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ url_dict: {} }, () => {
        console.log("Initial URL dictionary set.");
    });
});

chrome.runtime.onMessage.addListener((message, sendResponse) => {
    if (message.action === 'updateColor') {
        console.log('Received addColor message:', message);
        sendResponse({ status: 'success' });
    }
});
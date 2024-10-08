(function() {
    'use strict';

    // Function to change the background color based on URL
    function changeBackgroundColor(url_dict) {
        const url = window.location.href;
        const productMenuBar = document.querySelector('[id=product-menu-bar]'); // Select elements with the id "product-menu-bar"

        if (productMenuBar) {
            for (const [key, value] of Object.entries(url_dict)) {
                if (url.startsWith(key)) {
                    productMenuBar.style.backgroundColor = value;
                    break; // Stop checking once we find a match
                }
            }
        }
    }

    // Retrieve the URL-color mappings from storage and apply the color on page load
    chrome.storage.sync.get('url_dict', (data) => {
        const url_dict = data.url_dict || {};
        changeBackgroundColor(url_dict);
    });

    // Listen for messages from the popup script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'updateColor') {
            const { url, color } = message;

            // Apply the new color to the product menu bar immediately
            const productMenuBar = document.querySelector('[id=product-menu-bar]');
            if (productMenuBar && window.location.href.startsWith(url)) {
                productMenuBar.style.backgroundColor = color;
            }
        }
    });

    // Observe DOM changes in case elements are dynamically loaded
    const observer = new MutationObserver(() => {
        chrome.storage.sync.get('url_dict', (data) => {
            const url_dict = data.url_dict || {};
            changeBackgroundColor(url_dict);
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });

})();

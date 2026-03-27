(function() {
    'use strict';
    const url = window.location.href;

    // Core functions
    function applyMenuBarColor(color) {
        let style = document.getElementById('bc-colorator-menubar-style');
        if (!style) {
            style = document.createElement('style');
            style.id = 'bc-colorator-menubar-style';
            document.head.appendChild(style);
        }
        style.textContent = color
            ? `#product-menu-bar, #O365_NavHeader, #product-menu-bar *, #O365_NavHeader * { background-color: ${color} !important; border-color: transparent !important; outline-color: transparent !important; box-shadow: none !important; }`
            : '';
    }

    function changeBackgroundColor(url_dict) {
        let longestMatch = null;
        for (const [key, value] of Object.entries(url_dict)) {
            if (url.startsWith(key)) {
                if (longestMatch === null || key.length > longestMatch.length) {
                    longestMatch = key;
                    applyMenuBarColor(value[0]);
                    applyDarkMode(value[1]);
                }
            }
        }
    }

    function applyDarkMode(darkModeOn) {
        const iframe = document.querySelector('iframe');
    
        if (!iframe || !iframe.contentDocument) {
            console.warn('Dark mode: iframe not found or not accessible.');
            return;
        }
    
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    
        if (darkModeOn) {
            console.log('Dark mode on (inside iframe)');
            if (iframeDoc.getElementById('dark-mode-style')) {
                return;
            }
            const style = iframeDoc.createElement('style');
            style.id = 'dark-mode-style';
            style.textContent = `
                html {
                    filter: invert(1) hue-rotate(180deg) contrast(0.9) brightness(1.1);
                }

                img,
                video,
                canvas,
                [style*="background-image"] {
                    filter: invert(1) hue-rotate(180deg) contrast(1.0) brightness(1.0) !important;
                }
            `;
            iframeDoc.documentElement.appendChild(style);
        } else {
            const style = iframeDoc.getElementById('dark-mode-style');
            if (style) {
                style.remove();
            }
        }
    }

    // Message listeners
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'updateColor') {
            applyDarkMode(message.darkMode); // Apply the dark mode state
            applyMenuBarColor(message.color);
        } else if (message.action === 'refreshStyles') {
            refreshStyles();
        } else if (message.action === 'openTableExternally') {
            let el = document.querySelectorAll('[role="textbox"][tabindex="0"]')[1];
            if (el) {
                const match = el.textContent.match(/\(([^)]+)\)/);
                if (match) {
                    let baseURL = window.location.href.split('?')[0];
                    let URLToOpen = `${baseURL}?table=${match[1]}`;
                    window.open(URLToOpen, '_blank');
                }
            } else {
                console.log('Table ID not found.');
            }
        } else if (message.action === 'checkTableIdPresent') {
            let el = document.querySelectorAll('[role="textbox"][tabindex="0"]')[1];
            let found = false;
            if (el) {
                const match = el.textContent.match(/\(([^)]+)\)/);
                if (match) {
                    found = true;
                }
            }
            sendResponse({ found });
            return true; // Indicate async response
        }
    });

    function refreshStyles() {
        chrome.storage.sync.get('url_dict', (data) => {
            const url_dict = data.url_dict || {};
            let matched = false;
            for (const [key, value] of Object.entries(url_dict)) {
                if (url.startsWith(key)) {
                    applyMenuBarColor(value[0]);
                    applyDarkMode(value[1]);
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                applyMenuBarColor('#282828');
                applyDarkMode(false);
            }
        });
    }

    // DOM observer
    const observer = new MutationObserver(() => {
        chrome.storage.sync.get('url_dict', (data) => {
            const url_dict = data.url_dict || {};
            changeBackgroundColor(url_dict);
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial setup
    chrome.storage.sync.get('url_dict', (data) => {
        const url_dict = data.url_dict || {};
        changeBackgroundColor(url_dict);
    });
})();

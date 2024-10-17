/*
* @Author: Saurabh Kumar
* @DATE: 8/10/2024
* @File: content.js
* @Description: Content script to inject in each page in order to detect cut, copy and paste event.
*/


function sendToServer(eventType, text, url) {
    // Request stored data from the background script (if needed)
    chrome.runtime.sendMessage({
        action: 'itp',
        type: eventType,
        url: url,
        content: text
    });
}

document.addEventListener('copy', function(event) {
    const copiedText = window.getSelection().toString();
    const url = window.location.href;
    // console.log('Copied text:', copiedText);
    sendToServer('COPY', copiedText, url);
});

// Detect cut event
document.addEventListener('cut', function(event) {
    const cutText = window.getSelection().toString();
    const url = window.location.href;
    // console.log('Cut text:', cutText);
    sendToServer('CUT', cutText, url);
});

// Detect paste event
document.addEventListener('paste', function(event) {
    const pastedText = event.clipboardData.getData('text');
    const url = window.location.href;
    event.preventDefault();
    // console.log('Pasted text:', pastedText);
    sendToServer('PASTE', pastedText, url);
}, false);
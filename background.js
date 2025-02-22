chrome.runtime.onInstalled.addListener(() => {
    console.log("YouTube Video Titles Extension Installed!");
});

chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: extractTitles
    }, (results) => {
        console.log("Extracted Titles:", results);
    });
});

function extractTitles() {
    const titles = [...document.querySelectorAll('h3 a#video-title')].map(el => el.innerText.trim());
    console.log("Video Titles:", titles);
}

function getVideoTitles() {
    const titles = [...document.querySelectorAll('h3 a#video-title')].map(el => el.innerText.trim());
    return titles;
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getTitles") {
        sendResponse({ titles: getVideoTitles() });
    }
});

function logAllVideoTitles() {
    const videoElements = document.querySelectorAll('ytd-video-renderer, ytd-grid-video-renderer');
    let allTitles = [];

    videoElements.forEach(video => {
        const titleElement = video.querySelector('h3 a#video-title');
        if (titleElement) {
            const title = titleElement.innerText.trim();
            allTitles.push(title);
        }
    });

    console.log("All Video Titles:", allTitles);
}

// Run function when the page loads
logAllVideoTitles();

let observer;

function getAllVideoTitles() {
    const videoElements = document.querySelectorAll('ytd-video-renderer, ytd-grid-video-renderer, ytd-rich-item-renderer');
    let allTitles = [];

    videoElements.forEach(video => {
        const titleElement = video.querySelector('h3 a#video-title, span#video-title');
        if (titleElement) {
            const title = titleElement.innerText.trim();
            allTitles.push(title);
        }
    });

    console.log("All Video Titles:", allTitles);

    // Send titles to popup.js
    chrome.runtime.sendMessage({
        type: "UPDATE_VIDEO_LIST",
        matchingTitles: allTitles,
        removedTitles: [] // Empty for now, used if filtering is active
    });
}

// Observe page changes (for lazy loading)
function observeChanges() {
    if (observer) observer.disconnect(); // Stop previous observer

    observer = new MutationObserver(() => {
        console.log("Page updated, fetching new titles...");
        getAllVideoTitles();
    });

    const targetNode = document.body;
    observer.observe(targetNode, { childList: true, subtree: true });
}

// Run initially and set observer
getAllVideoTitles();
observeChanges();

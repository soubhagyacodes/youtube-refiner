document.addEventListener("DOMContentLoaded", async () => {
    console.log("Popup script loaded!");

    const videoList = document.getElementById("video-list");
    const removedList = document.createElement("ul"); // List for removed titles
    removedList.id = "removed-list"; 

    if (!videoList) {
        console.error("Error: 'video-list' element not found in popup.html");
        return;
    }

    // Get active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) {
            console.error("No active tab found.");
            videoList.innerHTML = "<li>Error: No active tab.</li>";
            return;
        }

        let tabId = tabs[0].id;
        console.log("Active Tab ID:", tabId);

        // Ensure we are on YouTube
        if (!tabs[0].url.includes("youtube.com")) {
            videoList.innerHTML = "<li>Not a YouTube page.</li>";
            return;
        }

        // Inject script into the active tab
        chrome.scripting.executeScript(
            {
                target: { tabId: tabId },
                func: extractTitlesAndQuery
            },
            (results) => {
                if (chrome.runtime.lastError) {
                    console.error("Script injection error:", chrome.runtime.lastError);
                    videoList.innerHTML = "<li>Error: Unable to fetch titles.</li>";
                    return;
                }

                if (!results || !results[0] || !results[0].result) {
                    console.warn("No video titles found.");
                    videoList.innerHTML = "<li>No titles found.</li>";
                    return;
                }

                const { query, titles } = results[0].result;
                console.log("Search Query:", query);
                console.log("Extracted Titles:", titles);

                // Filter video titles that contain any word from the search query
                const queryWords = query.toLowerCase().split(" ");
                const matchingTitles = [];
                const removedTitles = [];

                titles.forEach(title => {
                    if (queryWords.some(word => title.toLowerCase().includes(word))) {
                        matchingTitles.push(title);
                    } else {
                        removedTitles.push(title);
                    }
                });

                // Display search query
                let queryElement = document.createElement("h3");
                queryElement.textContent = `Search Query: ${query || "Not a search page"}`;
                videoList.before(queryElement);

                // Update UI with matching titles
                videoList.innerHTML = "<h4>Matching Videos</h4>";
                if (matchingTitles.length === 0) {
                    videoList.innerHTML += "<li>No matching videos found.</li>";
                } else {
                    matchingTitles.forEach(title => {
                        let li = document.createElement("li");
                        li.textContent = title;
                        videoList.appendChild(li);
                    });
                }

                // Update UI with removed titles (red color)
                removedList.innerHTML = "<h4 style='color: red;'>Removed Videos</h4>";
                if (removedTitles.length === 0) {
                    removedList.innerHTML += "<li style='color: red;'>No videos removed.</li>";
                } else {
                    removedTitles.forEach(title => {
                        let li = document.createElement("li");
                        li.textContent = title;
                        li.style.color = "red";
                        removedList.appendChild(li);
                    });
                }

                videoList.after(removedList); // Append removed list after matching list
            }
        );
    });
});

// Function that runs in the YouTube tab to extract video titles + search query
function extractTitlesAndQuery() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get("search_query") || "N/A"; // Extracts query from URL
    const titles = [...document.querySelectorAll('h3 a#video-title')].map(el => el.innerText.trim());

    return { query: searchQuery, titles };
}

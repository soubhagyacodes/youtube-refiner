chrome.storage.sync.get(["blockedTopics"], (data) => {
  const blockedTopics = data.blockedTopics || [];
  filterVideos(blockedTopics);
});

function filterVideos(blockedTopics) {
  console.log("Filtering videos with topics:", blockedTopics);

  // Select all YouTube video elements
  const videoElements = document.querySelectorAll(
    "ytd-video-renderer, ytd-grid-video-renderer, ytd-rich-item-renderer"
  );

  videoElements.forEach((video) => {
    const titleElement = video.querySelector("#video-title");
    if (titleElement) {
      const title = titleElement.innerText.toLowerCase();
      blockedTopics.forEach((topic) => {
        if (title.includes(topic.toLowerCase())) {
          console.log("Hiding video:", title);
          video.style.display = "none"; // Hides instead of removing
        }
      });
    }
  });

  // Hide Shorts section
  const shortsSection = document.querySelector("ytd-rich-section-renderer");
  if (
    shortsSection &&
    shortsSection.innerText.toLowerCase().includes("shorts")
  ) {
    console.log("Hiding Shorts section");
    shortsSection.style.display = "none";
  }
}

// Observe YouTube feed updates to keep filtering
const observer = new MutationObserver(() => {
  chrome.storage.sync.get(["blockedTopics"], (data) => {
    filterVideos(data.blockedTopics || []);
  });
});
observer.observe(document.body, { childList: true, subtree: true });

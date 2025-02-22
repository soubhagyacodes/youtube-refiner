document.addEventListener("DOMContentLoaded", () => {
  const topicInput = document.getElementById("topicInput");
  const addTopicButton = document.getElementById("addTopic");
  const topicList = document.getElementById("topicList");

  function loadTopics() {
    chrome.storage.sync.get(["blockedTopics"], (data) => {
      topicList.innerHTML = "";
      const topics = data.blockedTopics || [];
      topics.forEach(addTopicToList);
    });
  }

  function addTopicToList(topic) {
    const li = document.createElement("li");
    li.textContent = topic;
    li.style.cursor = "pointer"; // Make it look clickable
    li.addEventListener("click", () => removeTopic(topic));
    topicList.appendChild(li);
  }

  function removeTopic(topic) {
    chrome.storage.sync.get(["blockedTopics"], (data) => {
      let topics = data.blockedTopics || [];
      topics = topics.filter((t) => t !== topic); // Remove the clicked topic
      chrome.storage.sync.set({ blockedTopics: topics }, loadTopics);
    });
  }

  addTopicButton.addEventListener("click", () => {
    const topic = topicInput.value.trim().toLowerCase();
    if (topic) {
      chrome.storage.sync.get(["blockedTopics"], (data) => {
        let topics = data.blockedTopics || [];
        if (!topics.includes(topic)) {
          topics.push(topic);
          chrome.storage.sync.set({ blockedTopics: topics }, () => {
            addTopicToList(topic);
            topicInput.value = "";
          });
        }
      });
    }
  });

  loadTopics();
});

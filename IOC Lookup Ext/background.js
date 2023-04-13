chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.create({
    id: "LookupIOC",
    title: "Lookup IOC",
    contexts: ["selection"],
  });
});

function executeContentScript(tabId) {
  chrome.scripting.executeScript(
    {
      target: { tabId: tabId },
      files: ["content.js"],
    },
    () => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        return;
      }
      chrome.tabs.sendMessage(tabId, { command: "LookupIOC" });
    }
  );
}

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (info.menuItemId === "LookupIOC") {
    chrome.tabs.sendMessage(tab.id, { command: "ping" }, (response) => {
      if (chrome.runtime.lastError) {
        executeContentScript(tab.id);
      } else {
        chrome.tabs.sendMessage(tab.id, { command: "LookupIOC" });
      }
    });
  }
});

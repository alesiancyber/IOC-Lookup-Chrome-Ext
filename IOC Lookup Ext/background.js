chrome.runtime.onInstalled.addListener(function () {
  try {
    chrome.contextMenus.create({
      id: "LookupIOC",
      title: "Lookup IOC",
      contexts: ["selection"],
    });
  } catch (e) {
    console.error("Error creating context menu:", e);
  }
});

function executeContentScript(tabId) {
  chrome.scripting.executeScript(
    {
      target: { tabId: tabId },
      files: ["content.js"],
    },
    () => {
      if (chrome.runtime.lastError) {
        console.error('Error:', chrome.runtime.lastError.message);
        return;
      }
      chrome.tabs.sendMessage(tabId, { command: "LookupIOC" });
    }
  );
}

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (info.menuItemId === "LookupIOC") {
    executeContentScript(tab.id);
  }
});

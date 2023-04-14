function getSelectedText() {
  return window.getSelection().toString();
}

function isPublicIP(ip) {
  const ipBlocks = ip.split('.').map(Number);
  return !(
    ipBlocks[0] === 10 ||
    (ipBlocks[0] === 172 && ipBlocks[1] >= 16 && ipBlocks[1] <= 31) ||
    (ipBlocks[0] === 192 && ipBlocks[1] === 168) ||
    ip === '127.0.0.1'
  );
}

function matchAndAppend() {
  const selectedText = getSelectedText();

  const regexes = [
    {
      type: "public_ip",
      regex: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    },
    {
      type: "domain",
      regex: /^https?:\/\/(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}$/,
    },
    {
      type: "sha256",
      regex: /\b[a-f0-9]{64}\b/i,
    },
    {
      type: "windows_event_id",
      regex: /^\d{4}$/,
    }
  ];

  for (const regexObj of regexes) {
    if (regexObj.regex.test(selectedText)) {
      if (regexObj.type === 'public_ip' && !isPublicIP(selectedText)) {
        continue;
      }

      let urls = [];

      if (regexObj.type === 'sha256') {
    urls.push("https://www.virustotal.com/gui/file/" + encodeURIComponent(selectedText));
  } else if (regexObj.type === 'domain') {
    const strippedDomain = selectedText.replace(/^https?:\/\//, '');
    urls.push("https://www.virustotal.com/gui/search/" + encodeURIComponent(strippedDomain));
    urls.push("https://www.whois.com/whois/" + encodeURIComponent(strippedDomain));
  } else if (regexObj.type === 'public_ip') {
    urls.push("https://www.virustotal.com/gui/search/" + encodeURIComponent(selectedText));
    urls.push("https://www.abuseipdb.com/check/" + encodeURIComponent(selectedText));
  } else if (regexObj.type === 'windows_event_id') {
    urls.push("https://www.ultimatewindowssecurity.com/securitylog/encyclopedia/event.aspx?eventid=" + encodeURIComponent(selectedText));
  }

      urls.forEach(url => {
        const newTab = window.open(url, '_blank');
        newTab.blur();
        window.focus();
      });

      break;
    }
  }
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.command === "LookupIOC") {
    matchAndAppend();
  }
});

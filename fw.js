document.addEventListener('DOMContentLoaded', () => {
  // Function to extract the top-level domain from a URL
  function getTopLevelDomain(url) {
    const urlObj = new URL(url);
    return urlObj.hostname;
  }

  // Get the current active tab's URL and set it in the input field
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      const currentTabUrl = tabs[0].url;
      const topLevelDomain = getTopLevelDomain(currentTabUrl);
      document.getElementById('url-input').value = topLevelDomain;
    }
  });

  document.getElementById('add-url').addEventListener('click', () => {
    const urlInput = document.getElementById('url-input');
    const url = urlInput.value.trim();
    
    if (url) {
      chrome.storage.sync.get('blockedUrls', (data) => {
        const blockedUrls = data.blockedUrls || [];
        blockedUrls.push(url);
        chrome.storage.sync.set({ blockedUrls }, () => {
          updateBlockingRules(blockedUrls);
          updateBadge(blockedUrls.length);
          urlInput.value = ''; // Clear the input field
          displayBlockedUrls(blockedUrls); // Update the displayed list
          highlightNewUrl(url); // Highlight the newly added URL
        });
      });
    }
  });

  function updateBlockingRules(blockedUrls) {
    const rules = blockedUrls.map((url, index) => ({
      id: index + 1,
      priority: 1,
      action: { type: 'redirect', redirect: { url: `https://supernines.com/urlblock/blockedurl.html?${encodeURIComponent(url)}` } },
      condition: { urlFilter: url, resourceTypes: ['main_frame'] }
    }));

    // Remove all existing rules and add the new ones
    chrome.declarativeNetRequest.getDynamicRules((existingRules) => {
      const existingRuleIds = existingRules.map(rule => rule.id);
      chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: existingRuleIds,
        addRules: rules
      });
    });
  }


  function displayBlockedUrls(blockedUrls) {
    const urlList = document.getElementById('url-list');
    urlList.classList.add('uk-list', 'another'); // Add class dynamically
    urlList.innerHTML = ''; // Clear the list
    blockedUrls.forEach((url, index) => {
      const containerDiv = document.createElement('div');
      containerDiv.id = `url-${index}`; // Assign a unique ID to each URL element
      containerDiv.classList.add('blocked-url', 'uk-grid', 'uk-grid-collapse'); // Add a class for styling
  
      const urlDiv = document.createElement('div');
      urlDiv.textContent = url;
      urlDiv.classList.add('url-text', 'uk-width-2-3'); // Add a class for styling
  
      const removeButtonDiv = document.createElement('div');
      removeButtonDiv.classList.add('uk-align-right'); // Add a class for styling
  
      const removeButton = document.createElement('button');
      removeButton.textContent = 'Remove';
      removeButton.classList.add('remove-button'); // Add a class for styling
      removeButton.addEventListener('click', () => {
        blockedUrls.splice(index, 1);
        chrome.storage.sync.set({ blockedUrls }, () => {
          updateBlockingRules(blockedUrls);
          updateBadge(blockedUrls.length);
          displayBlockedUrls(blockedUrls); // Update the displayed list
        });
      });
  
      removeButtonDiv.appendChild(removeButton);
      containerDiv.appendChild(urlDiv);
      containerDiv.appendChild(removeButtonDiv);
      urlList.appendChild(containerDiv);
    });
  }

  function highlightNewUrl(url) {
    const urlList = document.getElementById('url-list');
    const items = urlList.getElementsByClassName('blocked-url');
    for (let item of items) {
      if (item.querySelector('.url-text').textContent === url) {
        item.classList.add('highlight');
        setTimeout(() => {
          item.classList.remove('highlight');
        }, 2000); // Change this duration to match the CSS transition duration
        break;
      }
    }
  }

  function updateBadge(count) {
    chrome.action.setBadgeText({ text: count.toString() });
    chrome.action.setBadgeBackgroundColor({ color: '#e43c12' }); // Change this to your desired badge color
  }

  // Load and display the blocked URLs when the popup is opened
  chrome.storage.sync.get('blockedUrls', (data) => {
    const blockedUrls = data.blockedUrls || [];
    displayBlockedUrls(blockedUrls);
    updateBadge(blockedUrls.length);
  });
});
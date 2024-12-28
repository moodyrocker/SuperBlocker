chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.get('blockedUrls', (data) => {
      const blockedUrls = data.blockedUrls || [];
      updateBlockingRules(blockedUrls);
      updateBadge(blockedUrls.length);
    });
  });
  
  chrome.runtime.onStartup.addListener(() => {
    chrome.storage.sync.get('blockedUrls', (data) => {
      const blockedUrls = data.blockedUrls || [];
      updateBlockingRules(blockedUrls);
      updateBadge(blockedUrls.length);
    });
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
  
  function updateBadge(count) {
    chrome.action.setBadgeText({ text: count.toString() });
    chrome.action.setBadgeBackgroundColor({ color: '#e43c12' }); // Change this to your desired badge color
  }
// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
    console.log('Meet Assistant extension installed');
  });
  
  // Listen for navigation to Google Meet pages
  chrome.webNavigation.onCompleted.addListener((details) => {
    // Check if this is a Google Meet page
    if (details.url.includes('meet.google.com')) {
      // Inject the content script if needed
      console.log('Navigated to Google Meet page: ' + details.url);
    }
  });
  
  // Handle messages from content script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'log') {
      console.log('From content script:', message.content);
    }
    
    return true;
  });
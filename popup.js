function updateUI(active) {
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    const toggleBtn = document.getElementById('toggleBtn');
    
    if (active) {
      statusDot.classList.remove('inactive');
      statusDot.classList.add('active');
      statusText.textContent = 'Active on Meet';
      toggleBtn.textContent = 'Hide Assistant';
    } else {
      statusDot.classList.remove('active');
      statusDot.classList.add('inactive');
      statusText.textContent = 'Not active';
      toggleBtn.textContent = 'Show Assistant';
    }
  }
  
  // Check if we're on a Google Meet page
  async function checkActiveMeet() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];
    
    if (currentTab && currentTab.url && currentTab.url.includes('meet.google.com')) {
      return true;
    }
    return false;
  }
  
  // Load saved settings
  function loadSettings() {
    chrome.storage.local.get(['backendUrl'], (result) => {
      if (result.backendUrl) {
        document.getElementById('backendUrl').value = result.backendUrl;
      }
    });
  }
  
  // Save settings
  function saveSettings() {
    const backendUrl = document.getElementById('backendUrl').value;
    chrome.storage.local.set({ backendUrl });
  }
  
  // Initialize popup
  async function initPopup() {
    const isMeetTab = await checkActiveMeet();
    
    if (isMeetTab) {
      // Check if the assistant is currently shown
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'getStatus' }, (response) => {
          if (response && response.visible) {
            updateUI(true);
          } else {
            updateUI(false);
          }
        });
      });
      
      // Set up toggle button
      document.getElementById('toggleBtn').addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleAssistant' }, (response) => {
            if (response) {
              updateUI(response.visible);
            }
          });
        });
      });
    } else {
      document.getElementById('statusText').textContent = 'Not on Google Meet';
      document.getElementById('toggleBtn').disabled = true;
    }
    
    // Load settings
    loadSettings();
    
    // Set up settings save
    document.getElementById('backendUrl').addEventListener('change', saveSettings);
  }
  
  // Initialize when popup is loaded
  document.addEventListener('DOMContentLoaded', initPopup);
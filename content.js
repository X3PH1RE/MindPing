let recognition = null;
let isRecording = false;
let assistantContainer = null;
let messagesList = null;
let assistantInput = null;
let transcript = '';
let backendUrl = 'http://localhost:5000';

// Initialize the extension
function init() {
  console.log('Meet Assistant initialized');
  createAssistantUI();
  setupSpeechRecognition();
}

// Create the assistant UI overlay
function createAssistantUI() {
  // Create main container
  assistantContainer = document.createElement('div');
  assistantContainer.className = 'meet-assistant-container';
  
  // Create header
  const header = document.createElement('div');
  header.className = 'meet-assistant-header';
  
  const title = document.createElement('div');
  title.textContent = 'MindPing';
  title.className = 'meet-assistant-title';
  
  const controls = document.createElement('div');
  controls.className = 'meet-assistant-controls';
  
  const minimizeBtn = document.createElement('button');
  minimizeBtn.textContent = '_';
  minimizeBtn.className = 'meet-assistant-btn';
  minimizeBtn.addEventListener('click', toggleMinimize);
  
  const recordBtn = document.createElement('button');
  recordBtn.textContent = '🎤';
  recordBtn.className = 'meet-assistant-btn';
  recordBtn.id = 'recordBtn';
  recordBtn.addEventListener('click', toggleRecording);
  
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.className = 'meet-assistant-btn';
  closeBtn.addEventListener('click', () => {
    assistantContainer.style.display = 'none';
  });
  
  controls.appendChild(minimizeBtn);
  controls.appendChild(recordBtn);
  controls.appendChild(closeBtn);
  
  header.appendChild(title);
  header.appendChild(controls);
  
  // Create messages area
  messagesList = document.createElement('div');
  messagesList.className = 'meet-assistant-messages';
  
  // Create input area
  const inputArea = document.createElement('div');
  inputArea.className = 'meet-assistant-input-area';
  
  assistantInput = document.createElement('input');
  assistantInput.type = 'text';
  assistantInput.placeholder = 'Ask the assistant...';
  assistantInput.className = 'meet-assistant-input';
  
  const sendBtn = document.createElement('button');
  sendBtn.textContent = '→';
  sendBtn.className = 'meet-assistant-send-btn';
  sendBtn.addEventListener('click', sendUserMessage);
  
  assistantInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendUserMessage();
    }
  });
  
  inputArea.appendChild(assistantInput);
  inputArea.appendChild(sendBtn);
  
  // Assemble the UI
  assistantContainer.appendChild(header);
  assistantContainer.appendChild(messagesList);
  assistantContainer.appendChild(inputArea);
  
  // Add to page
  document.body.appendChild(assistantContainer);
  
  // Add welcome message
  addMessage('MindPing', 'Hello! I\'m your meeting assistant. I\'ll listen to your meeting and provide helpful insights. Click the microphone button to start.', 'assistant');
}

// Toggle minimized state
function toggleMinimize() {
  assistantContainer.classList.toggle('minimized');
}

// Set up Web Speech API for speech recognition
function setupSpeechRecognition() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    addMessage('MindPing', 'Speech recognition is not supported in your browser.', 'assistant');
    return;
  }
  
  // Create speech recognition instance
  recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';
  
  // Set up recognition handlers
  recognition.onstart = function() {
    if (!isRecording) {
      isRecording = true;
      document.getElementById('recordBtn').classList.add('recording');
      addMessage('MindPing', 'Listening to the meeting...', 'assistant');
    }
  };
  
  recognition.onend = function() {
    if (isRecording) {
      // Restart if we're still supposed to be recording
      recognition.start();
    } else {
      document.getElementById('recordBtn').classList.remove('recording');
      addMessage('MindPing', 'Stopped listening.', 'assistant');
    }
  };
  
  recognition.onresult = function(event) {
    let interimTranscript = '';
    let finalTranscript = '';
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }
    
    if (finalTranscript) {
      transcript += ' ' + finalTranscript;
      sendTranscriptToBackend(finalTranscript);
    }
  };
  
  recognition.onerror = function(event) {
    console.error('Speech recognition error:', event.error);
    if (event.error === 'not-allowed') {
      addMessage('MindPing', 'Microphone access denied. Please check permissions.', 'assistant');
      isRecording = false;
      document.getElementById('recordBtn').classList.remove('recording');
    }
  };
}

// Toggle recording state
function toggleRecording() {
  if (!recognition) {
    setupSpeechRecognition();
  }
  
  if (isRecording) {
    isRecording = false;
    recognition.stop();
  } else {
    transcript = '';
    recognition.start();
  }
}

// Send transcript to backend
function sendTranscriptToBackend(text) {
  console.log('Sending to backend:', text);
  
  fetch(`${backendUrl}/process_transcript`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      transcript: text
    }),
  })
  .then(response => response.json())
  .then(data => {
    if (data.response) {
      addMessage('MindPing', data.response, 'assistant');
    }
  })
  .catch(error => {
    console.error('Error sending transcript to backend:', error);
  });
}

// Send manual user message
function sendUserMessage() {
  const message = assistantInput.value.trim();
  if (!message) return;

  
  
  addMessage('You', message, 'user');
  assistantInput.value = '';

  chrome.runtime.sendMessage({
    action: "textPrompt",
    content: message
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Runtime error:', chrome.runtime.lastError);
      addMessage('MindPing', 'Communication error. Try again.', 'assistant');
      return;
    }
  
    if (response && response.response) {
      addMessage('MindPing', response.response, 'assistant');
    } else {
      console.error('Invalid response from background:', response);
      addMessage('MindPing', 'Error processing your request.', 'assistant');
    }
  });

  // handleTextRequest(message).then(response => {
  //   addMessage('MindPing', response, 'assistant');
  // });
  
  // fetch(`${backendUrl}/ask`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     message: message,
  //     transcript: transcript
  //   }),
  // })
  // .then(response => response.json())
  // .then(data => {
  //   if (data.response) {
  //     addMessage('MindPing', data.response, 'assistant');
  //   }
  // })
  // .catch(error => {
  //   console.error('Error sending message to backend:', error);
  //   addMessage('MindPing', 'Sorry, there was an error communicating with the server.', 'assistant');
  // });
}

// Add a message to the UI
function addMessage(sender, text, type) {
  const messageItem = document.createElement('div');
  messageItem.className = `meet-assistant-message ${type}`;
  
  const senderEl = document.createElement('div');
  senderEl.className = 'meet-assistant-message-sender';
  senderEl.textContent = sender;
  
  const textEl = document.createElement('div');
  textEl.className = 'meet-assistant-message-text';
  textEl.textContent = text;
  
  messageItem.appendChild(senderEl);
  messageItem.appendChild(textEl);
  messagesList.appendChild(messageItem);
  
  // Auto-scroll
  messagesList.scrollTop = messagesList.scrollHeight;
}

window.addEventListener('load', () => {
  setTimeout(init, 2000);
});
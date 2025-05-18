# MindPing

A real-time AI assistant for Google Meet that provides live transcription, meeting insights, and intelligent Q&A during your video calls.


### Installation (Development)
1. Clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the folder containing the extension files

## Usage

1. **Start/Join a Google Meet call**
2. **Click the Meet Assistant extension icon** in your Chrome toolbar
3. **Toggle the assistant** with the "Show Assistant" button
4. **Interact with the assistant**:
   - Click the microphone icon to start/stop transcription
   - Type questions in the chat input
   - Minimize the assistant when not needed

## Configuration

You can configure the backend API endpoint:

1. Click the extension icon
2. In the popup, edit the "Backend URL" field
3. The default is `http://localhost:5000` (for local development)

## File Structure
/src/  
├── content.js - Main content script that runs on Google Meet  
├── popup.js - Popup window logic  
├── background.js - Background service worker  
├── styles.css - Styling for the assistant UI  
├── popup.html - Popup window HTML  
├── overlay.html - Assistant overlay HTML  
├── manifest.json - Extension configuration  

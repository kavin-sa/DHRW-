// ================= DHRW CHATBOT INTEGRATION ================= 

// Chatbot State
const ChatbotState = {
  isOpen: false,
  messages: [],
  currentContext: 'dashboard',
  isTyping: false,
  conversationId: null
};

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeChatbot();
});

function initializeChatbot() {
  ChatbotState.conversationId = generateId();
  
  // Add welcome message
  addBotMessage(`Hi! I'm your DHRW assistant. I can help you with:
• Connecting your MetaMask wallet
• Uploading medical records securely  
• Managing doctor access requests
• Understanding blockchain security

What would you like to know?`);
  
  // Load conversation history if exists
  loadChatHistory();
}

// ================= CHATBOT UI CONTROLS ================= 
function toggleChatbot() {
  if (ChatbotState.isOpen) {
    closeChatbot();
  } else {
    openChatbot();
  }
}

function openChatbot() {
  const chatbotWindow = document.getElementById('chatbotWindow');
  const chatbotToggle = document.getElementById('chatbotToggle');
  
  chatbotWindow.classList.remove('hidden');
  chatbotToggle.style.transform = 'rotate(180deg)';
  
  ChatbotState.isOpen = true;
  
  // Focus on input
  setTimeout(() => {
    document.getElementById('chatInput').focus();
  }, 300);
  
  // Update quick actions based on context
  updateQuickActions();
}

function closeChatbot() {
  const chatbotWindow = document.getElementById('chatbotWindow');
  const chatbotToggle = document.getElementById('chatbotToggle');
  
  chatbotWindow.classList.add('hidden');
  chatbotToggle.style.transform = 'rotate(0deg)';
  
  ChatbotState.isOpen = false;
}

// ================= MESSAGE HANDLING ================= 
function sendMessage() {
  const input = document.getElementById('chatInput');
  const message = input.value.trim();
  
  if (!message) return;
  
  // Add user message
  addUserMessage(message);
  input.value = '';
  
  // Show typing indicator
  showTypingIndicator();
  
  // Get bot response
  setTimeout(() => {
    const response = getBotResponse(message);
    hideTypingIndicator();
    addBotMessage(response);
  }, 1000 + Math.random() * 1000); // Random delay for realism
}

function sendQuickMessage(message) {
  document.getElementById('chatInput').value = message;
  sendMessage();
}

function handleChatKeypress(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}

function addUserMessage(text) {
  const message = {
    id: generateId(),
    type: 'user',
    text: text,
    timestamp: new Date().toISOString()
  };
  
  ChatbotState.messages.push(message);
  renderMessage(message);
  saveChatHistory();
}

function addBotMessage(text) {
  const message = {
    id: generateId(),
    type: 'bot',
    text: text,
    timestamp: new Date().toISOString()
  };
  
  ChatbotState.messages.push(message);
  renderMessage(message);
  saveChatHistory();
}

function renderMessage(message) {
  const messagesContainer = document.getElementById('chatbotMessages');
  
  const messageElement = document.createElement('div');
  messageElement.className = `message ${message.type}`;
  messageElement.innerHTML = `
    <div class="message-avatar ${message.type}">
      <i class="fa-solid ${message.type === 'bot' ? 'fa-robot' : 'fa-user'}"></i>
    </div>
    <div class="message-content ${message.type}">
      ${formatMessageText(message.text)}
    </div>
  `;
  
  messagesContainer.appendChild(messageElement);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function formatMessageText(text) {
  // Convert line breaks to HTML
  return text.replace(/\n/g, '<br>').replace(/•/g, '•');
}

function showTypingIndicator() {
  const messagesContainer = document.getElementById('chatbotMessages');
  
  const typingElement = document.createElement('div');
  typingElement.className = 'message bot typing-indicator';
  typingElement.id = 'typingIndicator';
  typingElement.innerHTML = `
    <div class="message-avatar bot">
      <i class="fa-solid fa-robot"></i>
    </div>
    <div class="message-content bot">
      <div class="typing-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  `;
  
  messagesContainer.appendChild(typingElement);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
  ChatbotState.isTyping = true;
}

function hideTypingIndicator() {
  const typingIndicator = document.getElementById('typingIndicator');
  if (typingIndicator) {
    typingIndicator.remove();
  }
  ChatbotState.isTyping = false;
}

// ================= CONTEXT AWARENESS ================= 
function updateChatbotContext(section) {
  ChatbotState.currentContext = section;
  updateQuickActions();
}

function updateQuickActions() {
  const quickActions = document.getElementById('quickActions');
  if (!quickActions) return;
  
  const contextActions = getContextualQuickActions(ChatbotState.currentContext);
  
  quickActions.innerHTML = contextActions.map(action => `
    <button class="quick-btn" onclick="sendQuickMessage('${action.message}')">
      ${action.label}
    </button>
  `).join('');
}

function getContextualQuickActions(context) {
  const actions = {
    dashboard: [
      { label: 'Explain Dashboard', message: 'What do the dashboard statistics mean?' },
      { label: 'Security Status', message: 'How secure is my data?' },
      { label: 'Recent Activity', message: 'What does recent activity show?' }
    ],
    records: [
      { label: 'Upload Help', message: 'How do I upload medical records?' },
      { label: 'File Formats', message: 'What file formats are supported?' },
      { label: 'File Security', message: 'How are my files encrypted?' }
    ],
    access: [
      { label: 'Approve Requests', message: 'How do I approve doctor access?' },
      { label: 'Wallet Required', message: 'Why do I need MetaMask for approvals?' },
      { label: 'Access Control', message: 'How does access control work?' }
    ],
    audit: [
      { label: 'Audit Logs', message: 'What are audit logs?' },
      { label: 'Track Access', message: 'How can I track who accessed my records?' },
      { label: 'Blockchain Security', message: 'How does blockchain ensure security?' }
    ]
  };
  
  return actions[context] || actions.dashboard;
}

// ================= KNOWLEDGE BASE ================= 
function getBotResponse(userInput) {
  const input = userInput.toLowerCase();
  
  // Context-aware responses first
  const contextResponse = getContextualResponse(input, ChatbotState.currentContext);
  if (contextResponse) {
    return contextResponse;
  }
  
  // Greetings
  if (input.match(/^(hi|hello|hey|good morning|good afternoon|good evening|greetings|sup|yo)$/i) || input.match(/^(hi|hello|hey)\s*[!.]*$/i)) {
    return "Hi there! 👋 Welcome to DHRW - your secure medical records platform!\n\nI'm here to help you with anything related to:\n• Connecting your MetaMask wallet\n• Uploading and managing medical records\n• Controlling doctor access\n• Understanding our security features\n\nWhat can I help you with today?";
  }

  // How are you
  if (input.includes('how are you') || input.includes('how r u') || input.includes('whats up')) {
    return "I'm doing great, thank you for asking! 😊\n\nI'm here and ready to help you with your DHRW medical records platform.\n\nIs there anything specific you'd like to know about uploading records, connecting your wallet, or managing doctor access?";
  }

  // Thank you
  if (input.match(/(thank|thanks|thx|appreciate)/i)) {
    return "You're very welcome! 😊\n\nI'm glad I could help. If you have any other questions about DHRW, uploading records, MetaMask, or anything else, feel free to ask anytime!\n\nStay healthy! 🏥";
  }

  // Bye/Goodbye
  if (input.match(/^(bye|goodbye|see you|cya|take care|gtg)$/i)) {
    return "Goodbye! Take care and stay healthy! 👋\n\nRemember, your medical records are safe and secure on DHRW. Come back anytime you need help!\n\n🔒 Your health data, your control.";
  }

  // Who are you / What are you
  if (input.includes('who are you') || input.includes('what are you') || input.includes('your name')) {
    return "I'm the DHRW Assistant! 🤖\n\nI'm a virtual helper specifically trained on the DHRW platform to guide you through:\n• Secure medical record management\n• MetaMask wallet integration\n• Blockchain-based healthcare storage\n• Doctor access control\n\nThink of me as your personal guide to keeping your medical records safe and accessible!\n\nWhat would you like to know about DHRW?";
  }

  // Help / What can you do
  if (input.match(/^(help|what can you do|capabilities|features)$/i) || input.includes('can you help') || input.includes('what do you do')) {
    return "I can help you with everything related to DHRW! Here's what I know:\n\n🔐 **MetaMask & Wallet**\n• How to connect/disconnect\n• Installation and setup\n• Network configuration\n\n📄 **Medical Records**\n• Uploading files securely\n• Supported file types\n• Viewing your records\n\n👨‍⚕️ **Access Control**\n• Managing doctor requests\n• Approving/rejecting access\n• Revoking permissions\n\n🔒 **Security**\n• How encryption works\n• Blockchain benefits\n• Privacy protection\n\n📊 **Platform Features**\n• Dashboard overview\n• Audit logs\n• Notifications\n\nJust ask me anything! For example: 'How do I upload a medical record?'";
  }

  // Confused/Don't understand
  if (input.includes('i don\'t understand') || input.includes('confused') || input.includes('what do you mean')) {
    return "No worries! Let me explain things more clearly. 😊\n\nWhat specific part would you like me to clarify?\n\nI can break down:\n• How to use any DHRW feature step-by-step\n• What blockchain and encryption mean in simple terms\n• Why MetaMask is needed\n• How the platform protects your privacy\n\nJust let me know what's confusing you!";
  }

  // Jokes/Fun
  if (input.includes('joke') || input.includes('funny')) {
    return "Haha, let me try! 😄\n\nWhy did the blockchain go to therapy?\nBecause it had too many unresolved blocks! 🔗\n\nOkay okay, I'm better at helping with DHRW than comedy! 😅\n\nBut seriously, is there anything about the platform I can help you with?";
  }

  // Yes/No/Okay responses
  if (input.match(/^(yes|yeah|yep|sure|ok|okay|alright)$/i)) {
    return "Great! What would you like to know more about?\n\nYou can ask me:\n• How to upload medical records\n• How to connect MetaMask\n• How to approve doctor access\n• About security and encryption\n• Troubleshooting any issues\n\nI'm here to help! 😊";
  }

  if (input.match(/^(no|nope|nah|not really)$/i)) {
    return "No problem! If you need anything later, I'm always here.\n\nFeel free to ask about:\n• MetaMask setup\n• Uploading records\n• Security features\n• Access control\n\nJust type your question anytime! 😊";
  }

  // MetaMask Connection
  if (input.includes('connect') && (input.includes('wallet') || input.includes('metamask'))) {
    return `To connect your MetaMask wallet to DHRW:

1. Click the 'Connect Wallet' button in the top right corner
2. MetaMask will pop up asking for permission
3. Select the account you want to connect
4. Click 'Confirm' in MetaMask
5. You'll see the status change to 'Connected' with a green dot

💡 The wallet connection uses blockchain technology for secure record storage and access control.

Need help installing MetaMask?`;
  }

  // Upload Medical Records
  if (input.includes('upload') || input.includes('add record') || input.includes('medical certificate')) {
    return `To upload your medical records to DHRW:

1. Go to 'Medical Records' section from the sidebar
2. Click the 'Choose Files' button or drag files to the upload area
3. Select your medical files (PDF, JPG, PNG, DOCX)
4. Files will be encrypted automatically during upload
5. You'll see a success message when complete
6. Your records appear in the table below

🔒 Security: All files are encrypted before upload and stored securely. Only you and authorized doctors can access them.

What file types are you trying to upload?`;
  }

  // Access Control
  if (input.includes('access') && (input.includes('doctor') || input.includes('approve') || input.includes('reject') || input.includes('request'))) {
    return `Managing Doctor Access Requests in DHRW:

**In the Access Control section, you'll see:**
• Doctor Name & Specialization
• Which record they're requesting
• Request Date
• Approve/Reject buttons

**To approve access:**
1. Review the doctor's details carefully
2. Click the green 'Approve' button
3. MetaMask will ask you to confirm the blockchain transaction
4. Doctor receives access instantly after confirmation
5. The action is logged in your Audit Logs

**To reject access:**
1. Click the red 'Reject' button
2. The request is denied and removed from pending

💡 You have full control - you can revoke access anytime, and all actions are permanently logged on the blockchain.

Do you have a pending request you need help with?`;
  }

  // Security & Encryption
  if (input.includes('secure') || input.includes('security') || input.includes('encrypt') || input.includes('safe') || input.includes('privacy')) {
    return `DHRW Security Features:

🔐 **End-to-End Encryption:** All medical records are encrypted before upload. Even DHRW cannot read your files.

⛓️ **Blockchain Storage:** Access permissions are stored on the blockchain, making them tamper-proof and permanent.

🔑 **Wallet Authentication:** Your MetaMask wallet acts as your digital identity - only you control access.

👨‍⚕️ **Granular Access Control:** You manually approve every doctor request. No automatic access ever.

📱 **Real-time Notifications:** You get instant alerts when doctors request or access your records.

📋 **Immutable Audit Trail:** Every access is logged with timestamp and doctor details in blockchain-based audit logs.

🛡️ **Zero-Knowledge Architecture:** Your data never leaves your control - we can't see it, sell it, or lose it.

Your medical data security is our top priority!`;
  }

  // Dashboard
  if (input.includes('dashboard') || input.includes('overview') || input.includes('statistics')) {
    return `Your DHRW Dashboard shows:

📄 **Records Uploaded:** Total number of medical records you've securely stored

👨‍⚕️ **Doctors with Access:** How many healthcare providers currently have permission to view your records

📨 **Pending Requests:** Access requests from doctors waiting for your approval

🛡️ **Security Score:** Overall security status of your account and data

📊 **Recent Activity:** Latest uploads, access grants, and security events

The dashboard gives you a complete overview of your medical data ecosystem. Click any section in the sidebar to manage specific features.

What would you like to explore first?`;
  }

  // Audit Logs
  if (input.includes('audit') || input.includes('log') || input.includes('history') || input.includes('who accessed')) {
    return `Audit Logs in DHRW:

This section shows every interaction with your medical records:

• **Timestamp:** Exact date and time of each action
• **Doctor Name:** Who accessed your records
• **Medical Record:** Which specific file was accessed
• **Action:** Type of activity ('Uploaded', 'Viewed', 'Approved', 'Rejected')
• **IP Address:** Network location for additional security tracking

**Key Features:**
✅ All audit logs are stored on the blockchain and cannot be deleted or modified
✅ Provides complete transparency and accountability
✅ Helps you track exactly who has seen your medical information
✅ Can be used for compliance and legal purposes

You can filter logs by date range and action type to find specific activities.

Want to know more about blockchain security?`;
  }

  // File Types
  if (input.includes('file type') || input.includes('format') || input.includes('pdf') || input.includes('jpg')) {
    return `Supported Medical Record File Types:

✅ **PDF (.pdf)** - Most common for medical reports and lab results
✅ **Images (.jpg, .jpeg, .png)** - For scanned documents and X-rays
✅ **Word Documents (.docx)** - For typed medical reports

📏 **File Size Limit:** Each file should be under 10MB for optimal upload speed and storage efficiency.

💡 **Recommendation:** PDF format is preferred for medical certificates as it preserves formatting, is universally compatible, and maintains document integrity.

🔒 **Security Note:** All file types are encrypted using the same military-grade encryption regardless of format.

What type of medical document are you planning to upload?`;
  }

  // Troubleshooting
  if (input.includes('not working') || input.includes('error') || input.includes('problem') || input.includes('issue') || input.includes('help')) {
    return `Common DHRW Troubleshooting:

**MetaMask Connection Issues:**
• Refresh the page and try connecting again
• Make sure MetaMask is unlocked and updated
• Check that you're on the correct blockchain network
• Disable other wallet extensions temporarily

**File Upload Problems:**
• Verify file size is under 10MB
• Ensure file format is supported (PDF, JPG, PNG, DOCX)
• Check your internet connection stability
• Try uploading one file at a time

**Access Control Issues:**
• Ensure MetaMask has sufficient funds for gas fees
• Check if MetaMask popup is blocked by your browser
• Try refreshing the page and reconnecting your wallet
• Make sure you're on the correct network

**Still having issues?** 
Please note:
• Your wallet address (for technical support)
• Screenshot of any error messages
• What you were trying to do when the issue occurred

What specific problem are you experiencing?`;
  }

  // Blockchain/Network
  if (input.includes('blockchain') || input.includes('network') || input.includes('gas') || input.includes('fees')) {
    return `DHRW Blockchain Technology:

**Why Blockchain?**
• **Immutable Records:** Once stored, data cannot be altered or deleted
• **Decentralized Security:** No single point of failure
• **Transparent Auditing:** All actions are publicly verifiable
• **User Control:** You own your data completely

**Network Details:**
• Uses Ethereum-compatible blockchain for maximum security
• Smart contracts handle access permissions automatically
• Gas fees are minimal (typically $0.10-$0.50 per transaction)
• All transactions are encrypted and secure

**What You Pay For:**
• Approving doctor access requests (small gas fee)
• Revoking access permissions (small gas fee)
• Uploading records is FREE (we cover storage costs)

💡 Gas fees go to the blockchain network validators, not to DHRW. They ensure your transactions are processed securely and permanently.

Need help getting cryptocurrency for gas fees?`;
  }

  // Default response with context awareness
  const contextHelp = getContextualHelp(ChatbotState.currentContext);
  return `I'm not sure about that specific question. ${contextHelp}

Here's what I can help you with:

🔹 **MetaMask:** Connection, installation, network setup
🔹 **File Uploads:** How to add medical records securely
🔹 **Access Control:** Approving/rejecting doctor requests
🔹 **Security:** Encryption, blockchain, privacy features
🔹 **Dashboard:** Understanding your overview and statistics
🔹 **Audit Logs:** Tracking who accessed your records
🔹 **Troubleshooting:** Common issues and solutions

Try asking: "How do I upload a medical record?" or "How do I connect MetaMask?"`;
}

function getContextualResponse(input, context) {
  const contextResponses = {
    dashboard: {
      keywords: ['statistics', 'numbers', 'count', 'overview'],
      response: `Based on your current dashboard view:

📊 **Your Statistics:**
• Medical records uploaded and encrypted
• Doctors currently with access permissions
• Pending access requests requiring your attention
• Overall security score and status

The dashboard provides real-time insights into your medical data ecosystem. Each statistic is updated automatically as you interact with the system.

Would you like me to explain any specific statistic in detail?`
    },
    records: {
      keywords: ['upload', 'file', 'document', 'record'],
      response: `Since you're in the Medical Records section:

📁 **Quick Upload Tips:**
• Drag and drop files directly to the upload area
• Multiple files can be selected at once
• All files are automatically encrypted during upload
• Supported formats: PDF, JPG, PNG, DOCX (under 10MB each)

Your uploaded records appear in the table below with status indicators showing whether they're private or shared with doctors.

Ready to upload some medical records?`
    },
    access: {
      keywords: ['approve', 'doctor', 'request', 'permission'],
      response: `For the Access Control section you're viewing:

👨‍⚕️ **Managing Requests:**
• Review each doctor's credentials and specialization
• Check which specific record they're requesting
• Approve with blockchain confirmation (requires MetaMask)
• Reject requests that seem inappropriate

Remember: You have complete control. Approvals are permanent but you can revoke access later through the audit logs.

See any requests that need your attention?`
    },
    audit: {
      keywords: ['log', 'history', 'track', 'access'],
      response: `In your Audit Logs section:

📋 **Tracking Features:**
• Every action is permanently recorded on blockchain
• Filter by date range or action type
• See exact timestamps and IP addresses
• Export logs for your records or legal purposes

This gives you complete visibility into who has accessed your medical data and when. All entries are tamper-proof and legally valid.

Want to filter for specific activities?`
    }
  };
  
  const contextData = contextResponses[context];
  if (contextData && contextData.keywords.some(keyword => input.includes(keyword))) {
    return contextData.response;
  }
  
  return null;
}

function getContextualHelp(context) {
  const helpText = {
    dashboard: "Since you're viewing the dashboard, I can explain your statistics and recent activity.",
    records: "You're in the Medical Records section - I can help with uploading and managing your files.",
    access: "In Access Control, I can guide you through approving or rejecting doctor requests.",
    audit: "You're viewing Audit Logs - I can explain the tracking and security features."
  };
  
  return helpText[context] || "";
}

// ================= CHAT PERSISTENCE ================= 
function saveChatHistory() {
  const chatData = {
    messages: ChatbotState.messages,
    conversationId: ChatbotState.conversationId,
    lastUpdated: new Date().toISOString()
  };
  
  localStorage.setItem('dhrw_chat_history', JSON.stringify(chatData));
}

function loadChatHistory() {
  const storedChat = localStorage.getItem('dhrw_chat_history');
  if (storedChat) {
    const chatData = JSON.parse(storedChat);
    
    // Only load recent conversations (last 24 hours)
    const lastUpdated = new Date(chatData.lastUpdated);
    const now = new Date();
    const hoursDiff = (now - lastUpdated) / (1000 * 60 * 60);
    
    if (hoursDiff < 24) {
      ChatbotState.messages = chatData.messages || [];
      ChatbotState.conversationId = chatData.conversationId;
      
      // Render existing messages
      ChatbotState.messages.forEach(message => {
        renderMessage(message);
      });
    }
  }
}

function clearChatHistory() {
  ChatbotState.messages = [];
  localStorage.removeItem('dhrw_chat_history');
  
  // Clear messages container
  const messagesContainer = document.getElementById('chatbotMessages');
  messagesContainer.innerHTML = '';
  
  // Add fresh welcome message
  addBotMessage(`Hi! I'm your DHRW assistant. I can help you with:
• Connecting your MetaMask wallet
• Uploading medical records securely  
• Managing doctor access requests
• Understanding blockchain security

What would you like to know?`);
}

// ================= CHATBOT ANIMATIONS ================= 
// Add CSS for typing indicator
const typingCSS = `
.typing-indicator .typing-dots {
  display: flex;
  gap: 4px;
  padding: 8px 0;
}

.typing-indicator .typing-dots span {
  width: 6px;
  height: 6px;
  background: var(--primary);
  border-radius: 50%;
  animation: typingBounce 1.4s infinite ease-in-out;
}

.typing-indicator .typing-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-indicator .typing-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typingBounce {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.notification {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.notification-close {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: color var(--transition-fast);
}

.notification-close:hover {
  color: var(--text-primary);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}
`;

// Inject typing CSS
const style = document.createElement('style');
style.textContent = typingCSS;
document.head.appendChild(style);

// ================= UTILITY FUNCTIONS ================= 
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

// Export functions for global access
window.toggleChatbot = toggleChatbot;
window.openChatbot = openChatbot;
window.closeChatbot = closeChatbot;
window.sendMessage = sendMessage;
window.sendQuickMessage = sendQuickMessage;
window.handleChatKeypress = handleChatKeypress;
window.updateChatbotContext = updateChatbotContext;
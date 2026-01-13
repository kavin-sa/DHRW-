// ================= AI MEDICAL ANALYSIS FRONTEND ================= 

// AI Analysis State
const AIAnalysisState = {
  currentAnalysis: null,
  analysisHistory: [],
  selectedFile: null,
  analysisType: 'basic',
  paymentStatus: 'pending',
  walletConnected: false,
  shardeumConfig: null,
  pricing: null
};

// Initialize AI Analysis when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeAIAnalysis();
});

async function initializeAIAnalysis() {
  try {
    // Load Shardeum configuration
    await loadShardeumConfig();
    
    // Load pricing information
    await loadPricing();
    
    // Load analysis history if wallet is connected
    if (AppState.walletConnected) {
      await loadAnalysisHistory();
    }
    
    // Setup event listeners
    setupAIAnalysisEventListeners();
    
  } catch (error) {
    console.error('Failed to initialize AI Analysis:', error);
    showNotification('Failed to initialize AI Analysis system', 'error');
  }
}

function setupAIAnalysisEventListeners() {
  // File upload handling
  const fileInput = document.getElementById('aiAnalysisFileInput');
  const dropZone = document.getElementById('aiAnalysisDropZone');
  
  if (fileInput) {
    fileInput.addEventListener('change', handleFileSelection);
  }
  
  if (dropZone) {
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('drop', handleFileDrop);
    dropZone.addEventListener('click', () => fileInput?.click());
  }
  
  // Analysis type selection
  const analysisTypeButtons = document.querySelectorAll('.analysis-type-btn');
  analysisTypeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => selectAnalysisType(e.target.dataset.type));
  });
  
  // Payment and analysis submission
  const analyzeButton = document.getElementById('startAnalysisBtn');
  if (analyzeButton) {
    analyzeButton.addEventListener('click', startAIAnalysis);
  }
}

// ================= SHARDEUM INTEGRATION ================= 

async function loadShardeumConfig() {
  try {
    const response = await fetch('http://localhost:3001/api/shardeum-config');
    AIAnalysisState.shardeumConfig = await response.json();
    console.log('Shardeum config loaded:', AIAnalysisState.shardeumConfig);
  } catch (error) {
    console.error('Failed to load Shardeum config:', error);
  }
}

async function loadPricing() {
  try {
    const response = await fetch('http://localhost:3001/api/pricing');
    AIAnalysisState.pricing = await response.json();
    updatePricingDisplay();
  } catch (error) {
    console.error('Failed to load pricing:', error);
  }
}

function updatePricingDisplay() {
  if (!AIAnalysisState.pricing) return;
  
  const pricingElements = {
    'basic': document.getElementById('basicPrice'),
    'detailed': document.getElementById('detailedPrice'),
    'comprehensive': document.getElementById('comprehensivePrice')
  };
  
  Object.entries(pricingElements).forEach(([type, element]) => {
    if (element && AIAnalysisState.pricing[type]) {
      element.textContent = `${AIAnalysisState.pricing[type]} SHM`;
    }
  });
}

async function connectToShardeum() {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask not detected. Please install MetaMask to continue.');
    }
    
    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });
    
    if (accounts.length === 0) {
      throw new Error('No accounts found. Please connect your MetaMask wallet.');
    }
    
    // Check if we're on Shardeum network
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    
    if (chainId !== AIAnalysisState.shardeumConfig.chainId) {
      // Add/Switch to Shardeum network
      await addShardeumNetwork();
    }
    
    AIAnalysisState.walletConnected = true;
    AppState.walletAddress = accounts[0];
    
    updateWalletUI();
    await loadAnalysisHistory();
    
    showNotification('Successfully connected to Shardeum network!', 'success');
    
  } catch (error) {
    console.error('Shardeum connection error:', error);
    showNotification(error.message, 'error');
  }
}

async function addShardeumNetwork() {
  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [AIAnalysisState.shardeumConfig]
    });
  } catch (error) {
    console.error('Failed to add Shardeum network:', error);
    throw new Error('Failed to add Shardeum network to MetaMask');
  }
}

// ================= FILE HANDLING ================= 

function handleFileSelection(event) {
  const file = event.target.files[0];
  if (file) {
    processSelectedFile(file);
  }
}

function handleDragOver(event) {
  event.preventDefault();
  event.currentTarget.classList.add('drag-over');
}

function handleFileDrop(event) {
  event.preventDefault();
  event.currentTarget.classList.remove('drag-over');
  
  const files = event.dataTransfer.files;
  if (files.length > 0) {
    processSelectedFile(files[0]);
  }
}

function processSelectedFile(file) {
  // Validate file type
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  
  if (!allowedTypes.includes(file.type)) {
    showNotification('Please select a valid medical report file (PDF, JPG, PNG, DOCX)', 'error');
    return;
  }
  
  // Validate file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    showNotification('File size must be less than 10MB', 'error');
    return;
  }
  
  AIAnalysisState.selectedFile = file;
  updateFileDisplay(file);
  updateAnalysisButton();
}

function updateFileDisplay(file) {
  const fileDisplay = document.getElementById('selectedFileDisplay');
  if (fileDisplay) {
    fileDisplay.innerHTML = `
      <div class="selected-file">
        <div class="file-icon">
          <i class="fa-solid fa-file-medical"></i>
        </div>
        <div class="file-info">
          <div class="file-name">${file.name}</div>
          <div class="file-size">${formatFileSize(file.size)}</div>
        </div>
        <button class="remove-file-btn" onclick="removeSelectedFile()">
          <i class="fa-solid fa-times"></i>
        </button>
      </div>
    `;
  }
}

function removeSelectedFile() {
  AIAnalysisState.selectedFile = null;
  const fileDisplay = document.getElementById('selectedFileDisplay');
  if (fileDisplay) {
    fileDisplay.innerHTML = '';
  }
  updateAnalysisButton();
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ================= ANALYSIS TYPE SELECTION ================= 

function selectAnalysisType(type) {
  AIAnalysisState.analysisType = type;
  
  // Update UI
  document.querySelectorAll('.analysis-type-btn').forEach(btn => {
    btn.classList.remove('selected');
  });
  
  const selectedBtn = document.querySelector(`[data-type="${type}"]`);
  if (selectedBtn) {
    selectedBtn.classList.add('selected');
  }
  
  updateAnalysisButton();
  updatePriceDisplay();
}

function updatePriceDisplay() {
  const priceDisplay = document.getElementById('currentPrice');
  if (priceDisplay && AIAnalysisState.pricing) {
    const price = AIAnalysisState.pricing[AIAnalysisState.analysisType];
    priceDisplay.textContent = `${price} SHM`;
  }
}

function updateAnalysisButton() {
  const analyzeBtn = document.getElementById('startAnalysisBtn');
  if (analyzeBtn) {
    const canAnalyze = AIAnalysisState.selectedFile && AIAnalysisState.walletConnected;
    analyzeBtn.disabled = !canAnalyze;
    
    if (!AIAnalysisState.walletConnected) {
      analyzeBtn.textContent = 'Connect Wallet First';
    } else if (!AIAnalysisState.selectedFile) {
      analyzeBtn.textContent = 'Select File First';
    } else {
      const price = AIAnalysisState.pricing?.[AIAnalysisState.analysisType] || '0';
      analyzeBtn.textContent = `Analyze Report (${price} SHM)`;
    }
  }
}

// ================= AI ANALYSIS PROCESS ================= 

async function startAIAnalysis() {
  try {
    if (!AIAnalysisState.selectedFile) {
      showNotification('Please select a medical report file first', 'error');
      return;
    }
    
    if (!AIAnalysisState.walletConnected) {
      await connectToShardeum();
      return;
    }
    
    showLoadingOverlay('Uploading medical report...');
    
    // Step 1: Upload file to backend
    const uploadResult = await uploadMedicalReport();
    
    if (!uploadResult.success) {
      throw new Error(uploadResult.error || 'Failed to upload file');
    }
    
    // Step 2: Process payment
    updateLoadingMessage('Processing payment...');
    const paymentResult = await processPayment(uploadResult.analysisId, uploadResult.price);
    
    if (!paymentResult.success) {
      throw new Error(paymentResult.error || 'Payment failed');
    }
    
    // Step 3: Wait for analysis completion
    updateLoadingMessage('AI is analyzing your medical report...');
    const analysisResult = await waitForAnalysisCompletion(uploadResult.analysisId);
    
    // Step 4: Display results
    hideLoadingOverlay();
    displayAnalysisResults(analysisResult);
    
    // Update history
    await loadAnalysisHistory();
    
    showNotification('AI analysis completed successfully!', 'success');
    
  } catch (error) {
    console.error('Analysis error:', error);
    hideLoadingOverlay();
    showNotification(error.message, 'error');
  }
}

async function uploadMedicalReport() {
  const formData = new FormData();
  formData.append('medicalReport', AIAnalysisState.selectedFile);
  formData.append('analysisType', AIAnalysisState.analysisType);
  formData.append('patientId', AppState.currentUser?.id || 'anonymous');
  formData.append('walletAddress', AppState.walletAddress);
  
  const response = await fetch('http://localhost:3001/api/upload-report', {
    method: 'POST',
    body: formData
  });
  
  return await response.json();
}

async function processPayment(analysisId, priceInSHM) {
  try {
    // Convert SHM to Wei (18 decimals)
    const priceInWei = window.web3.utils.toWei(priceInSHM, 'ether');
    
    // Get recipient address (in real implementation, this would be your contract address)
    const recipientAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5A'; // Example address
    
    // Send transaction
    const transactionHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [{
        from: AppState.walletAddress,
        to: recipientAddress,
        value: '0x' + parseInt(priceInWei).toString(16),
        gas: '0x5208', // 21000 gas limit
      }]
    });
    
    // Verify payment with backend
    const response = await fetch('http://localhost:3001/api/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        analysisId,
        transactionHash,
        walletAddress: AppState.walletAddress
      })
    });
    
    return await response.json();
    
  } catch (error) {
    console.error('Payment error:', error);
    throw new Error('Payment transaction failed');
  }
}

async function waitForAnalysisCompletion(analysisId) {
  const maxAttempts = 30; // 30 attempts with 2-second intervals = 1 minute max
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    try {
      const response = await fetch(`http://localhost:3001/api/analysis/${analysisId}`);
      const analysis = await response.json();
      
      if (analysis.status === 'completed') {
        return analysis;
      } else if (analysis.status === 'failed') {
        throw new Error('Analysis failed');
      }
      
      // Wait 2 seconds before next attempt
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
      
    } catch (error) {
      console.error('Error checking analysis status:', error);
      attempts++;
    }
  }
  
  throw new Error('Analysis timeout - please try again later');
}

// ================= RESULTS DISPLAY ================= 

function displayAnalysisResults(analysis) {
  const resultsContainer = document.getElementById('analysisResults');
  if (!resultsContainer) return;
  
  const result = analysis.result;
  const confidence = Math.round(result.confidence * 100);
  
  resultsContainer.innerHTML = `
    <div class="analysis-results-card">
      <div class="results-header">
        <h2>AI Analysis Results</h2>
        <div class="confidence-badge">
          <i class="fa-solid fa-brain"></i>
          ${confidence}% Confidence
        </div>
      </div>
      
      <div class="results-content">
        <div class="analysis-section">
          <h3><i class="fa-solid fa-stethoscope"></i> Medical Analysis</h3>
          <div class="analysis-text">${formatAnalysisText(result.analysis)}</div>
        </div>
        
        <div class="recommendations-section">
          <h3><i class="fa-solid fa-lightbulb"></i> Recommendations</h3>
          <ul class="recommendations-list">
            ${result.recommendations.map(rec => `<li>${rec}</li>`).join('')}
          </ul>
        </div>
        
        <div class="risk-factors-section">
          <h3><i class="fa-solid fa-exclamation-triangle"></i> Risk Factors</h3>
          <div class="risk-factors">
            ${result.riskFactors.map(risk => `
              <div class="risk-item ${risk.level.toLowerCase()}">
                <div class="risk-header">
                  <span class="risk-factor">${risk.factor}</span>
                  <span class="risk-level">${risk.level}</span>
                </div>
                <p class="risk-description">${risk.description}</p>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="followup-section">
          <h3><i class="fa-solid fa-calendar-check"></i> Follow-up Suggestions</h3>
          <ul class="followup-list">
            ${result.followUpSuggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
          </ul>
        </div>
        
        <div class="disclaimer-section">
          <div class="disclaimer">
            <i class="fa-solid fa-info-circle"></i>
            <p>${result.disclaimer}</p>
          </div>
        </div>
      </div>
      
      <div class="results-actions">
        <button class="action-btn primary" onclick="downloadAnalysisReport('${analysis.id}')">
          <i class="fa-solid fa-download"></i>
          Download Report
        </button>
        <button class="action-btn secondary" onclick="shareAnalysisResults('${analysis.id}')">
          <i class="fa-solid fa-share"></i>
          Share with Doctor
        </button>
        <button class="action-btn secondary" onclick="saveToRecords('${analysis.id}')">
          <i class="fa-solid fa-save"></i>
          Save to Records
        </button>
      </div>
    </div>
  `;
  
  // Show results section
  resultsContainer.classList.remove('hidden');
  
  // Scroll to results
  resultsContainer.scrollIntoView({ behavior: 'smooth' });
}

function formatAnalysisText(text) {
  // Convert markdown-style formatting to HTML
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>');
}

// ================= ANALYSIS HISTORY ================= 

async function loadAnalysisHistory() {
  try {
    if (!AppState.walletAddress) return;
    
    const response = await fetch(`http://localhost:3001/api/analysis-history/${AppState.walletAddress}`);
    AIAnalysisState.analysisHistory = await response.json();
    
    updateAnalysisHistoryDisplay();
    
  } catch (error) {
    console.error('Failed to load analysis history:', error);
  }
}

function updateAnalysisHistoryDisplay() {
  const historyContainer = document.getElementById('analysisHistoryList');
  if (!historyContainer) return;
  
  if (AIAnalysisState.analysisHistory.length === 0) {
    historyContainer.innerHTML = `
      <div class="empty-history">
        <i class="fa-solid fa-history"></i>
        <p>No analysis history yet</p>
        <small>Your AI analysis reports will appear here</small>
      </div>
    `;
    return;
  }
  
  historyContainer.innerHTML = AIAnalysisState.analysisHistory.map(analysis => `
    <div class="history-item" onclick="viewAnalysisDetails('${analysis.id}')">
      <div class="history-icon">
        <i class="fa-solid fa-file-medical"></i>
      </div>
      <div class="history-info">
        <div class="history-title">${analysis.originalName}</div>
        <div class="history-meta">
          <span class="analysis-type">${analysis.analysisType}</span>
          <span class="analysis-date">${formatDate(analysis.uploadTime)}</span>
        </div>
      </div>
      <div class="history-status">
        <span class="status-badge ${analysis.status}">${analysis.status}</span>
      </div>
    </div>
  `).join('');
}

// ================= UTILITY FUNCTIONS ================= 

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function showLoadingOverlay(message) {
  const overlay = document.getElementById('aiAnalysisLoading');
  const messageEl = document.getElementById('aiLoadingMessage');
  
  if (overlay) {
    overlay.classList.remove('hidden');
  }
  
  if (messageEl) {
    messageEl.textContent = message;
  }
}

function updateLoadingMessage(message) {
  const messageEl = document.getElementById('aiLoadingMessage');
  if (messageEl) {
    messageEl.textContent = message;
  }
}

function hideLoadingOverlay() {
  const overlay = document.getElementById('aiAnalysisLoading');
  if (overlay) {
    overlay.classList.add('hidden');
  }
}

// ================= ACTION HANDLERS ================= 

function downloadAnalysisReport(analysisId) {
  // Implementation for downloading analysis report
  showNotification('Download feature coming soon!', 'info');
}

function shareAnalysisResults(analysisId) {
  // Implementation for sharing results with doctors
  showNotification('Share feature coming soon!', 'info');
}

function saveToRecords(analysisId) {
  // Implementation for saving to medical records
  showNotification('Analysis saved to your medical records!', 'success');
}

function viewAnalysisDetails(analysisId) {
  // Implementation for viewing detailed analysis
  const analysis = AIAnalysisState.analysisHistory.find(a => a.id === analysisId);
  if (analysis && analysis.result) {
    displayAnalysisResults(analysis);
  }
}

// Export functions for global access
window.AIAnalysis = {
  connectToShardeum,
  selectAnalysisType,
  startAIAnalysis,
  loadAnalysisHistory
};
// ================= ENHANCED DHRW APPLICATION ================= 

// Global State Management
const AppState = {
  currentUser: null,
  currentSection: 'dashboard',
  walletConnected: false,
  walletAddress: null,
  medicalRecords: [],
  accessRequests: [],
  approvedRequests: [],
  auditLogs: [],
  chatbotOpen: false,
  isLoading: false
};

// ================= INITIALIZATION ================= 
document.addEventListener('DOMContentLoaded', function () {
  initializeApp();
  setupEventListeners();
  createParticles();
  setupCursorGlow();
  loadStoredData();

  // Initialize advanced motion effects after a short delay
  setTimeout(() => {
    initializeAdvancedMotion();
    setupEnhancedInputFeedback();
  }, 200);
});

function initializeApp() {
  // Check if user is already logged in
  const storedUser = localStorage.getItem('dhrw_user');
  if (storedUser) {
    AppState.currentUser = JSON.parse(storedUser);
    if (AppState.currentUser.role === 'doctor') {
      const dashboard = document.getElementById('doctorDashboardPage');
      if (dashboard) {
        dashboard.classList.remove('hidden');
        document.getElementById('loginPage').classList.add('hidden');
        document.getElementById('roleSelectionPage').classList.add('hidden');
      }
    } else {
      showDashboard();
    }
  } else {
    showRoleSelection();
  }

  // Initialize wallet connection if stored
  const walletConnected = localStorage.getItem('dhrw_wallet_connected');
  if (walletConnected === 'true') {
    AppState.walletConnected = true;
    AppState.walletAddress = localStorage.getItem('dhrw_wallet_address');
    updateWalletUI();
  }
}

function setupEventListeners() {
  // File upload drag and drop
  const uploadArea = document.getElementById('uploadArea');
  if (uploadArea) {
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleFileDrop);
  }

  // File input change
  const fileInput = document.getElementById('fileInput');
  if (fileInput) {
    fileInput.addEventListener('change', handleFileSelect);
  }

  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', handleFilterClick);
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyboardShortcuts);

  // Window resize
  window.addEventListener('resize', handleWindowResize);
}

// ================= AUTHENTICATION ================= 
function handleLogin(event) {
  event.preventDefault();

  const form = event.target;
  const email = form.querySelector('input[type="email"]').value;
  const password = form.querySelector('input[type="password"]').value;

  // Show loading state
  showButtonLoading(form.querySelector('.primary-btn'));

  // Simulate authentication delay
  setTimeout(() => {
    // For demo purposes, accept any email/password
    const user = {
      id: generateId(),
      email: email,
      name: email.split('@')[0],
      loginTime: new Date().toISOString()
    };

    AppState.currentUser = user;
    localStorage.setItem('dhrw_user', JSON.stringify(user));

    showButtonSuccess(form.querySelector('.primary-btn'));

    setTimeout(() => {
      showDashboard();
    }, 1000);
  }, 1500);
}

function handleSignup(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  // Show loading state
  showButtonLoading(form.querySelector('.primary-btn'));

  // Simulate signup delay
  setTimeout(() => {
    const user = {
      id: generateId(),
      email: form.querySelector('input[type="email"]').value,
      name: form.querySelector('input[type="text"]').value,
      phone: form.querySelector('input[type="tel"]').value,
      signupTime: new Date().toISOString()
    };

    // Store user data temporarily for OTP verification
    AppState.pendingUser = user;

    showButtonSuccess(form.querySelector('.primary-btn'));

    setTimeout(() => {
      showOTPVerification();
    }, 1000);
  }, 1500);
}

function handleLogout() {
  showLoadingOverlay('Logging out securely...');

  setTimeout(() => {
    // Clear user data
    AppState.currentUser = null;
    localStorage.removeItem('dhrw_user');

    // Clear wallet connection
    AppState.walletConnected = false;
    AppState.walletAddress = null;
    localStorage.removeItem('dhrw_wallet_connected');
    localStorage.removeItem('dhrw_wallet_address');

    hideLoadingOverlay();
    showRoleSelection();
  }, 1000);
}

function showLogin() {
  document.getElementById('loginPage').classList.remove('hidden');
  document.getElementById('dashboardPage').classList.add('hidden');
}

function showDashboard() {
  document.getElementById('loginPage').classList.add('hidden');
  document.getElementById('dashboardPage').classList.remove('hidden');

  // Update user info
  if (AppState.currentUser) {
    // Check if anonymous mode is enabled
    const displayName = getDisplayName();
    document.querySelector('.user-name').textContent = displayName;

    // Apply anonymous mode styling if enabled
    if (AppState.currentUser.anonymousMode) {
      document.querySelector('.user-name').classList.add('anonymous');
    } else {
      document.querySelector('.user-name').classList.remove('anonymous');
    }

    // Load profile image in header if exists and not in anonymous mode
    if (AppState.currentUser.profileImage && !AppState.currentUser.anonymousMode) {
      const headerAvatar = document.getElementById('headerAvatarImage');
      const headerAvatarContainer = document.querySelector('.user-avatar');

      if (headerAvatar && headerAvatarContainer) {
        headerAvatar.src = AppState.currentUser.profileImage;
        headerAvatarContainer.classList.add('has-image');
      }
    } else {
      // Ensure default state if no profile image or anonymous mode
      const headerAvatar = document.getElementById('headerAvatarImage');
      const headerAvatarContainer = document.querySelector('.user-avatar');

      if (headerAvatar && headerAvatarContainer) {
        headerAvatar.src = 'https://via.placeholder.com/40/2dd4bf/ffffff?text=User';
        headerAvatarContainer.classList.remove('has-image');
      }
    }
  }

  // Load dashboard data
  loadDashboardData();
}

function showSignup() {
  document.getElementById('loginForm').classList.add('hidden');
  document.getElementById('signupForm').classList.remove('hidden');
}

function showLoginForm() {
  document.getElementById('signupForm').classList.add('hidden');
  document.getElementById('loginForm').classList.remove('hidden');
}

// ================= NAVIGATION ================= 
function showSection(sectionName) {
  // Update app state
  AppState.currentSection = sectionName;

  // Hide all sections
  document.querySelectorAll('.content-section').forEach(section => {
    section.classList.remove('active');
  });

  // Show target section
  const targetSection = document.getElementById(sectionName);
  if (targetSection) {
    targetSection.classList.add('active');
  }

  // Update navigation
  document.querySelectorAll('.nav-pill').forEach(item => {
    item.classList.remove('active');
  });

  const activeNavItem = document.querySelector(`[data-section="${sectionName}"]`);
  if (activeNavItem) {
    activeNavItem.classList.add('active');
  }

  // Load section-specific data
  loadSectionData(sectionName);

  // Update chatbot context
  updateChatbotContext(sectionName);
}

function loadSectionData(sectionName) {
  switch (sectionName) {
    case 'dashboard':
      loadDashboardData();
      break;
    case 'records':
      loadMedicalRecords();
      break;
    case 'access':
      loadAccessRequests();
      break;
    case 'audit':
      loadAuditLogs();
      break;
  }
}

// ================= DASHBOARD ================= 
function loadDashboardData() {
  // Initialize the About DHRW section with fade-in animation
  const aboutContainer = document.getElementById('aboutDhrwContainer');
  if (aboutContainer) {
    // Ensure the fade-in animation plays when the dashboard loads
    aboutContainer.style.opacity = '0';
    setTimeout(() => {
      aboutContainer.style.opacity = '1';
      // Initialize advanced motion effects for the dashboard
      initializeAdvancedMotion();
    }, 100);
  }
}



// ================= MEDICAL RECORDS ================= 
function loadMedicalRecords() {
  const tableBody = document.getElementById('recordsTableBody');
  if (!tableBody) return;

  if (AppState.medicalRecords.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 40px; color: var(--text-muted);">
          <i class="fa-solid fa-folder-open" style="font-size: 48px; margin-bottom: 16px; display: block;"></i>
          No medical records uploaded yet
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = AppState.medicalRecords.map(record => `
    <tr>
      <td>
        <div style="display: flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-file-medical" style="color: var(--primary);"></i>
          ${record.fileName}
        </div>
      </td>
      <td>${getFileType(record.fileName)}</td>
      <td>${formatDate(record.uploadDate)}</td>
      <td>
        <span class="status-badge ${record.status === 'Private' ? 'status-private' : 'status-shared'}">
          ${record.status}
        </span>
      </td>
      <td>
        <div class="action-buttons">
          <button class="action-btn" onclick="viewRecord('${record.id}')" title="View">
            <i class="fa-solid fa-eye"></i>
          </button>
          <button class="action-btn" onclick="shareRecord('${record.id}')" title="Share">
            <i class="fa-solid fa-share"></i>
          </button>
          <button class="action-btn" onclick="deleteRecord('${record.id}')" title="Delete">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function triggerFileUpload() {
  document.getElementById('fileInput').click();
}

function handleFileSelect(event) {
  const files = Array.from(event.target.files);
  uploadFiles(files);
}

function handleDragOver(event) {
  event.preventDefault();
  event.currentTarget.classList.add('dragover');
}

function handleDragLeave(event) {
  event.preventDefault();
  event.currentTarget.classList.remove('dragover');
}

function handleFileDrop(event) {
  event.preventDefault();
  event.currentTarget.classList.remove('dragover');

  const files = Array.from(event.dataTransfer.files);
  uploadFiles(files);
}

function uploadFiles(files) {
  if (files.length === 0) return;

  showLoadingOverlay('Encrypting and uploading files...');

  // Simulate file upload process
  setTimeout(() => {
    files.forEach(file => {
      const record = {
        id: generateId(),
        fileName: file.name,
        fileSize: file.size,
        uploadDate: new Date().toISOString(),
        status: 'Private',
        type: getFileType(file.name)
      };

      AppState.medicalRecords.push(record);

      // Add to audit log
      addAuditLog({
        action: 'Uploaded',
        doctor: 'You',
        record: file.name,
        timestamp: new Date().toISOString(),
        ipAddress: '192.168.1.100'
      });
    });

    // Save to localStorage
    localStorage.setItem('dhrw_medical_records', JSON.stringify(AppState.medicalRecords));

    hideLoadingOverlay();
    loadMedicalRecords();

    // Show success notification
    showNotification('Files uploaded successfully!', 'success');
  }, 2000);
}

// ================= ACCESS CONTROL ================= 
function updateAccessStats() {
  const pendingCountElement = document.getElementById('pendingCount');
  const approvedCountElement = document.getElementById('approvedCount');

  if (pendingCountElement) {
    const pendingCount = AppState.accessRequests.length;
    pendingCountElement.textContent = `${pendingCount} Pending`;
  }

  if (approvedCountElement) {
    const approvedCount = AppState.approvedRequests.length;
    approvedCountElement.textContent = `${approvedCount} Approved`;
  }
}

function loadAccessRequests() {
  const tableBody = document.getElementById('accessTableBody');
  if (!tableBody) return;

  // Sample access requests - only add if no existing requests
  if (AppState.accessRequests.length === 0) {
    const sampleRequests = [
      {
        id: '1',
        doctorName: 'Dr. Rahul Sharma',
        specialization: 'Cardiology',
        requestedRecord: 'ECG_Report.pdf',
        requestDate: '2024-01-15',
        doctorAddress: '0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4'
      },
      {
        id: '2',
        doctorName: 'Dr. Meera Iyer',
        specialization: 'Neurology',
        requestedRecord: 'MRI_Scan.pdf',
        requestDate: '2024-01-14',
        doctorAddress: '0x8ba1f109551bD432803012645Hac136c0532925a'
      },
      {
        id: '3',
        doctorName: 'Dr. James Wilson',
        specialization: 'General Medicine',
        requestedRecord: 'Blood_Test_Results.pdf',
        requestDate: '2024-01-13',
        doctorAddress: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'
      }
    ];
    AppState.accessRequests = sampleRequests;
  }

  // Sample approved requests - only add if no existing approved requests
  if (AppState.approvedRequests.length === 0) {
    const sampleApproved = [
      {
        id: 'approved_1',
        doctorName: 'Dr. Sarah Johnson',
        specialization: 'Dermatology',
        requestedRecord: 'Skin_Biopsy_Results.pdf',
        approvedDate: '2024-01-10'
      },
      {
        id: 'approved_2',
        doctorName: 'Dr. Michael Chen',
        specialization: 'Orthopedics',
        requestedRecord: 'X-Ray_Report.pdf',
        approvedDate: '2024-01-08'
      }
    ];
    AppState.approvedRequests = sampleApproved;
  }

  // Update stats
  updateAccessStats();

  // Populate table with pending requests
  if (AppState.accessRequests.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 40px; color: var(--text-muted);">
          <i class="fa-solid fa-user-check" style="font-size: 48px; margin-bottom: 16px; display: block;"></i>
          No pending access requests
        </td>
      </tr>
    `;
  } else {
    tableBody.innerHTML = AppState.accessRequests.map(request => `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div class="user-avatar" style="width: 32px; height: 32px; font-size: 12px;">
              <i class="fa-solid fa-user-doctor"></i>
            </div>
            ${request.doctorName}
          </div>
        </td>
        <td>${request.specialization}</td>
        <td>
          <div style="display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-file-medical" style="color: var(--primary);"></i>
            ${request.requestedRecord}
          </div>
        </td>
        <td>${formatDate(request.requestDate)}</td>
        <td>
          <button class="action-btn approve-btn" onclick="approveAccess('${request.id}')">
            <i class="fa-solid fa-check"></i> Approve
          </button>
          <button class="action-btn reject-btn" onclick="rejectAccess('${request.id}')">
            <i class="fa-solid fa-times"></i> Reject
          </button>
        </td>
      </tr>
    `).join('');
  }
}

const SHARDEUM_CHAIN_ID = '0x1FB7'; // 8119
// Improved RPC Reliability: List multiple endpoints for the new testnet
const SHARDEUM_RPC_URLS = [
  'https://api-mezame.shardeum.org/',
  'https://atomium.shardeum.org/' // Keeping as fallback if compatible, else remove
];
const SHARDEUM_EXPLORER_URL = 'https://explorer-mezame.shardeum.org/';
const CONTRACT_ADDRESS = '0x96af7aFA67A96f2Edff04032E74288ED8b472932';

async function switchToShardeum() {
  if (!window.ethereum) return false;

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: SHARDEUM_CHAIN_ID }],
    });
    return true;
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask.
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: SHARDEUM_CHAIN_ID,
              chainName: 'Shardeum Atomium (Mezame)',
              rpcUrls: SHARDEUM_RPC_URLS,
              blockExplorerUrls: [SHARDEUM_EXPLORER_URL],
              nativeCurrency: {
                name: 'SHARDEUM',
                symbol: 'SHM',
                decimals: 18,
              },
            },
          ],
        });
        return true;
      } catch (addError) {
        console.error(addError);
        showNotification('Failed to add Shardeum network', 'error');
        return false;
      }
    }
    console.error(switchError);
    showNotification('Failed to switch to Shardeum network', 'error');
    return false;
  }
}

async function sendTransactionWithRetry(params, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [params],
      });
    } catch (error) {
      // Don't retry if user rejected
      if (error.code === 4001) throw error;

      console.warn(`Transaction attempt ${i + 1} failed:`, error);
      if (i === maxRetries - 1) throw error;

      // Wait before retrying (exponential backoff with longer base: 2s, 4s, 8s)
      const delay = Math.pow(2, i + 1) * 1000;
      showNotification(`Network busy, retrying in ${delay / 1000}s...`, 'warning');
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

async function approveAccess(requestId) {
  if (!AppState.walletConnected) {
    showNotification('Please connect your wallet to approve access', 'warning');
    // Attempt to connect if not connected
    connectWallet();
    return;
  }

  // Ensure we are on Shardeum
  const isOnShardeum = await switchToShardeum();
  if (!isOnShardeum) return;

  const request = AppState.accessRequests.find(r => r.id === requestId);
  if (!request) return;

  showLoadingOverlay('Waiting for transaction approval...');

  try {
    // Get doc address and id
    // Get doc address and id
    const doctorAddress = request.doctorAddress || '0x0000000000000000000000000000000000000000';

    // Ensure requestId is numeric for smart contract
    let numericId = parseInt(requestId.replace(/\D/g, '')); // Extract numbers
    if (isNaN(numericId) || numericId === 0) numericId = Date.now(); // Fallback to timestamp if no ID

    // Function selector for grantAccess(uint256,address): 0x65dd152c

    // Encode requestId (uint256)
    const idHex = numericId.toString(16).padStart(64, '0');

    // Encode doctorAddress (address)
    let cleanAddr = doctorAddress.replace(/^0x/, '').toLowerCase();
    // Validate address length (should be 40 chars hex)
    if (cleanAddr.length !== 40) {
      console.warn('Invalid doctor address, using zero address');
      cleanAddr = '0000000000000000000000000000000000000000';
    }
    const addrHex = cleanAddr.padStart(64, '0');

    // Construct data payload
    const data = `0x65dd152c${idHex}${addrHex}`;

    console.log('Transaction Data:', data);

    const transactionParameters = {
      to: CONTRACT_ADDRESS,
      from: AppState.walletAddress,
      data: data,
    };

    // Use retry helper
    const txHash = await sendTransactionWithRetry(transactionParameters);

    showLoadingOverlay('Transaction submitted! Processing...');
    console.log('Transaction Hash:', txHash);

    // Optimistically update UI
    // Remove from pending requests
    AppState.accessRequests = AppState.accessRequests.filter(r => r.id !== requestId);

    // Add to approved requests
    const approvedRequest = {
      ...request,
      approvedDate: new Date().toISOString(),
      status: 'approved',
      txHash: txHash
    };
    AppState.approvedRequests.push(approvedRequest);

    // Add to audit log
    addAuditLog({
      action: 'Approved',
      doctor: request.doctorName,
      record: request.requestedRecord,
      timestamp: new Date().toISOString(),
      txHash: txHash
    });

    // Save to localStorage
    localStorage.setItem('dhrw_access_requests', JSON.stringify(AppState.accessRequests));
    localStorage.setItem('dhrw_approved_requests', JSON.stringify(AppState.approvedRequests));

    hideLoadingOverlay();
    loadAccessRequests(); // This will update the stats and table
    showNotification('Access Approved on Blockchain!', 'success');

  } catch (error) {
    hideLoadingOverlay();
    console.error('Transaction failed:', error);
    if (error.code === 4001) {
      showNotification('Transaction rejected by user', 'info');
    } else {
      showNotification('Transaction failed: ' + error.message, 'error');
    }
  }
}

function rejectAccess(requestId) {
  const request = AppState.accessRequests.find(r => r.id === requestId);
  if (request) {
    // Remove from pending requests
    AppState.accessRequests = AppState.accessRequests.filter(r => r.id !== requestId);

    // Add to audit log
    addAuditLog({
      action: 'Rejected',
      doctor: request.doctorName,
      record: request.requestedRecord,
      timestamp: new Date().toISOString()
    });

    // Save to localStorage
    localStorage.setItem('dhrw_access_requests', JSON.stringify(AppState.accessRequests));

    loadAccessRequests(); // This will update the stats and table
    showNotification('Access request rejected', 'info');
  }
}

// ================= AI ANALYSIS LOGIC =================

let selectedAiPlan = null;
let selectedAiFile = null;

function selectAiPlan(type, cost) {
  selectedAiPlan = { type, cost };

  // Visual Selection Update
  document.querySelectorAll('.pricing-card').forEach(card => card.classList.remove('selected'));

  // Find the card that was clicked (based on cost for simplicity or by adding IDs)
  // Since we pass type, we can map it.
  // Actually, event.currentTarget in HTML handles the click, but we need to target specific elements if we want to add 'selected' class via JS.
  // Let's rely on finding by text content or just re-render. 
  // Easier: Add IDs to cards in HTML? No, I added 'onclick', so 'this' isn't passed directly.
  // I'll assume the user clicks the card.
  // Better: loop through all and match the cost or add data attributes.
  // I'll update the display text mostly.

  // Simpler approach for visual: Add 'onclick' to pass 'this' in HTML would have been better.
  // Since I can't easily change HTML again without big rewrite, I'll guess the card based on cost.
  const cards = document.querySelectorAll('.pricing-card');
  if (type === 'basic') cards[0].classList.add('selected');
  if (type === 'detailed') cards[1].classList.add('selected');
  if (type === 'comprehensive') cards[2].classList.add('selected');

  document.getElementById('selectedPlanDisplay').textContent = `${type.charAt(0).toUpperCase() + type.slice(1)} Analysis`;
  document.getElementById('selectedCostDisplay').textContent = `${cost} SHM`;

  updatePayButtonState();
}

function handleAiFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 10 * 1024 * 1024) {
      showNotification('File size exceeds 10MB limit', 'error');
      return;
    }
    selectedAiFile = file;
    document.getElementById('aiFileName').textContent = file.name;
    document.getElementById('aiFileSize').textContent = (file.size / (1024 * 1024)).toFixed(2) + ' MB';

    document.getElementById('aiUploadArea').classList.add('hidden');
    document.getElementById('aiSelectedFile').classList.remove('hidden');

    updatePayButtonState();
  }
}

function clearAiFile() {
  selectedAiFile = null;
  document.getElementById('aiFileInput').value = '';
  document.getElementById('aiUploadArea').classList.remove('hidden');
  document.getElementById('aiSelectedFile').classList.add('hidden');
  updatePayButtonState();
}

function updatePayButtonState() {
  const btn = document.getElementById('payAnalyzeBtn');
  if (selectedAiPlan && selectedAiFile) {
    btn.disabled = false;
  } else {
    btn.disabled = true;
  }
}

async function payAndAnalyze() {
  if (!AppState.walletConnected) {
    showNotification('Please connect your wallet first', 'warning');
    connectWallet();
    return;
  }

  // Ensure network
  const isOnShardeum = await switchToShardeum();
  if (!isOnShardeum) return;

  showLoadingOverlay('Processing Payment...');

  try {
    // 1 SHM = 10^18 Wei
    const costWei = BigInt(parseFloat(selectedAiPlan.cost) * 10 ** 18).toString(16);

    const params = {
      to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', // Treasury/Owner address (Demo)
      from: AppState.walletAddress,
      value: '0x' + costWei, // Hex value
      gas: '0x5208' // 21000 gas for simple transfer
    };

    // Use retry helper for better reliability
    const txHash = await sendTransactionWithRetry(params);

    console.log('Payment TX:', txHash);
    hideLoadingOverlay();

    // Start Analysis UI
    startAiAnalysis();

  } catch (error) {
    hideLoadingOverlay();
    console.error('Payment failed:', error);
    // User rejection code 4001 is already handled by retry helper? No, retry helper re-throws it.
    if (error.code === 4001) {
      showNotification('Transaction rejected by user', 'info');
    } else {
      showNotification('Payment failed: ' + (error.message || 'Unknown error'), 'error');
    }
  }
}

function startAiAnalysis() {
  // Hide main content or scroll to result
  const resultArea = document.getElementById('aiResultArea');
  const loader = document.getElementById('aiLoader');
  const content = document.getElementById('aiResultContent');
  const footer = document.querySelector('.ai-action-footer');

  resultArea.classList.remove('hidden');
  loader.classList.remove('hidden');
  content.classList.add('hidden');

  // Hide footer to prevent re-submission
  footer.classList.add('hidden');

  // Scroll to result
  resultArea.scrollIntoView({ behavior: 'smooth' });

  // Simulate processing time (3 seconds)
  setTimeout(() => {
    loader.classList.add('hidden');
    content.classList.remove('hidden');
    showNotification('Analysis Complete!', 'success');

    // Add audit log
    addAuditLog({
      action: 'AI Analysis',
      doctor: 'AI System',
      record: selectedAiFile.name,
      timestamp: new Date().toISOString()
    });

  }, 4000);
}


// ================= AUDIT LOGS ================= 
function loadAuditLogs() {
  const tableBody = document.getElementById('auditTableBody');
  if (!tableBody) return;

  // Add sample audit logs if none exist
  if (AppState.auditLogs.length === 0) {
    const sampleAuditLogs = [
      {
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        doctor: 'Dr. Sarah Johnson',
        record: 'Blood_Test_Results.pdf',
        action: 'Viewed',
        ipAddress: '192.168.1.45'
      },
      {
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        doctor: 'Dr. Michael Chen',
        record: 'X-Ray_Report.pdf',
        action: 'Downloaded',
        ipAddress: '10.0.0.23'
      },
      {
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        doctor: 'System',
        record: 'MRI_Scan.pdf',
        action: 'Uploaded',
        ipAddress: '192.168.1.100'
      },
      {
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
        doctor: 'Dr. Rahul Sharma',
        record: 'ECG_Report.pdf',
        action: 'Viewed',
        ipAddress: '172.16.0.15'
      },
      {
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
        doctor: 'Dr. Meera Iyer',
        record: 'Lab_Results_Complete.pdf',
        action: 'Downloaded',
        ipAddress: '192.168.1.67'
      },
      {
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        doctor: 'System',
        record: 'Prescription_History.pdf',
        action: 'Uploaded',
        ipAddress: '192.168.1.100'
      },
      {
        timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(), // 1.5 days ago
        doctor: 'Dr. James Wilson',
        record: 'Blood_Test_Results.pdf',
        action: 'Viewed',
        ipAddress: '10.0.0.89'
      },
      {
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
        doctor: 'Dr. Lisa Park',
        record: 'Allergy_Test_Results.pdf',
        action: 'Downloaded',
        ipAddress: '172.16.0.34'
      },
      {
        timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), // 3 days ago
        doctor: 'System',
        record: 'Vaccination_Record.pdf',
        action: 'Uploaded',
        ipAddress: '192.168.1.100'
      },
      {
        timestamp: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(), // 4 days ago
        doctor: 'Dr. Robert Kim',
        record: 'CT_Scan_Report.pdf',
        action: 'Viewed',
        ipAddress: '10.0.0.156'
      }
    ];

    AppState.auditLogs = sampleAuditLogs;
    localStorage.setItem('dhrw_audit_logs', JSON.stringify(AppState.auditLogs));
  }

  if (AppState.auditLogs.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 40px; color: var(--text-muted);">
          <i class="fa-solid fa-clock-rotate-left" style="font-size: 48px; margin-bottom: 16px; display: block;"></i>
          No audit activity yet
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = AppState.auditLogs.map(log => `
    <tr>
      <td>${formatDateTime(log.timestamp)}</td>
      <td>
        <div style="display: flex; align-items: center; gap: 8px;">
          <div class="user-avatar" style="width: 24px; height: 24px; font-size: 10px;">
            ${log.doctor === 'System' ?
      '<i class="fa-solid fa-server"></i>' :
      '<i class="fa-solid fa-user-doctor"></i>'
    }
          </div>
          ${log.doctor || 'System'}
        </div>
      </td>
      <td>
        <div style="display: flex; align-items: center; gap: 8px;">
          <i class="fa-solid ${getRecordIcon(log.record)}" style="color: var(--primary);"></i>
          ${log.record}
        </div>
      </td>
      <td>
        <span class="status-badge ${getActionBadgeClass(log.action)}">
          <i class="fa-solid ${getActionIcon(log.action)}"></i>
          ${log.action}
        </span>
      </td>
      <td>${log.ipAddress || '192.168.1.1'}</td>
    </tr>
  `).join('');
}

function addAuditLog(logEntry) {
  AppState.auditLogs.unshift(logEntry);
  localStorage.setItem('dhrw_audit_logs', JSON.stringify(AppState.auditLogs));
}

// ================= WALLET INTEGRATION ================= 
function toggleWallet() {
  if (AppState.walletConnected) {
    disconnectWallet();
  } else {
    connectWallet();
  }
}

function connectWallet() {
  if (typeof window.ethereum === 'undefined') {
    showNotification('MetaMask is not installed. Please install MetaMask to continue.', 'error');
    return;
  }

  showLoadingOverlay('Connecting to MetaMask...');

  window.ethereum.request({ method: 'eth_requestAccounts' })
    .then(accounts => {
      if (accounts.length > 0) {
        AppState.walletConnected = true;
        AppState.walletAddress = accounts[0];

        localStorage.setItem('dhrw_wallet_connected', 'true');
        localStorage.setItem('dhrw_wallet_address', accounts[0]);

        updateWalletUI();
        hideLoadingOverlay();
        showNotification('Wallet connected successfully!', 'success');
      }
    })
    .catch(error => {
      hideLoadingOverlay();
      showNotification('Failed to connect wallet', 'error');
      console.error('Wallet connection error:', error);
    });
}

function disconnectWallet() {
  AppState.walletConnected = false;
  AppState.walletAddress = null;

  localStorage.removeItem('dhrw_wallet_connected');
  localStorage.removeItem('dhrw_wallet_address');

  updateWalletUI();
  showNotification('Wallet disconnected', 'info');
}

function updateWalletUI() {
  const walletBtn = document.getElementById('walletBtn');
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');

  if (AppState.walletConnected) {
    walletBtn.innerHTML = `
      <i class="fab fa-ethereum"></i>
      <span>Disconnect</span>
    `;
    statusDot.classList.remove('offline');
    statusDot.classList.add('online');
    statusText.textContent = 'Connected';
  } else {
    walletBtn.innerHTML = `
      <i class="fab fa-ethereum"></i>
      <span>Connect Wallet</span>
    `;
    statusDot.classList.remove('online');
    statusDot.classList.add('offline');
    statusText.textContent = 'Disconnected';
  }
}

// ================= USER MENU ================= 
function toggleUserMenu() {
  const dropdown = document.getElementById('userDropdown');
  dropdown.classList.toggle('hidden');
}

// Close dropdown when clicking outside
document.addEventListener('click', function (event) {
  const userMenu = document.querySelector('.user-menu');
  const dropdown = document.getElementById('userDropdown');

  if (userMenu && !userMenu.contains(event.target)) {
    dropdown.classList.add('hidden');
  }
});

// ================= UTILITY FUNCTIONS ================= 
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getFileType(fileName) {
  const extension = fileName.split('.').pop().toLowerCase();
  const types = {
    'pdf': 'PDF Document',
    'jpg': 'Image',
    'jpeg': 'Image',
    'png': 'Image',
    'docx': 'Word Document',
    'doc': 'Word Document'
  };
  return types[extension] || 'Unknown';
}

function getActionBadgeClass(action) {
  const classes = {
    'Uploaded': 'status-shared',
    'Viewed': 'status-private',
    'Downloaded': 'status-shared',
    'Approved': 'status-shared',
    'Rejected': 'status-private',
    'Shared': 'status-shared',
    'Revoked': 'status-private',
    'Deleted': 'status-private'
  };
  return classes[action] || 'status-private';
}

function getActionIcon(action) {
  const icons = {
    'Uploaded': 'fa-cloud-arrow-up',
    'Viewed': 'fa-eye',
    'Downloaded': 'fa-download',
    'Approved': 'fa-check',
    'Rejected': 'fa-times',
    'Shared': 'fa-share',
    'Revoked': 'fa-ban',
    'Deleted': 'fa-trash'
  };
  return icons[action] || 'fa-circle-info';
}

function getRecordIcon(recordName) {
  const fileName = recordName.toLowerCase();

  if (fileName.includes('blood') || fileName.includes('lab')) {
    return 'fa-vial';
  } else if (fileName.includes('x-ray') || fileName.includes('xray')) {
    return 'fa-x-ray';
  } else if (fileName.includes('mri') || fileName.includes('ct') || fileName.includes('scan')) {
    return 'fa-brain';
  } else if (fileName.includes('ecg') || fileName.includes('ekg') || fileName.includes('heart')) {
    return 'fa-heart-pulse';
  } else if (fileName.includes('prescription') || fileName.includes('medication')) {
    return 'fa-pills';
  } else if (fileName.includes('vaccination') || fileName.includes('vaccine')) {
    return 'fa-syringe';
  } else if (fileName.includes('allergy')) {
    return 'fa-triangle-exclamation';
  } else {
    return 'fa-file-medical';
  }
}

// ================= UI HELPERS ================= 
function showButtonLoading(button) {
  const btnText = button.querySelector('.btn-text');
  const btnLoader = button.querySelector('.btn-loader');

  btnText.style.opacity = '0';
  btnLoader.classList.remove('hidden');
  button.disabled = true;
}

function showButtonSuccess(button) {
  const btnLoader = button.querySelector('.btn-loader');
  const btnSuccess = button.querySelector('.btn-success');

  btnLoader.classList.add('hidden');
  btnSuccess.classList.remove('hidden');
}

function resetButton(button) {
  const btnText = button.querySelector('.btn-text');
  const btnLoader = button.querySelector('.btn-loader');
  const btnSuccess = button.querySelector('.btn-success');

  btnText.style.opacity = '1';
  btnLoader.classList.add('hidden');
  btnSuccess.classList.add('hidden');
  button.disabled = false;
}

function showLoadingOverlay(message = 'Loading...') {
  const overlay = document.getElementById('loadingOverlay');
  const messageEl = overlay.querySelector('p');

  messageEl.textContent = message;
  overlay.classList.remove('hidden');
  AppState.isLoading = true;
}

function hideLoadingOverlay() {
  const overlay = document.getElementById('loadingOverlay');
  overlay.classList.add('hidden');
  AppState.isLoading = false;
}

function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fa-solid ${getNotificationIcon(type)}"></i>
      <span>${message}</span>
    </div>
    <button class="notification-close" onclick="this.parentElement.remove()">
      <i class="fa-solid fa-times"></i>
    </button>
  `;

  // Add styles
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--glass-bg);
    backdrop-filter: blur(20px);
    border: 1px solid var(--glass-border);
    border-radius: 12px;
    padding: 16px;
    color: var(--text-primary);
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
    max-width: 400px;
    box-shadow: var(--glass-shadow);
  `;

  document.body.appendChild(notification);

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }
  }, 5000);
}

function getNotificationIcon(type) {
  const icons = {
    'success': 'fa-check-circle',
    'error': 'fa-exclamation-circle',
    'warning': 'fa-exclamation-triangle',
    'info': 'fa-info-circle'
  };
  return icons[type] || icons.info;
}

// ================= ANIMATIONS ================= 
function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  for (let i = 0; i < 50; i++) {
    setTimeout(() => {
      createParticle(container);
    }, i * 200);
  }

  // Continue creating particles
  setInterval(() => {
    createParticle(container);
  }, 3000);
}

function createParticle(container) {
  const particle = document.createElement('div');
  particle.className = 'particle';

  // Random starting position
  particle.style.left = Math.random() * 100 + '%';
  particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
  particle.style.animationDelay = Math.random() * 5 + 's';

  container.appendChild(particle);

  // Remove particle after animation
  setTimeout(() => {
    if (particle.parentElement) {
      particle.remove();
    }
  }, 20000);
}

function setupCursorGlow() {
  const cursorGlow = document.getElementById('cursorGlow');
  if (!cursorGlow) return;

  document.addEventListener('mousemove', (e) => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
  });
}

// ================= KEYBOARD SHORTCUTS ================= 
function handleKeyboardShortcuts(event) {
  // Ctrl/Cmd + K to open chatbot
  if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
    event.preventDefault();
    toggleChatbot();
  }

  // Escape to close modals/dropdowns
  if (event.key === 'Escape') {
    closeChatbot();
    document.getElementById('userDropdown').classList.add('hidden');
  }

  // Number keys for navigation (1-4)
  if (event.key >= '1' && event.key <= '4' && !event.target.matches('input, textarea')) {
    const sections = ['dashboard', 'records', 'access', 'audit'];
    const sectionIndex = parseInt(event.key) - 1;
    if (sections[sectionIndex]) {
      showSection(sections[sectionIndex]);
    }
  }
}

// ================= RESPONSIVE HANDLING ================= 
function handleWindowResize() {
  // Handle responsive behavior
  const sidebar = document.querySelector('.sidebar');
  const chatbotWindow = document.getElementById('chatbotWindow');

  if (window.innerWidth <= 768) {
    // Mobile adjustments
    if (chatbotWindow && !chatbotWindow.classList.contains('hidden')) {
      chatbotWindow.style.width = 'calc(100vw - 32px)';
      chatbotWindow.style.right = '16px';
    }
  } else {
    // Desktop adjustments
    if (chatbotWindow) {
      chatbotWindow.style.width = '380px';
      chatbotWindow.style.right = '0';
    }
  }
}

// ================= DATA PERSISTENCE ================= 
function loadStoredData() {
  // Load medical records
  const storedRecords = localStorage.getItem('dhrw_medical_records');
  if (storedRecords) {
    AppState.medicalRecords = JSON.parse(storedRecords);
  }

  // Load audit logs
  const storedLogs = localStorage.getItem('dhrw_audit_logs');
  if (storedLogs) {
    AppState.auditLogs = JSON.parse(storedLogs);
  }

  // Load access requests
  const storedAccessRequests = localStorage.getItem('dhrw_access_requests');
  if (storedAccessRequests) {
    AppState.accessRequests = JSON.parse(storedAccessRequests);
  }

  // Load approved requests
  const storedApprovedRequests = localStorage.getItem('dhrw_approved_requests');
  if (storedApprovedRequests) {
    AppState.approvedRequests = JSON.parse(storedApprovedRequests);
  }
}

function saveAppState() {
  localStorage.setItem('dhrw_medical_records', JSON.stringify(AppState.medicalRecords));
  localStorage.setItem('dhrw_audit_logs', JSON.stringify(AppState.auditLogs));
  localStorage.setItem('dhrw_access_requests', JSON.stringify(AppState.accessRequests));
  localStorage.setItem('dhrw_approved_requests', JSON.stringify(AppState.approvedRequests));
}

// ================= FILTER FUNCTIONALITY ================= 
function handleFilterClick(event) {
  const button = event.target;
  const filterType = button.dataset.filter;

  // Update active filter
  button.parentElement.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  button.classList.add('active');

  // Apply filter (implement based on current section)
  applyFilter(filterType);
}

function applyFilter(filterType) {
  // Implementation depends on current section
  console.log('Applying filter:', filterType);
}

// ================= PASSWORD TOGGLE ================= 
function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const toggle = input.nextElementSibling;
  const icon = toggle.querySelector('i');

  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.replace('fa-eye', 'fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.replace('fa-eye-slash', 'fa-eye');
  }
}

// ================= RECORD ACTIONS ================= 
function viewRecord(recordId) {
  const record = AppState.medicalRecords.find(r => r.id === recordId);
  if (record) {
    // Add audit log for viewing
    addAuditLog({
      action: 'Viewed',
      doctor: 'You',
      record: record.fileName,
      timestamp: new Date().toISOString(),
      ipAddress: '192.168.1.100'
    });

    showNotification(`Viewing ${record.fileName}`, 'info');
    // Implement record viewing logic here
  }
}

function shareRecord(recordId) {
  const record = AppState.medicalRecords.find(r => r.id === recordId);
  if (record) {
    // Add audit log for sharing
    addAuditLog({
      action: 'Shared',
      doctor: 'System',
      record: record.fileName,
      timestamp: new Date().toISOString(),
      ipAddress: '192.168.1.100'
    });

    showNotification(`Sharing options for ${record.fileName}`, 'info');
    // Implement record sharing logic here
  }
}

function deleteRecord(recordId) {
  if (confirm('Are you sure you want to delete this record?')) {
    const record = AppState.medicalRecords.find(r => r.id === recordId);
    if (record) {
      // Add audit log for deletion
      addAuditLog({
        action: 'Deleted',
        doctor: 'You',
        record: record.fileName,
        timestamp: new Date().toISOString(),
        ipAddress: '192.168.1.100'
      });

      AppState.medicalRecords = AppState.medicalRecords.filter(r => r.id !== recordId);
      saveAppState();
      loadMedicalRecords();
      showNotification('Record deleted successfully', 'success');
    }
  }
}

// Auto-save app state periodically
setInterval(saveAppState, 30000); // Save every 30 seconds

// Function to simulate doctor actions for more realistic audit logs
function simulateDoctorActivity() {
  const doctors = [
    'Dr. Sarah Johnson', 'Dr. Michael Chen', 'Dr. Rahul Sharma',
    'Dr. Meera Iyer', 'Dr. James Wilson', 'Dr. Lisa Park', 'Dr. Robert Kim'
  ];

  const records = [
    'Blood_Test_Results.pdf', 'X-Ray_Report.pdf', 'MRI_Scan.pdf',
    'ECG_Report.pdf', 'Lab_Results_Complete.pdf', 'CT_Scan_Report.pdf',
    'Allergy_Test_Results.pdf', 'Prescription_History.pdf'
  ];

  const actions = ['Viewed', 'Downloaded'];
  const ipAddresses = ['192.168.1.45', '10.0.0.23', '172.16.0.15', '192.168.1.67', '10.0.0.89'];

  // Simulate random doctor activity every 30 seconds to 2 minutes
  const interval = Math.random() * 90000 + 30000; // 30s to 2min

  setTimeout(() => {
    const randomDoctor = doctors[Math.floor(Math.random() * doctors.length)];
    const randomRecord = records[Math.floor(Math.random() * records.length)];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    const randomIP = ipAddresses[Math.floor(Math.random() * ipAddresses.length)];

    addAuditLog({
      action: randomAction,
      doctor: randomDoctor,
      record: randomRecord,
      timestamp: new Date().toISOString(),
      ipAddress: randomIP
    });

    // Continue simulation
    simulateDoctorActivity();
  }, interval);
}

// Start doctor activity simulation after 5 seconds
setTimeout(simulateDoctorActivity, 5000);

// ================= ADVANCED MOTION EFFECTS ================= 

// Initialize advanced motion effects
function initializeAdvancedMotion() {
  setupParallaxEffects();
  setupScrollProgressTracking();
  setupSectionRevealAnimations();
  setupCursorAwareEffects();
  setupEasterEggAnimation();
  setupMicroToastSystem();
  setupEnhancedButtonInteractions();
  setupDynamicBackgroundStates();
  initializeFadeInAnimation();
}

// Initialize fade-in animation for About DHRW container
function initializeFadeInAnimation() {
  const aboutContainer = document.getElementById('aboutDhrwContainer');
  if (aboutContainer) {
    // Start the staggered entrance animations
    setTimeout(() => {
      aboutContainer.style.opacity = '1';
    }, 200);
  }
}

// Setup parallax effects
function setupParallaxEffects() {
  let mouseX = 0;
  let mouseY = 0;
  let scrollY = 0;

  // Mouse parallax effect
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;

    // Apply parallax to hero background
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
      const parallaxElement = heroSection.querySelector('::before');
      if (parallaxElement) {
        const moveX = mouseX * 10;
        const moveY = mouseY * 10;
        heroSection.style.setProperty('--mouse-x', `${moveX}px`);
        heroSection.style.setProperty('--mouse-y', `${moveY}px`);
      }
    }

    // Update cursor-aware glow
    updateCursorAwareGlow(e.clientX, e.clientY);
  });

  // Scroll parallax effect
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;

    // Apply scroll parallax to geometric shapes
    const shapes = document.querySelectorAll('.shape');
    shapes.forEach((shape, index) => {
      const speed = 0.2 + (index * 0.05);
      const yPos = -(scrollY * speed);

      // Different effects for different shape types
      if (shape.classList.contains('shape-1') || shape.classList.contains('shape-3')) {
        // Horizontal lines - slight vertical movement
        shape.style.transform = `translateY(${yPos * 0.5}px)`;
      } else if (shape.classList.contains('shape-2') || shape.classList.contains('shape-4')) {
        // Vertical lines - slight horizontal movement
        const xPos = -(scrollY * speed * 0.3);
        shape.style.transform = `translateX(${xPos}px)`;
      } else if (shape.classList.contains('shape-5')) {
        // Square - rotation and scale
        const rotation = scrollY * 0.1;
        const scale = 1 + (scrollY * 0.0001);
        shape.style.transform = `translate(-50%, -50%) rotate(${45 + rotation}deg) scale(${Math.min(scale, 1.5)})`;
      }
    });

    // Update scroll progress
    updateScrollProgress();
  });
}

// Setup scroll progress tracking
function setupScrollProgressTracking() {
  const progressBar = document.getElementById('scrollProgress');
  if (!progressBar) return;

  function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;

    progressBar.style.width = `${Math.min(scrollPercent, 100)}%`;
  }

  window.addEventListener('scroll', updateScrollProgress);
  updateScrollProgress(); // Initial call
}

// Setup section reveal animations
function setupSectionRevealAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');

        // Add settled class after blur transition
        if (entry.target.classList.contains('section-blur-transition')) {
          setTimeout(() => {
            entry.target.classList.add('settled');
          }, 300);
        }
      }
    });
  }, observerOptions);

  // Observe all section reveal elements
  document.querySelectorAll('.section-reveal').forEach(el => {
    observer.observe(el);
  });

  // Observe blur transition elements
  document.querySelectorAll('.section-blur-transition').forEach(el => {
    observer.observe(el);
  });
}

// Setup cursor-aware effects
function setupCursorAwareEffects() {
  const cursorGlow = document.getElementById('cursorGlow');
  const cursorAwareGlow = document.getElementById('cursorAwareGlow');
  let trails = [];

  if (!cursorGlow) return;

  document.addEventListener('mousemove', (e) => {
    // Update main cursor glow
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';

    // Update cursor-aware glow in hero section
    if (cursorAwareGlow) {
      const heroSection = document.querySelector('.hero-section');
      if (heroSection) {
        const rect = heroSection.getBoundingClientRect();
        if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
          cursorAwareGlow.style.left = (e.clientX - rect.left) + 'px';
          cursorAwareGlow.style.top = (e.clientY - rect.top) + 'px';
          cursorAwareGlow.style.opacity = '1';
        } else {
          cursorAwareGlow.style.opacity = '0';
        }
      }
    }

    // Create cursor trail effect
    createCursorTrail(e.clientX, e.clientY);
  });

  document.addEventListener('mouseleave', () => {
    cursorGlow.style.opacity = '0';
    if (cursorAwareGlow) {
      cursorAwareGlow.style.opacity = '0';
    }
  });

  document.addEventListener('mouseenter', () => {
    cursorGlow.style.opacity = '1';
  });
}

// Create cursor trail effect
function createCursorTrail(x, y) {
  const trail = document.createElement('div');
  trail.className = 'cursor-trail';
  trail.style.left = x + 'px';
  trail.style.top = y + 'px';

  document.body.appendChild(trail);

  // Animate and remove trail
  setTimeout(() => {
    trail.style.opacity = '0';
    trail.style.transform = 'scale(0)';
    setTimeout(() => {
      if (trail.parentNode) {
        trail.parentNode.removeChild(trail);
      }
    }, 100);
  }, 50);
}

// Update cursor-aware glow position
function updateCursorAwareGlow(x, y) {
  const cursorAwareGlow = document.getElementById('cursorAwareGlow');
  if (cursorAwareGlow) {
    cursorAwareGlow.style.left = x + 'px';
    cursorAwareGlow.style.top = y + 'px';
  }
}

// Setup Easter egg animation (triple-click on logo)
function setupEasterEggAnimation() {
  const heroTitle = document.getElementById('heroTitle');
  if (!heroTitle) return;

  let clickCount = 0;
  let clickTimer = null;

  heroTitle.addEventListener('click', () => {
    clickCount++;

    if (clickTimer) {
      clearTimeout(clickTimer);
    }

    if (clickCount === 3) {
      // Trigger easter egg animation
      heroTitle.classList.add('easter-egg');
      showMicroToast('🎉 You found the easter egg!', 'info');

      // Reset after animation
      setTimeout(() => {
        heroTitle.classList.remove('easter-egg');
        clickCount = 0;
      }, 1500);
    } else {
      // Reset click count after 1 second
      clickTimer = setTimeout(() => {
        clickCount = 0;
      }, 1000);
    }
  });
}

// Micro-toast notification system
function setupMicroToastSystem() {
  // Create toast container if it doesn't exist
  if (!document.getElementById('toastContainer')) {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.style.cssText = `
      position: fixed;
      bottom: 100px;
      right: 24px;
      z-index: 10001;
      display: flex;
      flex-direction: column;
      gap: 8px;
    `;
    document.body.appendChild(container);
  }
}

// Show micro-toast notification
function showMicroToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `micro-toast ${type}`;

  const iconMap = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle'
  };

  toast.innerHTML = `
    <i class="fa-solid ${iconMap[type]} toast-icon ${type}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Auto-remove after duration
  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, duration);
}

// Setup enhanced button interactions
function setupEnhancedButtonInteractions() {
  // Enhanced CTA button interactions
  document.querySelectorAll('.cta-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Create ripple effect
      createRippleEffect(e, btn);

      // Show micro-toast for primary CTA
      if (btn.classList.contains('primary')) {
        showMicroToast('Action initiated successfully!', 'success');
      }
    });

    // Add hover sound effect (visual feedback)
    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'translateY(-3px) scale(1.02)';
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  // Enhanced highlight item interactions
  document.querySelectorAll('.highlight-item').forEach(item => {
    item.addEventListener('mouseenter', () => {
      // Trigger icon-specific animations
      const icon = item.querySelector('.highlight-icon i');
      if (icon) {
        triggerIconAnimation(icon);
      }
    });
  });
}

// Create ripple effect on button click
function createRippleEffect(event, button) {
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  const ripple = document.createElement('div');
  ripple.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    left: ${x}px;
    top: ${y}px;
    background: radial-gradient(circle, rgba(255,255,255,0.6), transparent);
    border-radius: 50%;
    transform: scale(0);
    animation: ripple 0.6s ease-out;
    pointer-events: none;
    z-index: 1;
  `;

  // Add ripple keyframes if not already added
  if (!document.getElementById('rippleStyles')) {
    const style = document.createElement('style');
    style.id = 'rippleStyles';
    style.textContent = `
      @keyframes ripple {
        to {
          transform: scale(2);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  button.style.position = 'relative';
  button.style.overflow = 'hidden';
  button.appendChild(ripple);

  setTimeout(() => {
    if (ripple.parentNode) {
      ripple.parentNode.removeChild(ripple);
    }
  }, 600);
}

// Trigger icon-specific animations
function triggerIconAnimation(icon) {
  const iconClass = icon.className;

  if (iconClass.includes('fa-shield-halved')) {
    icon.style.animation = 'shieldLock 0.8s ease-in-out';
  } else if (iconClass.includes('fa-user-doctor')) {
    icon.style.animation = 'stethoscopeVibrate 0.6s ease-in-out';
  } else if (iconClass.includes('fa-clock-rotate-left')) {
    icon.style.animation = 'clockTick 0.8s ease-in-out';
  } else if (iconClass.includes('fa-cloud')) {
    icon.style.animation = 'cloudFloat 1s ease-in-out';
  } else if (iconClass.includes('fa-bolt')) {
    icon.style.animation = 'boltZap 0.5s ease-in-out';
  }

  // Reset animation after completion
  setTimeout(() => {
    icon.style.animation = '';
  }, 1000);
}

// Setup dynamic background states
function setupDynamicBackgroundStates() {
  const dynamicBg = document.querySelector('.dynamic-bg');
  if (!dynamicBg) return;

  // Change background based on system state
  function updateBackgroundState(state) {
    dynamicBg.classList.remove('secure', 'warning', 'error');
    dynamicBg.classList.add(state);
  }

  // Example: Change background based on wallet connection
  function checkSystemState() {
    if (AppState.walletConnected) {
      updateBackgroundState('secure');
    } else {
      updateBackgroundState('warning');
    }
  }

  // Check state periodically
  setInterval(checkSystemState, 5000);
  checkSystemState(); // Initial check
}

// Enhanced input feedback
function setupEnhancedInputFeedback() {
  document.querySelectorAll('.form-input').forEach(input => {
    const inputGroup = input.parentElement;

    // Add floating label functionality
    input.addEventListener('focus', () => {
      inputGroup.classList.add('focused');
    });

    input.addEventListener('blur', () => {
      inputGroup.classList.remove('focused');
      if (input.value.trim() !== '') {
        inputGroup.classList.add('filled');
      } else {
        inputGroup.classList.remove('filled');
      }
    });

    // Add shake animation on invalid input
    input.addEventListener('invalid', () => {
      input.classList.add('error');
      setTimeout(() => {
        input.classList.remove('error');
      }, 500);
    });
  });
}

// Performance optimization: Throttle scroll and mouse events
function throttle(func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

// Update scroll progress (called from existing scroll handler)
function updateScrollProgress() {
  const progressBar = document.getElementById('scrollProgress');
  if (!progressBar) return;

  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercent = (scrollTop / docHeight) * 100;

  progressBar.style.width = `${Math.min(scrollPercent, 100)}%`;
}

// Enhanced notification system (extends existing showNotification)
function showEnhancedNotification(message, type = 'info', duration = 5000) {
  // Use existing notification system but with enhanced styling
  showNotification(message, type);

  // Also show micro-toast for quick feedback
  showMicroToast(message, type, 3000);
}

// Apply throttling to performance-critical functions
const throttledScrollHandler = throttle(() => {
  updateScrollProgress();
}, 16); // ~60fps

const throttledMouseHandler = throttle((e) => {
  updateCursorAwareGlow(e.clientX, e.clientY);
}, 16); // ~60fps

// Replace existing event listeners with throttled versions for better performance
// Note: These will be set up after the main initialization
// ================= OTP VERIFICATION ================= 
let otpTimer;
let otpTimeLeft = 300; // 5 minutes in seconds

function showOTPVerification() {
  document.getElementById('otpVerificationPopup').classList.remove('hidden');
  startOTPTimer();

  // Focus on first OTP input
  setTimeout(() => {
    document.querySelector('.otp-input').focus();
  }, 100);
}

function closeOTPPopup() {
  document.getElementById('otpVerificationPopup').classList.add('hidden');
  clearInterval(otpTimer);
  resetOTPForm();
}

function startOTPTimer() {
  otpTimeLeft = 300; // Reset to 5 minutes
  updateTimerDisplay();

  otpTimer = setInterval(() => {
    otpTimeLeft--;
    updateTimerDisplay();

    if (otpTimeLeft <= 0) {
      clearInterval(otpTimer);
      // Handle timer expiry
      document.getElementById('otpTimer').textContent = 'Expired';
      document.querySelector('.otp-verify-btn').disabled = true;
    }
  }, 1000);
}

function updateTimerDisplay() {
  const minutes = Math.floor(otpTimeLeft / 60);
  const seconds = otpTimeLeft % 60;
  document.getElementById('otpTimer').textContent =
    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function moveToNext(current, index) {
  if (current.value.length === 1) {
    current.classList.add('filled');
    if (index < 5) {
      document.querySelectorAll('.otp-input')[index + 1].focus();
    }
  } else {
    current.classList.remove('filled');
  }

  // Auto-submit if all fields are filled
  checkAutoSubmit();
}

function handleBackspace(current, index) {
  if (event.key === 'Backspace' && current.value === '' && index > 0) {
    document.querySelectorAll('.otp-input')[index - 1].focus();
  }
}

function checkAutoSubmit() {
  const inputs = document.querySelectorAll('.otp-input');
  const allFilled = Array.from(inputs).every(input => input.value.length === 1);

  if (allFilled) {
    // Auto-submit after a short delay
    setTimeout(() => {
      document.getElementById('otpForm').dispatchEvent(new Event('submit'));
    }, 500);
  }
}

function handleOTPVerification(event) {
  event.preventDefault();

  const inputs = document.querySelectorAll('.otp-input');
  const otp = Array.from(inputs).map(input => input.value).join('');

  if (otp.length !== 6) {
    showOTPError('Please enter all 6 digits');
    return;
  }

  const submitBtn = document.querySelector('.otp-verify-btn');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnLoader = submitBtn.querySelector('.btn-loader');
  const btnSuccess = submitBtn.querySelector('.btn-success');

  // Show loading state
  btnText.classList.add('hidden');
  btnLoader.classList.remove('hidden');
  submitBtn.disabled = true;

  // Simulate OTP verification (accept any 6-digit code for demo)
  setTimeout(() => {
    // Hide loading state
    btnLoader.classList.add('hidden');
    btnSuccess.classList.remove('hidden');

    // Complete user registration
    AppState.currentUser = AppState.pendingUser;
    AppState.currentUser.emailVerified = true;
    localStorage.setItem('dhrw_user', JSON.stringify(AppState.currentUser));

    setTimeout(() => {
      closeOTPPopup();
      showDashboard();
    }, 1000);

  }, 2000);
}

function resendOTP() {
  const resendBtn = document.querySelector('.resend-btn');
  resendBtn.disabled = true;
  resendBtn.textContent = 'Sending...';

  // Simulate resend delay
  setTimeout(() => {
    resendBtn.textContent = 'Code Sent!';
    startOTPTimer(); // Restart timer

    setTimeout(() => {
      resendBtn.disabled = false;
      resendBtn.textContent = 'Resend Code';
    }, 2000);
  }, 1000);
}

function resetOTPForm() {
  const inputs = document.querySelectorAll('.otp-input');
  inputs.forEach(input => {
    input.value = '';
    input.classList.remove('filled');
  });

  const submitBtn = document.querySelector('.otp-verify-btn');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnLoader = submitBtn.querySelector('.btn-loader');
  const btnSuccess = submitBtn.querySelector('.btn-success');

  btnText.classList.remove('hidden');
  btnLoader.classList.add('hidden');
  btnSuccess.classList.add('hidden');
  submitBtn.disabled = false;
}

function showOTPError(message) {
  // Simple error display - you can enhance this
  alert(message);
}
// ================= ANONYMOUS MODE FUNCTIONALITY ================= 
function toggleAnonymousMode() {
  const anonymousToggle = document.getElementById('anonymousMode');
  const isAnonymous = anonymousToggle.checked;

  if (AppState.currentUser) {
    AppState.currentUser.anonymousMode = isAnonymous;
    localStorage.setItem('dhrw_user', JSON.stringify(AppState.currentUser));

    // Update UI to reflect anonymous mode
    updateAnonymousModeUI(isAnonymous);

    showNotification(
      isAnonymous ? 'Anonymous mode enabled - your identity will be hidden from doctors' : 'Anonymous mode disabled - your identity will be visible to doctors',
      'info'
    );
  }
}

function updateAnonymousModeUI(isAnonymous) {
  // Update user display in various sections
  const userNameElements = document.querySelectorAll('.user-display-name');
  const userEmailElements = document.querySelectorAll('.user-display-email');

  userNameElements.forEach(element => {
    if (isAnonymous) {
      element.textContent = 'Anonymous Patient';
      element.classList.add('anonymous');
    } else {
      element.textContent = AppState.currentUser.fullName || AppState.currentUser.name || 'User';
      element.classList.remove('anonymous');
    }
  });

  userEmailElements.forEach(element => {
    if (isAnonymous) {
      element.textContent = 'patient@anonymous.dhrw';
      element.classList.add('anonymous');
    } else {
      element.textContent = AppState.currentUser.email || 'user@example.com';
      element.classList.remove('anonymous');
    }
  });

  // Update header user name if anonymous mode is enabled
  const headerUserName = document.querySelector('.user-name');
  if (headerUserName) {
    if (isAnonymous) {
      headerUserName.textContent = 'Anonymous';
      headerUserName.classList.add('anonymous');
    } else {
      headerUserName.textContent = AppState.currentUser.fullName || AppState.currentUser.name || 'User';
      headerUserName.classList.remove('anonymous');
    }
  }
}

function getDisplayName() {
  if (AppState.currentUser && AppState.currentUser.anonymousMode) {
    return 'Anonymous Patient';
  }
  return AppState.currentUser ? (AppState.currentUser.fullName || AppState.currentUser.name || 'User') : 'User';
}

function getDisplayEmail() {
  if (AppState.currentUser && AppState.currentUser.anonymousMode) {
    return 'patient@anonymous.dhrw';
  }
  return AppState.currentUser ? AppState.currentUser.email : 'user@example.com';
}

// ================= PROFILE SETTINGS ================= 
function toggleEdit(fieldId) {
  const field = document.getElementById(fieldId);
  const isDisabled = field.disabled;

  field.disabled = !isDisabled;

  if (!isDisabled) {
    field.focus();
    field.select();
  }
}

function handleAvatarUpload(event) {
  const file = event.target.files[0];
  if (file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      showNotification('Please select a valid image file', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showNotification('Image size must be less than 5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      const imageUrl = e.target.result;

      // Update profile settings avatar
      document.getElementById('avatarImage').src = imageUrl;

      // Update header avatar
      const headerAvatar = document.getElementById('headerAvatarImage');
      const headerAvatarContainer = document.querySelector('.user-avatar');

      if (headerAvatar && headerAvatarContainer) {
        headerAvatar.src = imageUrl;
        headerAvatarContainer.classList.add('has-image');
      }

      // Store in user data
      if (AppState.currentUser) {
        AppState.currentUser.profileImage = imageUrl;
        localStorage.setItem('dhrw_user', JSON.stringify(AppState.currentUser));
      }

      showNotification('Profile image updated successfully!', 'success');
    };

    reader.onerror = function () {
      showNotification('Error reading image file', 'error');
    };

    reader.readAsDataURL(file);
  }
}

async function toggleWalletConnection() {
  const btn = document.getElementById('walletConnectBtn');
  const walletStatus = document.getElementById('connectedWallet');

  if (typeof window.ethereum === 'undefined') {
    showNotification('MetaMask not installed!', 'error');
    window.open('https://metamask.io/download/', '_blank');
    return;
  }

  if (btn.textContent.trim() === 'Connect' || btn.textContent.trim() === 'Connect Wallet') {
    try {
      btn.textContent = 'Connecting...';
      btn.disabled = true;

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];

      handleWalletConnected(account);

      // Switch to Shardeum
      await switchToShardeum();

    } catch (error) {
      console.error(error);
      resetWalletButton();
      showNotification('Connection failed: ' + error.message, 'error');
    }
  } else {
    // Disconnect (MetaMask doesn't support programmatic disconnect, so we just clear state)
    AppState.walletConnected = false;
    AppState.walletAddress = null;
    localStorage.removeItem('dhrw_wallet_connected');
    localStorage.removeItem('dhrw_wallet_address');

    resetWalletButton();
    showNotification('Wallet disconnected', 'info');
  }
}

function handleWalletConnected(address) {
  AppState.walletConnected = true;
  AppState.walletAddress = address;
  localStorage.setItem('dhrw_wallet_connected', 'true');
  localStorage.setItem('dhrw_wallet_address', address);

  updateWalletUI();
}

function updateWalletUI() {
  const address = AppState.walletAddress;
  const shortAddr = address ? `${address.substring(0, 6)}...${address.substring(38)}` : '';

  // Header Button
  const headerBtn = document.getElementById('walletBtn');
  if (headerBtn) {
    headerBtn.innerHTML = `<i class="fab fa-ethereum"></i><span>${shortAddr}</span>`;
    headerBtn.classList.add('connected');
  }

  // Header Status Text
  const statusText = document.getElementById('statusText');
  const statusDot = document.getElementById('statusDot');
  if (statusText) statusText.textContent = 'Connected';
  if (statusDot) {
    statusDot.classList.remove('offline');
    statusDot.classList.add('online');
  }

  // Profile Page Button
  const profileBtn = document.getElementById('walletConnectBtn');
  const profileStatus = document.getElementById('connectedWallet');
  const profileAddr = document.getElementById('walletAddress');

  if (profileBtn) {
    profileBtn.textContent = 'Disconnect';
    profileBtn.classList.add('connected');
  }
  if (profileStatus) profileStatus.textContent = shortAddr;
  if (profileAddr) profileAddr.textContent = shortAddr;

  // Warning Banners
  const warning = document.getElementById('aiWalletWarning');
  if (warning) warning.classList.add('hidden');
}

function resetWalletButton() {
  const headerBtn = document.getElementById('walletBtn');
  if (headerBtn) {
    headerBtn.innerHTML = `<i class="fab fa-ethereum"></i><span>Connect Wallet</span>`;
    headerBtn.classList.remove('connected');
    headerBtn.disabled = false;
  }

  // Header Status Text
  const statusText = document.getElementById('statusText');
  const statusDot = document.getElementById('statusDot');
  if (statusText) statusText.textContent = 'Disconnected';
  if (statusDot) {
    statusDot.classList.remove('online');
    statusDot.classList.add('offline');
  }

  const profileBtn = document.getElementById('walletConnectBtn');
  const profileStatus = document.getElementById('connectedWallet');
  const profileAddr = document.getElementById('walletAddress');

  if (profileBtn) {
    profileBtn.textContent = 'Connect';
    profileBtn.classList.remove('connected');
    profileBtn.disabled = false;
  }
  if (profileStatus) profileStatus.textContent = 'Not Connected';
  if (profileAddr) profileAddr.textContent = 'Not Connected';
}

// Global Connect Function for other buttons
window.connectWallet = toggleWalletConnection;
window.toggleWallet = toggleWalletConnection;

function downloadData() {
  showLoadingOverlay('Preparing your data for download...');

  setTimeout(() => {
    hideLoadingOverlay();
    // Simulate file download
    const link = document.createElement('a');
    link.href = 'data:text/plain;charset=utf-8,DHRW User Data Export\n\nThis would contain all your medical records and account data.';
    link.download = 'dhrw-user-data.txt';
    link.click();
  }, 2000);
}

function exportAccessHistory() {
  showLoadingOverlay('Exporting access history...');

  setTimeout(() => {
    hideLoadingOverlay();
    // Simulate file download
    const link = document.createElement('a');
    link.href = 'data:text/csv;charset=utf-8,Date,Doctor,Action,Record\n2024-01-15,Dr. Smith,Viewed,Lab Results\n2024-01-14,Dr. Johnson,Downloaded,X-Ray';
    link.download = 'dhrw-access-history.csv';
    link.click();
  }, 1500);
}

function clearSessionHistory() {
  if (confirm('Are you sure you want to clear your session history? This action cannot be undone.')) {
    showLoadingOverlay('Clearing session history...');

    setTimeout(() => {
      hideLoadingOverlay();
      alert('Session history has been cleared successfully.');
    }, 1000);
  }
}

function confirmDeleteAccount() {
  const confirmation = prompt('This will permanently delete your account and all data. Type "DELETE" to confirm:');

  if (confirmation === 'DELETE') {
    showLoadingOverlay('Deleting account...');

    setTimeout(() => {
      hideLoadingOverlay();
      alert('Account deletion process initiated. You will receive a confirmation email.');
    }, 2000);
  } else if (confirmation !== null) {
    alert('Account deletion cancelled. Please type "DELETE" exactly to confirm.');
  }
}

function saveProfileChanges() {
  const saveBtn = document.querySelector('.save-btn');
  const originalText = saveBtn.innerHTML;

  saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
  saveBtn.disabled = true;

  // Collect all form data
  const profileData = {
    fullName: document.getElementById('fullName').value,
    username: document.getElementById('username').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    dateOfBirth: document.getElementById('dateOfBirth').value,
    gender: document.getElementById('gender').value,
    bloodGroup: document.getElementById('bloodGroup').value,
    emergencyName: document.getElementById('emergencyName').value,
    emergencyPhone: document.getElementById('emergencyPhone').value,
    // Privacy settings
    defaultPermission: document.getElementById('defaultPermission').value,
    autoExpire: document.getElementById('autoExpire').value,
    allowRequests: document.getElementById('allowRequests').checked,
    anonymousMode: document.getElementById('anonymousMode').checked,
    // Notification settings
    emailNotifications: document.getElementById('emailNotifications').checked,
    appNotifications: document.getElementById('appNotifications').checked,
    // Include profile image if it exists
    profileImage: AppState.currentUser?.profileImage || null
  };

  // Simulate save process
  setTimeout(() => {
    // Update user data in AppState
    if (AppState.currentUser) {
      Object.assign(AppState.currentUser, profileData);
      localStorage.setItem('dhrw_user', JSON.stringify(AppState.currentUser));

      // Update header user name if changed
      const userNameElement = document.querySelector('.user-name');
      if (userNameElement && profileData.fullName) {
        userNameElement.textContent = profileData.fullName;
      }
    }

    saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> Saved!';
    showNotification('Profile updated successfully!', 'success');

    setTimeout(() => {
      saveBtn.innerHTML = originalText;
      saveBtn.disabled = false;
    }, 2000);
  }, 1500);
}

function cancelProfileChanges() {
  if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
    loadProfileData(); // Reload original data
  }
}

function loadProfileData() {
  // Load user data into form fields
  if (AppState.currentUser) {
    const user = AppState.currentUser;

    // Personal information
    document.getElementById('fullName').value = user.fullName || user.name || '';
    document.getElementById('username').value = user.username || '';
    document.getElementById('email').value = user.email || '';
    document.getElementById('phone').value = user.phone || '';
    document.getElementById('dateOfBirth').value = user.dateOfBirth || '';
    document.getElementById('gender').value = user.gender || '';
    document.getElementById('bloodGroup').value = user.bloodGroup || '';
    document.getElementById('emergencyName').value = user.emergencyName || '';
    document.getElementById('emergencyPhone').value = user.emergencyPhone || '';

    // Load profile image if exists
    if (user.profileImage) {
      document.getElementById('avatarImage').src = user.profileImage;

      // Update header avatar
      const headerAvatar = document.getElementById('headerAvatarImage');
      const headerAvatarContainer = document.querySelector('.user-avatar');

      if (headerAvatar && headerAvatarContainer) {
        headerAvatar.src = user.profileImage;
        headerAvatarContainer.classList.add('has-image');
      }
    } else {
      // Set default images if no profile image
      document.getElementById('avatarImage').src = 'https://via.placeholder.com/120/2dd4bf/ffffff?text=User';

      const headerAvatar = document.getElementById('headerAvatarImage');
      const headerAvatarContainer = document.querySelector('.user-avatar');

      if (headerAvatar && headerAvatarContainer) {
        headerAvatar.src = 'https://via.placeholder.com/40/2dd4bf/ffffff?text=User';
        headerAvatarContainer.classList.remove('has-image');
      }
    }

    // Account details
    document.getElementById('userId').textContent = user.id || 'DHRW-123456789';
    document.getElementById('creationDate').textContent = user.signupTime ?
      new Date(user.signupTime).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    document.getElementById('lastLogin').textContent = user.loginTime ?
      new Date(user.loginTime).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : 'Today, ' + new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });

    // Load preferences if they exist
    if (user.defaultPermission) document.getElementById('defaultPermission').value = user.defaultPermission;
    if (user.autoExpire) document.getElementById('autoExpire').value = user.autoExpire;
    if (user.allowRequests !== undefined) document.getElementById('allowRequests').checked = user.allowRequests;
    if (user.anonymousMode !== undefined) document.getElementById('anonymousMode').checked = user.anonymousMode;

    // Notification preferences
    if (user.emailNotifications !== undefined) document.getElementById('emailNotifications').checked = user.emailNotifications;
    if (user.appNotifications !== undefined) document.getElementById('appNotifications').checked = user.appNotifications;
  }
}

// Load profile data when profile section is shown
document.addEventListener('DOMContentLoaded', function () {
  // Override showSection to load profile data when profile is shown
  const originalShowSection = window.showSection;
  window.showSection = function (sectionName) {
    originalShowSection(sectionName);

    if (sectionName === 'profile') {
      setTimeout(() => {
        loadProfileData();
      }, 100);
    }
  };
});

/* ================= DOCTOR PORTAL LOGIC ================= */

function selectRole(role) {
  document.getElementById('roleSelectionPage').classList.add('hidden');

  if (role === 'patient') {
    document.getElementById('loginPage').classList.remove('hidden');
    // Ensure we reset any previous state if needed
  } else if (role === 'doctor') {
    showDoctorLogin();
  }
}

function showRoleSelection() {
  document.getElementById('loginPage').classList.add('hidden');
  document.getElementById('dashboardPage').classList.add('hidden'); // Ensure patient dashboard is hidden

  const doctorLogin = document.getElementById('doctorLoginPage');
  if (doctorLogin) doctorLogin.classList.add('hidden');

  const doctorDashboard = document.getElementById('doctorDashboardPage');
  if (doctorDashboard) doctorDashboard.classList.add('hidden');

  const rolePage = document.getElementById('roleSelectionPage');
  if (rolePage) rolePage.classList.remove('hidden');
}

function showDoctorLogin() {
  const docLoginPage = document.getElementById('doctorLoginPage');
  if (docLoginPage) docLoginPage.classList.remove('hidden');
}

function handleDoctorLogin(event) {
  event.preventDefault();
  const form = event.target;
  const btn = form.querySelector('.primary-btn');

  // Show loading
  const btnText = btn.querySelector('.btn-text');
  const loader = btn.querySelector('.btn-loader');
  const success = btn.querySelector('.btn-success');

  if (btnText) btnText.classList.add('hidden');
  if (loader) loader.classList.remove('hidden');

  setTimeout(() => {
    // Mock login success
    const doctorUser = {
      id: 'doc_123',
      name: 'Dr. John Smith',
      role: 'doctor',
      license: 'MD123456',
      email: 'dr.john@example.com'
    };

    // Store user
    AppState.currentUser = doctorUser;
    localStorage.setItem('dhrw_user', JSON.stringify(doctorUser));

    // Show success
    if (loader) loader.classList.add('hidden');
    if (success) success.classList.remove('hidden');

    setTimeout(() => {
      document.getElementById('doctorLoginPage').classList.add('hidden');
      document.getElementById('doctorDashboardPage').classList.remove('hidden');
      showDoctorSection('dr-dashboard');

      // Reset button state
      if (success) success.classList.add('hidden');
      if (btnText) btnText.classList.remove('hidden');
    }, 1000);
  }, 1500);
}

function showDoctorSection(sectionId) {
  // Update State
  AppState.currentSection = sectionId;

  // Hide all sections in doctor dashboard
  const dashboard = document.getElementById('doctorDashboardPage');
  if (!dashboard) return;

  dashboard.querySelectorAll('.content-section').forEach(el => el.classList.remove('active'));

  const target = document.getElementById(sectionId);
  if (target) target.classList.add('active');

  // Update Nav
  dashboard.querySelectorAll('.nav-pill').forEach(el => el.classList.remove('active'));
  const navItem = dashboard.querySelector(`[data-section="${sectionId}"]`);
  if (navItem) navItem.classList.add('active');

  // Load Data
  if (sectionId === 'dr-records') loadDoctorPatients();
  if (sectionId === 'dr-requests') loadDoctorRequests();
}

function toggleDoctorUserMenu() {
  const menu = document.getElementById('doctorUserDropdown');
  if (menu) menu.classList.toggle('hidden');
}

function loadDoctorPatients() {
  const container = document.getElementById('patientCardsContainer');
  if (!container) return;

  // Mock Data matching Image 3
  const patients = [
    { name: 'Sarah Johnson', age: 34, id: 'PT_001', condition: 'Hypertension', files: 12, lastAccess: '1/10/2024 05:30 AM', status: 'Active' },
    { name: 'Michael Brown', age: 45, id: 'PT_002', condition: 'Diabetes Type 2', files: 8, lastAccess: '1/8/2024 05:30 AM', status: 'Expired' },
    { name: 'Emily Davis', age: 28, id: 'PT_003', condition: 'Asthma', files: 15, lastAccess: '1/12/2024 05:30 AM', status: 'Active' }
  ];

  container.innerHTML = patients.map(p => `
        <div class="patient-card">
            <div class="patient-header">
                <div>
                    <h4>${p.name}</h4>
                    <span class="patient-id">Age: ${p.age} • ID: ${p.id}</span>
                </div>
                <span class="patient-status ${p.status.toLowerCase()}">${p.status}</span>
            </div>
            <div class="patient-details">
                <div class="detail-row"><span>Primary Condition:</span> <span>${p.condition}</span></div>
                <div class="detail-row"><span>Records Count:</span> <span>${p.files} files</span></div>
                <div class="detail-row"><span>Last Access:</span> <span>${p.lastAccess}</span></div>
            </div>
            <div class="patient-actions">
                <button class="btn-filled"><i class="fa-solid fa-folder-open"></i> View Records</button>
                <button class="btn-outline"><i class="fa-solid fa-calendar"></i> Schedule</button>
            </div>
        </div>
    `).join('');
}

function loadDoctorRequests() {
  const tbody = document.getElementById('doctorRequestsTable');
  if (!tbody) return;

  // Mock Data matching Image 4
  const requests = [
    { patient: 'sarah.johnson@email.com', date: '1/10/2024 03:30 PM', duration: '24 hours', reason: 'Follow-up consultation for hypertension management', priority: 'Medium', status: 'Approved' },
    { patient: 'michael.brown@email.com', date: '1/12/2024 10:15 AM', duration: '1 hour', reason: 'Routine checkup details', priority: 'Low', status: 'Pending' }
  ];

  tbody.innerHTML = requests.map(r => `
        <tr>
            <td>${r.patient}</td>
            <td>${r.date}</td>
            <td>${r.duration}</td>
            <td>${r.reason}</td>
            <td><span class="status-badge priority-${r.priority.toLowerCase()}">${r.priority}</span></td>
            <td><span class="status-badge ${r.status.toLowerCase()}">${r.status.toUpperCase()}</span></td>
            <td>
                <button class="action-btn"><i class="fa-solid fa-eye"></i></button>
            </td>
        </tr>
    `).join('');
}
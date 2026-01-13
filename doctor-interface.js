// ================= DOCTOR INTERFACE FUNCTIONALITY ================= 

// Doctor State Management
const DoctorState = {
  currentDoctor: null,
  currentSection: 'doctor-dashboard',
  patients: [],
  accessRequests: [],
  consultations: [],
  notifications: [],
  selectedRole: null
};

// Initialize Doctor Interface
document.addEventListener('DOMContentLoaded', function() {
  initializeDoctorInterface();
});

function initializeDoctorInterface() {
  // Check if doctor is already logged in
  const storedDoctor = localStorage.getItem('dhrw_doctor');
  if (storedDoctor) {
    DoctorState.currentDoctor = JSON.parse(storedDoctor);
    showDoctorDashboard();
  }
  
  // Load mock data
  loadMockDoctorData();
  
  // Setup event listeners
  setupDoctorEventListeners();
}

function setupDoctorEventListeners() {
  // Role selection event listeners
  const roleCards = document.querySelectorAll('.role-card');
  roleCards.forEach(card => {
    card.addEventListener('click', function() {
      const role = this.getAttribute('onclick').match(/'([^']+)'/)[1];
      selectRole(role);
    });
  });
}

// ================= ROLE SELECTION ================= 

function selectRole(role) {
  DoctorState.selectedRole = role;
  
  // Hide role selection
  document.getElementById('roleSelection').classList.add('hidden');
  
  // Show appropriate login form
  document.getElementById('loginForm').classList.remove('hidden');
  
  // Update form based on role
  if (role === 'doctor') {
    document.getElementById('loginTitle').textContent = 'Doctor Login';
    document.getElementById('loginSubtitle').textContent = 'Sign in to your medical practice portal';
    document.getElementById('loginBtnText').textContent = 'Sign In as Doctor';
    document.getElementById('doctorFields').classList.remove('hidden');
  } else {
    document.getElementById('loginTitle').textContent = 'Patient Login';
    document.getElementById('loginSubtitle').textContent = 'Sign in to your secure medical portal';
    document.getElementById('loginBtnText').textContent = 'Sign In as Patient';
    document.getElementById('doctorFields').classList.add('hidden');
  }
}

function showRoleSelection() {
  document.getElementById('roleSelection').classList.remove('hidden');
  document.getElementById('loginForm').classList.add('hidden');
  document.getElementById('signupForm').classList.add('hidden');
  DoctorState.selectedRole = null;
}

function showSignup() {
  document.getElementById('loginForm').classList.add('hidden');
  document.getElementById('signupForm').classList.remove('hidden');
  
  // Update signup form based on role
  if (DoctorState.selectedRole === 'doctor') {
    document.getElementById('signupTitle').textContent = 'Doctor Registration';
    document.getElementById('signupSubtitle').textContent = 'Create your medical practice account';
    document.getElementById('signupBtnText').textContent = 'Register as Doctor';
    document.getElementById('doctorSignupFields').classList.remove('hidden');
  } else {
    document.getElementById('signupTitle').textContent = 'Patient Registration';
    document.getElementById('signupSubtitle').textContent = 'Create your secure medical account';
    document.getElementById('signupBtnText').textContent = 'Register as Patient';
    document.getElementById('doctorSignupFields').classList.add('hidden');
  }
}

function showLoginForm() {
  document.getElementById('signupForm').classList.add('hidden');
  document.getElementById('loginForm').classList.remove('hidden');
}

// ================= AUTHENTICATION ================= 

function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  // Show loading
  showLoadingState('loginForm');
  
  // Simulate authentication
  setTimeout(() => {
    if (DoctorState.selectedRole === 'doctor') {
      // Doctor login
      const licenseNumber = document.getElementById('licenseNumber').value;
      const hospitalName = document.getElementById('hospitalName').value;
      
      DoctorState.currentDoctor = {
        id: 'DR_' + Date.now(),
        email: email,
        name: 'Dr. John Smith',
        licenseNumber: licenseNumber || 'MD123456789',
        specialization: 'Cardiology',
        hospital: hospitalName || 'City General Hospital',
        experience: 10,
        phone: '+1 (555) 123-4567',
        verified: true
      };
      
      localStorage.setItem('dhrw_doctor', JSON.stringify(DoctorState.currentDoctor));
      showDoctorDashboard();
    } else {
      // Patient login - use existing patient flow
      AppState.currentUser = {
        id: 'PT_' + Date.now(),
        email: email,
        name: 'John Doe',
        phone: '+1 (555) 987-6543'
      };
      
      localStorage.setItem('dhrw_user', JSON.stringify(AppState.currentUser));
      showDashboard();
    }
    
    hideLoadingState('loginForm');
    showNotification('Login successful!', 'success');
    
  }, 2000);
}

function handleSignup(event) {
  event.preventDefault();
  
  const fullName = document.getElementById('signupFullName').value;
  const email = document.getElementById('signupEmail').value;
  const phone = document.getElementById('signupPhone').value;
  const password = document.getElementById('signupPassword').value;
  
  // Show loading
  showLoadingState('signupForm');
  
  // Simulate registration
  setTimeout(() => {
    if (DoctorState.selectedRole === 'doctor') {
      // Doctor registration
      const licenseNumber = document.getElementById('signupLicenseNumber').value;
      const specialization = document.getElementById('signupSpecialization').value;
      const hospitalName = document.getElementById('signupHospitalName').value;
      const experience = document.getElementById('signupExperience').value;
      
      DoctorState.currentDoctor = {
        id: 'DR_' + Date.now(),
        email: email,
        name: fullName,
        phone: phone,
        licenseNumber: licenseNumber,
        specialization: specialization,
        hospital: hospitalName,
        experience: parseInt(experience),
        verified: false // New doctors need verification
      };
      
      localStorage.setItem('dhrw_doctor', JSON.stringify(DoctorState.currentDoctor));
      showDoctorDashboard();
    } else {
      // Patient registration - use existing patient flow
      AppState.currentUser = {
        id: 'PT_' + Date.now(),
        email: email,
        name: fullName,
        phone: phone
      };
      
      localStorage.setItem('dhrw_user', JSON.stringify(AppState.currentUser));
      showDashboard();
    }
    
    hideLoadingState('signupForm');
    showNotification('Registration successful!', 'success');
    
  }, 2000);
}

// ================= DOCTOR DASHBOARD FUNCTIONS ================= 

function showDoctorDashboard() {
  // Hide login page
  document.getElementById('loginPage').classList.add('hidden');
  
  // Show doctor dashboard
  document.getElementById('doctorDashboardPage').classList.remove('hidden');
  
  // Update doctor info in header
  updateDoctorHeader();
  
  // Load dashboard data
  loadDoctorDashboardData();
  
  // Show default section
  showDoctorSection('doctor-dashboard');
}

function updateDoctorHeader() {
  if (DoctorState.currentDoctor) {
    document.getElementById('doctorName').textContent = DoctorState.currentDoctor.name;
    // Update avatar if available
  }
}

function showDoctorSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('#doctorDashboardPage .content-section').forEach(section => {
    section.classList.remove('active');
  });
  
  // Show selected section
  document.getElementById(sectionId).classList.add('active');
  
  // Update navigation
  document.querySelectorAll('#doctorDashboardPage .nav-pill').forEach(pill => {
    pill.classList.remove('active');
  });
  
  document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');
  
  // Load section-specific data
  loadSectionData(sectionId);
  
  DoctorState.currentSection = sectionId;
}

function loadSectionData(sectionId) {
  switch (sectionId) {
    case 'doctor-dashboard':
      loadDoctorDashboardData();
      break;
    case 'patient-requests':
      loadPatientRequests();
      break;
    case 'patient-records':
      loadPatientRecords();
      break;
    case 'consultations':
      loadConsultations();
      break;
    case 'doctor-profile':
      loadDoctorProfile();
      break;
  }
}

// ================= DASHBOARD DATA LOADING ================= 

function loadDoctorDashboardData() {
  // Update stats
  document.getElementById('totalPatients').textContent = DoctorState.patients.length;
  document.getElementById('pendingRequests').textContent = DoctorState.accessRequests.filter(r => r.status === 'pending').length;
  document.getElementById('todayConsultations').textContent = DoctorState.consultations.filter(c => isToday(c.date)).length;
  document.getElementById('recordsAccessed').textContent = '156'; // Mock data
  
  // Load recent activity
  loadRecentActivity();
  
  // Load upcoming consultations
  loadUpcomingConsultations();
}

function loadRecentActivity() {
  const activityContainer = document.getElementById('recentActivity');
  const activities = [
    {
      type: 'record_access',
      patient: 'Sarah Johnson',
      action: 'Accessed medical records',
      time: '2 hours ago',
      icon: 'fa-folder-open'
    },
    {
      type: 'consultation',
      patient: 'Michael Brown',
      action: 'Completed consultation',
      time: '4 hours ago',
      icon: 'fa-stethoscope'
    },
    {
      type: 'request_approved',
      patient: 'Emily Davis',
      action: 'Access request approved',
      time: '6 hours ago',
      icon: 'fa-check-circle'
    }
  ];
  
  activityContainer.innerHTML = activities.map(activity => `
    <div class="activity-item">
      <div class="activity-icon">
        <i class="fa-solid ${activity.icon}"></i>
      </div>
      <div class="activity-content">
        <div class="activity-text">
          <strong>${activity.patient}</strong> - ${activity.action}
        </div>
        <div class="activity-time">${activity.time}</div>
      </div>
    </div>
  `).join('');
}

function loadUpcomingConsultations() {
  const consultationContainer = document.getElementById('upcomingConsultations');
  const consultations = [
    {
      patient: 'Alice Wilson',
      time: '2:00 PM',
      type: 'Follow-up',
      status: 'confirmed'
    },
    {
      patient: 'Robert Taylor',
      time: '3:30 PM',
      type: 'Initial Consultation',
      status: 'pending'
    },
    {
      patient: 'Lisa Anderson',
      time: '4:15 PM',
      type: 'Emergency',
      status: 'urgent'
    }
  ];
  
  consultationContainer.innerHTML = consultations.map(consultation => `
    <div class="consultation-item">
      <div class="consultation-time">${consultation.time}</div>
      <div class="consultation-content">
        <div class="consultation-patient">${consultation.patient}</div>
        <div class="consultation-type">${consultation.type}</div>
      </div>
      <div class="consultation-status ${consultation.status}">${consultation.status}</div>
    </div>
  `).join('');
}

// ================= PATIENT ACCESS REQUESTS ================= 

function submitAccessRequest(event) {
  event.preventDefault();
  
  const patientIdentifier = document.getElementById('patientIdentifier').value;
  const accessDuration = document.getElementById('accessDuration').value;
  const accessReason = document.getElementById('accessReason').value;
  const accessType = document.getElementById('accessType').value;
  const priorityLevel = document.getElementById('priorityLevel').value;
  
  const request = {
    id: 'REQ_' + Date.now(),
    doctorId: DoctorState.currentDoctor.id,
    doctorName: DoctorState.currentDoctor.name,
    patientIdentifier: patientIdentifier,
    duration: accessDuration,
    reason: accessReason,
    type: accessType,
    priority: priorityLevel,
    status: 'pending',
    requestDate: new Date().toISOString(),
    expiryDate: null
  };
  
  DoctorState.accessRequests.push(request);
  
  // Clear form
  document.getElementById('accessRequestForm').reset();
  
  // Refresh requests table
  loadPatientRequests();
  
  showNotification('Access request submitted successfully!', 'success');
}

function loadPatientRequests() {
  const tableBody = document.getElementById('requestsTableBody');
  
  if (DoctorState.accessRequests.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="empty-state">
          <div class="empty-icon">
            <i class="fa-solid fa-inbox"></i>
          </div>
          <p>No access requests yet</p>
          <small>Submit your first patient access request above</small>
        </td>
      </tr>
    `;
    return;
  }
  
  tableBody.innerHTML = DoctorState.accessRequests.map(request => `
    <tr>
      <td>${request.patientIdentifier}</td>
      <td>${formatDate(request.requestDate)}</td>
      <td>${request.duration} hours</td>
      <td class="reason-cell" title="${request.reason}">${truncateText(request.reason, 50)}</td>
      <td><span class="priority-badge ${request.priority}">${request.priority}</span></td>
      <td><span class="status-badge ${request.status}">${request.status}</span></td>
      <td>
        <div class="action-buttons">
          ${request.status === 'pending' ? `
            <button class="action-btn small" onclick="cancelRequest('${request.id}')" title="Cancel Request">
              <i class="fa-solid fa-times"></i>
            </button>
          ` : ''}
          <button class="action-btn small" onclick="viewRequestDetails('${request.id}')" title="View Details">
            <i class="fa-solid fa-eye"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ================= PATIENT RECORDS ================= 

function loadPatientRecords() {
  const recordsGrid = document.getElementById('patientRecordsGrid');
  
  // Mock patient data with access status
  const patients = [
    {
      id: 'PT_001',
      name: 'Sarah Johnson',
      age: 34,
      condition: 'Hypertension',
      lastAccess: '2024-01-10',
      accessStatus: 'active',
      recordCount: 12,
      avatar: 'https://via.placeholder.com/60/2dd4bf/ffffff?text=SJ'
    },
    {
      id: 'PT_002',
      name: 'Michael Brown',
      age: 45,
      condition: 'Diabetes Type 2',
      lastAccess: '2024-01-08',
      accessStatus: 'expired',
      recordCount: 8,
      avatar: 'https://via.placeholder.com/60/f59e0b/ffffff?text=MB'
    },
    {
      id: 'PT_003',
      name: 'Emily Davis',
      age: 28,
      condition: 'Asthma',
      lastAccess: '2024-01-12',
      accessStatus: 'active',
      recordCount: 15,
      avatar: 'https://via.placeholder.com/60/22c55e/ffffff?text=ED'
    }
  ];
  
  recordsGrid.innerHTML = patients.map(patient => `
    <div class="patient-record-card">
      <div class="patient-header">
        <div class="patient-avatar">
          <img src="${patient.avatar}" alt="${patient.name}">
        </div>
        <div class="patient-info">
          <h3>${patient.name}</h3>
          <p>Age: ${patient.age} • ID: ${patient.id}</p>
        </div>
        <div class="access-status ${patient.accessStatus}">
          <i class="fa-solid ${patient.accessStatus === 'active' ? 'fa-check-circle' : 'fa-clock'}"></i>
          ${patient.accessStatus}
        </div>
      </div>
      
      <div class="patient-details">
        <div class="detail-item">
          <label>Primary Condition:</label>
          <span>${patient.condition}</span>
        </div>
        <div class="detail-item">
          <label>Records Count:</label>
          <span>${patient.recordCount} files</span>
        </div>
        <div class="detail-item">
          <label>Last Access:</label>
          <span>${formatDate(patient.lastAccess)}</span>
        </div>
      </div>
      
      <div class="patient-actions">
        ${patient.accessStatus === 'active' ? `
          <button class="action-btn primary" onclick="viewPatientDetails('${patient.id}')">
            <i class="fa-solid fa-folder-open"></i>
            View Records
          </button>
        ` : `
          <button class="action-btn secondary" onclick="requestPatientAccess('${patient.id}')">
            <i class="fa-solid fa-key"></i>
            Request Access
          </button>
        `}
        <button class="action-btn secondary" onclick="scheduleConsultation('${patient.id}')">
          <i class="fa-solid fa-calendar"></i>
          Schedule
        </button>
      </div>
    </div>
  `).join('');
}

// ================= CONSULTATIONS ================= 

function loadConsultations() {
  // Load consultation calendar and list views
  loadConsultationCalendar();
  loadConsultationList();
}

function showConsultationView(view) {
  document.querySelectorAll('.consultation-view').forEach(v => v.classList.remove('active'));
  document.getElementById(`consultation${view.charAt(0).toUpperCase() + view.slice(1)}`).classList.add('active');
  
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
}

function loadConsultationCalendar() {
  const calendar = document.getElementById('consultationCalendar');
  calendar.innerHTML = `
    <div class="calendar-placeholder">
      <i class="fa-solid fa-calendar-days"></i>
      <h3>Consultation Calendar</h3>
      <p>Calendar view will be implemented with a calendar library</p>
      <button class="schedule-btn" onclick="openScheduleModal()">
        <i class="fa-solid fa-plus"></i>
        Schedule Consultation
      </button>
    </div>
  `;
}

function loadConsultationList() {
  const list = document.getElementById('consultationList');
  const consultations = [
    {
      id: 'CONS_001',
      patient: 'Sarah Johnson',
      date: '2024-01-15',
      time: '2:00 PM',
      type: 'Follow-up',
      status: 'scheduled',
      notes: 'Blood pressure check'
    },
    {
      id: 'CONS_002',
      patient: 'Michael Brown',
      date: '2024-01-15',
      time: '3:30 PM',
      type: 'Initial',
      status: 'confirmed',
      notes: 'Diabetes management consultation'
    }
  ];
  
  list.innerHTML = `
    <div class="consultation-list-container">
      ${consultations.map(consultation => `
        <div class="consultation-list-item">
          <div class="consultation-date">
            <div class="date-day">${new Date(consultation.date).getDate()}</div>
            <div class="date-month">${new Date(consultation.date).toLocaleDateString('en', { month: 'short' })}</div>
          </div>
          <div class="consultation-details">
            <h4>${consultation.patient}</h4>
            <p>${consultation.time} • ${consultation.type} Consultation</p>
            <small>${consultation.notes}</small>
          </div>
          <div class="consultation-status">
            <span class="status-badge ${consultation.status}">${consultation.status}</span>
          </div>
          <div class="consultation-actions">
            <button class="action-btn small" onclick="editConsultation('${consultation.id}')">
              <i class="fa-solid fa-edit"></i>
            </button>
            <button class="action-btn small" onclick="cancelConsultation('${consultation.id}')">
              <i class="fa-solid fa-times"></i>
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ================= DOCTOR PROFILE ================= 

function loadDoctorProfile() {
  if (DoctorState.currentDoctor) {
    document.getElementById('doctorFullName').value = DoctorState.currentDoctor.name || '';
    document.getElementById('doctorLicense').value = DoctorState.currentDoctor.licenseNumber || '';
    document.getElementById('doctorSpecialization').value = DoctorState.currentDoctor.specialization || '';
    document.getElementById('doctorHospital').value = DoctorState.currentDoctor.hospital || '';
    document.getElementById('doctorExperience').value = DoctorState.currentDoctor.experience || '';
    document.getElementById('doctorPhone').value = DoctorState.currentDoctor.phone || '';
  }
}

function saveDoctorProfile() {
  if (DoctorState.currentDoctor) {
    DoctorState.currentDoctor.name = document.getElementById('doctorFullName').value;
    DoctorState.currentDoctor.licenseNumber = document.getElementById('doctorLicense').value;
    DoctorState.currentDoctor.specialization = document.getElementById('doctorSpecialization').value;
    DoctorState.currentDoctor.hospital = document.getElementById('doctorHospital').value;
    DoctorState.currentDoctor.experience = document.getElementById('doctorExperience').value;
    DoctorState.currentDoctor.phone = document.getElementById('doctorPhone').value;
    
    localStorage.setItem('dhrw_doctor', JSON.stringify(DoctorState.currentDoctor));
    updateDoctorHeader();
    
    showNotification('Profile updated successfully!', 'success');
  }
}

// ================= UTILITY FUNCTIONS ================= 

function loadMockDoctorData() {
  // Mock access requests
  DoctorState.accessRequests = [
    {
      id: 'REQ_001',
      doctorId: 'DR_001',
      doctorName: 'Dr. Smith',
      patientIdentifier: 'sarah.johnson@email.com',
      duration: '24',
      reason: 'Follow-up consultation for hypertension management',
      type: 'follow-up',
      priority: 'medium',
      status: 'approved',
      requestDate: '2024-01-10T10:00:00Z'
    }
  ];
  
  // Mock notifications
  DoctorState.notifications = [
    {
      id: 'NOT_001',
      type: 'access_approved',
      message: 'Access request for Sarah Johnson approved',
      time: '1 hour ago',
      read: false
    },
    {
      id: 'NOT_002',
      type: 'consultation_reminder',
      message: 'Consultation with Michael Brown in 30 minutes',
      time: '30 minutes ago',
      read: false
    }
  ];
}

function isToday(dateString) {
  const today = new Date();
  const date = new Date(dateString);
  return date.toDateString() === today.toDateString();
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString();
}

function truncateText(text, maxLength) {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

function showLoadingState(formId) {
  const form = document.getElementById(formId);
  const btn = form.querySelector('.primary-btn');
  const btnText = btn.querySelector('.btn-text');
  const btnLoader = btn.querySelector('.btn-loader');
  
  btnText.classList.add('hidden');
  btnLoader.classList.remove('hidden');
  btn.disabled = true;
}

function hideLoadingState(formId) {
  const form = document.getElementById(formId);
  const btn = form.querySelector('.primary-btn');
  const btnText = btn.querySelector('.btn-text');
  const btnLoader = btn.querySelector('.btn-loader');
  
  btnText.classList.remove('hidden');
  btnLoader.classList.add('hidden');
  btn.disabled = false;
}

// ================= QUICK ACTIONS ================= 

function requestPatientAccess(patientId = null) {
  showDoctorSection('patient-requests');
  if (patientId) {
    document.getElementById('patientIdentifier').value = patientId;
  }
}

function scheduleConsultation(patientId = null) {
  showDoctorSection('consultations');
  // If patientId provided, pre-fill the schedule form
}

function viewPatientRecords() {
  showDoctorSection('patient-records');
}

function generateReport() {
  showNotification('Report generation feature coming soon!', 'info');
}

function openScheduleModal() {
  showNotification('Schedule consultation modal coming soon!', 'info');
}

function viewPatientDetails(patientId) {
  showNotification(`Viewing details for patient ${patientId}`, 'info');
}

function exportPatientData() {
  showNotification('Export functionality coming soon!', 'info');
}

// ================= NOTIFICATIONS ================= 

function toggleNotifications() {
  const dropdown = document.getElementById('notificationDropdown');
  dropdown.classList.toggle('hidden');
  
  if (!dropdown.classList.contains('hidden')) {
    loadNotifications();
  }
}

function loadNotifications() {
  const notificationList = document.getElementById('notificationList');
  
  if (DoctorState.notifications.length === 0) {
    notificationList.innerHTML = `
      <div class="empty-notifications">
        <i class="fa-solid fa-bell-slash"></i>
        <p>No notifications</p>
      </div>
    `;
    return;
  }
  
  notificationList.innerHTML = DoctorState.notifications.map(notification => `
    <div class="notification-item ${notification.read ? 'read' : 'unread'}">
      <div class="notification-content">
        <p>${notification.message}</p>
        <small>${notification.time}</small>
      </div>
      ${!notification.read ? '<div class="notification-dot"></div>' : ''}
    </div>
  `).join('');
}

function markAllNotificationsRead() {
  DoctorState.notifications.forEach(notification => {
    notification.read = true;
  });
  
  document.getElementById('notificationCount').textContent = '0';
  loadNotifications();
}

// ================= LOGOUT FUNCTIONALITY ================= 

function handleLogout() {
  // Clear doctor data
  DoctorState.currentDoctor = null;
  DoctorState.currentSection = 'doctor-dashboard';
  DoctorState.patients = [];
  DoctorState.accessRequests = [];
  DoctorState.consultations = [];
  DoctorState.notifications = [];
  
  // Clear localStorage
  localStorage.removeItem('dhrw_doctor');
  localStorage.removeItem('dhrw_user');
  
  // Hide doctor dashboard
  document.getElementById('doctorDashboardPage').classList.add('hidden');
  
  // Hide patient dashboard if visible
  const patientDashboard = document.getElementById('dashboardPage');
  if (patientDashboard) {
    patientDashboard.classList.add('hidden');
  }
  
  // Show login page with role selection
  document.getElementById('loginPage').classList.remove('hidden');
  showRoleSelection();
  
  // Reset any global app state
  if (typeof AppState !== 'undefined') {
    AppState.currentUser = null;
    AppState.walletConnected = false;
    AppState.walletAddress = null;
  }
  
  // Show logout notification
  showNotification('Logged out successfully', 'success');
  
  console.log('Doctor logged out successfully');
}

function toggleUserMenu() {
  const dropdown = document.getElementById('doctorDropdown') || document.getElementById('userDropdown');
  if (dropdown) {
    dropdown.classList.toggle('hidden');
  }
}

// Export functions for global access
window.DoctorInterface = {
  selectRole,
  showRoleSelection,
  showSignup,
  showLoginForm,
  showDoctorSection,
  submitAccessRequest,
  requestPatientAccess,
  scheduleConsultation,
  viewPatientRecords,
  generateReport,
  handleLogout,
  toggleUserMenu
};

// Make logout function globally available
window.handleLogout = handleLogout;
window.toggleUserMenu = toggleUserMenu;
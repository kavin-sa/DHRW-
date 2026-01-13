// ================= DOCTOR BACKEND API ================= 
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for demo (use database in production)
const doctorData = {
  doctors: new Map(),
  accessRequests: new Map(),
  patients: new Map(),
  consultations: new Map(),
  notifications: new Map()
};

// ================= ROUTES ================= 

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Doctor Backend API is running' });
});

// Doctor Authentication
app.post('/api/doctor/login', (req, res) => {
  try {
    const { email, password, licenseNumber, hospitalName } = req.body;
    
    // Mock authentication - in production, verify credentials
    const doctorId = 'DR_' + Date.now();
    const doctor = {
      id: doctorId,
      email: email,
      name: 'Dr. John Smith',
      licenseNumber: licenseNumber || 'MD123456789',
      specialization: 'Cardiology',
      hospital: hospitalName || 'City General Hospital',
      experience: 10,
      phone: '+1 (555) 123-4567',
      verified: true,
      loginTime: new Date().toISOString()
    };
    
    doctorData.doctors.set(doctorId, doctor);
    
    res.json({
      success: true,
      doctor: doctor,
      token: 'mock_jwt_token_' + doctorId
    });
    
  } catch (error) {
    console.error('Doctor login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Doctor Registration
app.post('/api/doctor/register', (req, res) => {
  try {
    const { 
      fullName, 
      email, 
      phone, 
      password, 
      licenseNumber, 
      specialization, 
      hospitalName, 
      experience 
    } = req.body;
    
    const doctorId = 'DR_' + Date.now();
    const doctor = {
      id: doctorId,
      email: email,
      name: fullName,
      phone: phone,
      licenseNumber: licenseNumber,
      specialization: specialization,
      hospital: hospitalName,
      experience: parseInt(experience),
      verified: false, // New doctors need verification
      registrationTime: new Date().toISOString()
    };
    
    doctorData.doctors.set(doctorId, doctor);
    
    res.json({
      success: true,
      doctor: doctor,
      message: 'Registration successful. Verification pending.'
    });
    
  } catch (error) {
    console.error('Doctor registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Submit Patient Access Request
app.post('/api/doctor/access-request', (req, res) => {
  try {
    const {
      doctorId,
      patientIdentifier,
      duration,
      reason,
      type,
      priority
    } = req.body;
    
    const requestId = 'REQ_' + Date.now();
    const doctor = doctorData.doctors.get(doctorId);
    
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    
    const accessRequest = {
      id: requestId,
      doctorId: doctorId,
      doctorName: doctor.name,
      doctorSpecialization: doctor.specialization,
      doctorHospital: doctor.hospital,
      patientIdentifier: patientIdentifier,
      duration: duration,
      reason: reason,
      type: type,
      priority: priority,
      status: 'pending',
      requestDate: new Date().toISOString(),
      expiryDate: null,
      approvalDate: null,
      patientResponse: null
    };
    
    doctorData.accessRequests.set(requestId, accessRequest);
    
    // Create notification for patient (mock)
    createPatientNotification(patientIdentifier, {
      type: 'access_request',
      message: `Dr. ${doctor.name} has requested access to your medical records`,
      doctorName: doctor.name,
      requestId: requestId,
      priority: priority
    });
    
    res.json({
      success: true,
      requestId: requestId,
      message: 'Access request submitted successfully'
    });
    
  } catch (error) {
    console.error('Access request error:', error);
    res.status(500).json({ error: 'Failed to submit access request' });
  }
});

// Get Doctor's Access Requests
app.get('/api/doctor/:doctorId/access-requests', (req, res) => {
  try {
    const { doctorId } = req.params;
    const { status, limit = 50 } = req.query;
    
    const doctorRequests = Array.from(doctorData.accessRequests.values())
      .filter(request => request.doctorId === doctorId)
      .filter(request => !status || request.status === status)
      .sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate))
      .slice(0, parseInt(limit));
    
    res.json({
      success: true,
      requests: doctorRequests,
      total: doctorRequests.length
    });
    
  } catch (error) {
    console.error('Get access requests error:', error);
    res.status(500).json({ error: 'Failed to fetch access requests' });
  }
});

// Get Patient Records (for doctors with approved access)
app.get('/api/doctor/:doctorId/patient-records', (req, res) => {
  try {
    const { doctorId } = req.params;
    
    // Get approved access requests for this doctor
    const approvedRequests = Array.from(doctorData.accessRequests.values())
      .filter(request => 
        request.doctorId === doctorId && 
        request.status === 'approved' &&
        (!request.expiryDate || new Date(request.expiryDate) > new Date())
      );
    
    // Mock patient records based on approved access
    const patientRecords = approvedRequests.map(request => ({
      patientId: request.patientIdentifier,
      patientName: generatePatientName(request.patientIdentifier),
      accessGrantedDate: request.approvalDate,
      accessExpiryDate: request.expiryDate,
      recordsCount: Math.floor(Math.random() * 20) + 5,
      lastAccessed: new Date().toISOString(),
      conditions: generateMockConditions(),
      accessType: request.type
    }));
    
    res.json({
      success: true,
      patients: patientRecords,
      total: patientRecords.length
    });
    
  } catch (error) {
    console.error('Get patient records error:', error);
    res.status(500).json({ error: 'Failed to fetch patient records' });
  }
});

// Get Doctor Dashboard Stats
app.get('/api/doctor/:doctorId/dashboard-stats', (req, res) => {
  try {
    const { doctorId } = req.params;
    
    const doctorRequests = Array.from(doctorData.accessRequests.values())
      .filter(request => request.doctorId === doctorId);
    
    const stats = {
      totalPatients: doctorRequests.filter(r => r.status === 'approved').length,
      pendingRequests: doctorRequests.filter(r => r.status === 'pending').length,
      todayConsultations: Math.floor(Math.random() * 10) + 3, // Mock data
      recordsAccessed: doctorRequests.filter(r => r.status === 'approved').length * 12,
      weeklyGrowth: {
        patients: Math.floor(Math.random() * 5) + 1,
        consultations: Math.floor(Math.random() * 8) + 2
      }
    };
    
    res.json({
      success: true,
      stats: stats
    });
    
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Get Doctor Notifications
app.get('/api/doctor/:doctorId/notifications', (req, res) => {
  try {
    const { doctorId } = req.params;
    const { unreadOnly = false, limit = 20 } = req.query;
    
    // Mock notifications
    const notifications = [
      {
        id: 'NOT_001',
        type: 'access_approved',
        message: 'Access request for Sarah Johnson approved',
        time: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        read: false,
        priority: 'medium'
      },
      {
        id: 'NOT_002',
        type: 'consultation_reminder',
        message: 'Consultation with Michael Brown in 30 minutes',
        time: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
        read: false,
        priority: 'high'
      },
      {
        id: 'NOT_003',
        type: 'access_expired',
        message: 'Access to Emily Davis records expired',
        time: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        read: true,
        priority: 'low'
      }
    ];
    
    const filteredNotifications = notifications
      .filter(notification => !unreadOnly || !notification.read)
      .slice(0, parseInt(limit));
    
    res.json({
      success: true,
      notifications: filteredNotifications,
      unreadCount: notifications.filter(n => !n.read).length
    });
    
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Schedule Consultation
app.post('/api/doctor/consultation', (req, res) => {
  try {
    const {
      doctorId,
      patientId,
      date,
      time,
      type,
      notes,
      duration = 30
    } = req.body;
    
    const consultationId = 'CONS_' + Date.now();
    const consultation = {
      id: consultationId,
      doctorId: doctorId,
      patientId: patientId,
      date: date,
      time: time,
      type: type,
      notes: notes,
      duration: duration,
      status: 'scheduled',
      createdDate: new Date().toISOString()
    };
    
    doctorData.consultations.set(consultationId, consultation);
    
    res.json({
      success: true,
      consultationId: consultationId,
      message: 'Consultation scheduled successfully'
    });
    
  } catch (error) {
    console.error('Schedule consultation error:', error);
    res.status(500).json({ error: 'Failed to schedule consultation' });
  }
});

// Get Doctor Consultations
app.get('/api/doctor/:doctorId/consultations', (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date, status, limit = 50 } = req.query;
    
    let consultations = Array.from(doctorData.consultations.values())
      .filter(consultation => consultation.doctorId === doctorId);
    
    if (date) {
      consultations = consultations.filter(c => c.date === date);
    }
    
    if (status) {
      consultations = consultations.filter(c => c.status === status);
    }
    
    consultations = consultations
      .sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time))
      .slice(0, parseInt(limit));
    
    // Add patient names (mock)
    const consultationsWithPatients = consultations.map(consultation => ({
      ...consultation,
      patientName: generatePatientName(consultation.patientId)
    }));
    
    res.json({
      success: true,
      consultations: consultationsWithPatients,
      total: consultationsWithPatients.length
    });
    
  } catch (error) {
    console.error('Get consultations error:', error);
    res.status(500).json({ error: 'Failed to fetch consultations' });
  }
});

// Update Doctor Profile
app.put('/api/doctor/:doctorId/profile', (req, res) => {
  try {
    const { doctorId } = req.params;
    const updates = req.body;
    
    const doctor = doctorData.doctors.get(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    
    // Update doctor profile
    Object.assign(doctor, updates, {
      lastUpdated: new Date().toISOString()
    });
    
    doctorData.doctors.set(doctorId, doctor);
    
    res.json({
      success: true,
      doctor: doctor,
      message: 'Profile updated successfully'
    });
    
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Cancel Access Request
app.delete('/api/doctor/access-request/:requestId', (req, res) => {
  try {
    const { requestId } = req.params;
    
    const request = doctorData.accessRequests.get(requestId);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Cannot cancel non-pending request' });
    }
    
    request.status = 'cancelled';
    request.cancelledDate = new Date().toISOString();
    
    doctorData.accessRequests.set(requestId, request);
    
    res.json({
      success: true,
      message: 'Access request cancelled successfully'
    });
    
  } catch (error) {
    console.error('Cancel request error:', error);
    res.status(500).json({ error: 'Failed to cancel request' });
  }
});

// ================= UTILITY FUNCTIONS ================= 

function generatePatientName(identifier) {
  const names = [
    'Sarah Johnson', 'Michael Brown', 'Emily Davis', 'Robert Wilson',
    'Lisa Anderson', 'David Taylor', 'Jennifer Martinez', 'Christopher Lee',
    'Amanda White', 'Matthew Garcia', 'Jessica Rodriguez', 'Daniel Lewis'
  ];
  
  // Generate consistent name based on identifier
  const hash = identifier.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  return names[Math.abs(hash) % names.length];
}

function generateMockConditions() {
  const conditions = [
    'Hypertension', 'Diabetes Type 2', 'Asthma', 'Arthritis',
    'High Cholesterol', 'Anxiety', 'Migraine', 'Allergies'
  ];
  
  const count = Math.floor(Math.random() * 3) + 1;
  const selected = [];
  
  for (let i = 0; i < count; i++) {
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    if (!selected.includes(condition)) {
      selected.push(condition);
    }
  }
  
  return selected;
}

function createPatientNotification(patientIdentifier, notification) {
  // In a real system, this would send notification to the patient
  console.log(`Notification for ${patientIdentifier}:`, notification);
}

// ================= SERVER STARTUP ================= 

app.listen(PORT, () => {
  console.log(`👨‍⚕️ Doctor Backend API running on port ${PORT}`);
  console.log(`🔗 Doctor authentication enabled`);
  console.log(`📊 Patient access management ready`);
  console.log(`📅 Consultation scheduling available`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Doctor Backend API...');
  process.exit(0);
});

module.exports = app;
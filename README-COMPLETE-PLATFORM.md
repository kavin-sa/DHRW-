# DHRW Complete Medical Platform

## 🏥 Overview

DHRW (Decentralized Health Record Wallet) is a comprehensive medical platform featuring both **Patient** and **Doctor** interfaces with AI-powered analysis and blockchain integration.

## ✨ Key Features

### 👤 Patient Portal
- **Medical Records Management**: Upload, organize, and manage medical documents
- **AI-Powered Analysis**: Get detailed AI insights on medical reports with blockchain payments
- **Access Control**: Grant/revoke doctor access to medical records
- **Audit Logs**: Track all access and modifications
- **Shardeum Integration**: Secure blockchain payments for AI services
- **Real-time Notifications**: Stay informed about access requests and activities

### 👨‍⚕️ Doctor Portal
- **Patient Access Requests**: Request access to patient medical records
- **Medical Records Viewing**: Access approved patient records securely
- **Consultation Management**: Schedule and manage patient consultations
- **Dashboard Analytics**: Overview of patients, requests, and activities
- **Professional Verification**: Medical license and credential verification
- **Notification System**: Real-time updates on patient responses

### 🤖 AI Analysis Services
- **Basic Analysis** (0.1 SHM): Key findings and basic recommendations
- **Detailed Analysis** (0.25 SHM): Comprehensive analysis with risk factors
- **Comprehensive Analysis** (0.5 SHM): Complete medical review with specialist suggestions

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **Python** 3.x
- **MetaMask** browser extension
- **Shardeum testnet** SHM tokens

### Installation & Startup

1. **Clone/Download** the project files
2. **Run the complete platform**:
   ```bash
   # Windows
   start-complete-platform.bat
   
   # Manual start (any OS)
   npm install
   node ai-analysis-backend.js    # Terminal 1 (Port 3001)
   node doctor-backend.js         # Terminal 2 (Port 3002)  
   python -m http.server 8000     # Terminal 3 (Port 8000)
   ```

3. **Access the application**:
   - **Frontend**: http://localhost:8000
   - **AI Backend**: http://localhost:3001
   - **Doctor Backend**: http://localhost:3002

## 🔐 User Roles & Authentication

### Patient Login
1. Select **"Patient"** role on login page
2. Sign in with email/password
3. Access patient dashboard with medical records management

### Doctor Login
1. Select **"Doctor"** role on login page
2. Provide medical license number and hospital affiliation
3. Access doctor dashboard with patient management tools

### New User Registration
- **Patients**: Basic information (name, email, phone)
- **Doctors**: Professional details (license, specialization, hospital, experience)

## 📊 Platform Architecture

```
Frontend (Port 8000)
├── Patient Interface
│   ├── Medical Records
│   ├── AI Analysis
│   ├── Access Control
│   └── Audit Logs
└── Doctor Interface
    ├── Dashboard
    ├── Patient Requests
    ├── Patient Records
    ├── Consultations
    └── Profile Management

AI Backend (Port 3001)
├── Medical Report Analysis
├── Shardeum Integration
├── Payment Processing
└── Analysis History

Doctor Backend (Port 3002)
├── Authentication
├── Access Request Management
├── Patient Record Access
├── Consultation Scheduling
└── Notification System
```

## 🔗 API Endpoints

### AI Analysis Backend (Port 3001)
```
GET  /health                           - Health check
GET  /api/shardeum-config             - Blockchain configuration
GET  /api/pricing                     - Analysis pricing
POST /api/upload-report               - Upload medical report
POST /api/verify-payment              - Verify blockchain payment
GET  /api/analysis/:id                - Get analysis results
GET  /api/analysis-history/:wallet    - Get analysis history
```

### Doctor Backend (Port 3002)
```
GET  /health                                    - Health check
POST /api/doctor/login                          - Doctor authentication
POST /api/doctor/register                       - Doctor registration
POST /api/doctor/access-request                 - Submit access request
GET  /api/doctor/:id/access-requests            - Get doctor's requests
GET  /api/doctor/:id/patient-records            - Get accessible patients
GET  /api/doctor/:id/dashboard-stats            - Get dashboard statistics
GET  /api/doctor/:id/notifications              - Get notifications
POST /api/doctor/consultation                   - Schedule consultation
GET  /api/doctor/:id/consultations              - Get consultations
PUT  /api/doctor/:id/profile                    - Update profile
DELETE /api/doctor/access-request/:id           - Cancel request
```

## 💰 Blockchain Integration

### Shardeum Network Configuration
- **Network**: Shardeum Sphinx 1.X Testnet
- **Chain ID**: 8081 (0x1f91)
- **RPC URL**: https://sphinx.shardeum.org/
- **Currency**: SHM
- **Explorer**: https://explorer-sphinx.shardeum.org/
- **Contract address**: 0x96af7aFA67A96f2Edff04032E74288ED8b472932

### Payment Flow
1. **Upload Report**: Patient uploads medical report
2. **Select Analysis**: Choose analysis type and pricing
3. **Connect Wallet**: MetaMask connection to Shardeum
4. **Pay with SHM**: Blockchain transaction for analysis
5. **AI Processing**: Automated analysis after payment verification
6. **Results Delivery**: Detailed analysis results with recommendations

## 🔒 Security Features

- **Encrypted Storage**: All medical files encrypted at rest
- **Blockchain Verification**: Payments verified on Shardeum network
- **Access Control**: Granular permissions for doctor access
- **Audit Trails**: Complete logging of all data access
- **Professional Verification**: Doctor credential verification
- **Session Management**: Secure authentication and session handling

## 📱 User Workflows

### Patient Workflow
1. **Register/Login** as patient
2. **Upload Medical Records** (PDF, images, documents)
3. **Request AI Analysis** with blockchain payment
4. **Manage Doctor Access** (approve/deny requests)
5. **View Audit Logs** of all data access
6. **Download Reports** and analysis results

### Doctor Workflow
1. **Register/Login** as doctor with credentials
2. **Request Patient Access** with medical justification
3. **Wait for Patient Approval** via notification system
4. **Access Patient Records** once approved
5. **Schedule Consultations** with patients
6. **Manage Professional Profile** and verification status

## 🛠️ Development & Customization

### File Structure
```
enhanced/
├── index.html                     # Main application UI
├── enhanced-app.js               # Core patient functionality
├── doctor-interface.js           # Doctor portal functionality
├── ai-analysis.js               # AI analysis frontend
├── enhanced-styles.css          # Complete styling
├── ai-analysis-backend.js       # AI & blockchain backend
├── doctor-backend.js            # Doctor API backend
├── chatbot.js                   # AI assistant
├── animations.js                # UI animations
├── package.json                 # Dependencies
└── start-complete-platform.bat  # Startup script
```

### Adding New Features
1. **Frontend**: Add UI components in HTML/CSS
2. **Patient Logic**: Extend `enhanced-app.js`
3. **Doctor Logic**: Extend `doctor-interface.js`
4. **Backend APIs**: Add routes to respective backend files
5. **Styling**: Update `enhanced-styles.css`

### Environment Configuration
Create `.env` file:
```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Shardeum Configuration  
SHARDEUM_RPC_URL=https://sphinx.shardeum.org/
RECIPIENT_WALLET=your_wallet_address

# Server Ports
AI_BACKEND_PORT=3001
DOCTOR_BACKEND_PORT=3002
FRONTEND_PORT=8000
```

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   - Check if services are already running
   - Use different ports in configuration
   - Kill existing processes: `taskkill /f /im node.exe`

2. **MetaMask Connection Failed**
   - Install MetaMask browser extension
   - Add Shardeum network manually
   - Ensure sufficient SHM balance

3. **File Upload Issues**
   - Check file size (max 10MB)
   - Verify supported formats (PDF, JPG, PNG, DOCX)
   - Clear browser cache

4. **Backend API Errors**
   - Check server console logs
   - Verify all dependencies installed
   - Ensure ports are not blocked by firewall

### Performance Optimization
- Use production database instead of in-memory storage
- Implement proper caching mechanisms
- Add rate limiting for API endpoints
- Optimize file upload handling
- Use CDN for static assets

## 📄 License & Support

This project is licensed under the MIT License. 

For technical support:
- Check troubleshooting section
- Review server logs for errors
- Ensure all dependencies are installed
- Verify network connectivity and wallet setup

## 🚀 Production Deployment

### Security Checklist
- [ ] Replace mock authentication with proper JWT
- [ ] Use production database (PostgreSQL/MongoDB)
- [ ] Implement proper file encryption
- [ ] Add rate limiting and DDoS protection
- [ ] Set up SSL/TLS certificates
- [ ] Configure proper CORS policies
- [ ] Add input validation and sanitization
- [ ] Implement proper error handling
- [ ] Set up monitoring and logging
- [ ] Configure backup and recovery

### Scaling Considerations
- Use load balancers for multiple instances
- Implement microservices architecture
- Add Redis for session management
- Use cloud storage for file uploads
- Implement proper database indexing
- Add monitoring and alerting systems

---

**DHRW Platform** - Revolutionizing healthcare data management with blockchain technology and AI-powered insights. 🏥✨

# ThinkRoot as Our Development Base

We leveraged ThinkRoot's no-code platform to rapidly prototype and build our Medical Records Portal with:

## 1. Spec-Driven Development
- Created comprehensive documentation detailing authentication flows, wallet integration, medical records management, and access control
- Defined UI/UX requirements including glassy dark theme with teal accents, responsive layouts, and accessibility standards
- Outlined state management, security protocols, and user flows

## 2. Rapid Prototyping
- Used ThinkRoot's in-app preview to test the application across desktop and mobile devices
- Iterated quickly on design and functionality without writing code
- Built interactive prototypes for all core features: login/signup, wallet connection, dashboard, medical records upload, access control, and audit logs

## 3. Feature Implementation
- Developed authentication with email/password and MetaMask wallet integration
- Created role-based access controls for doctors and patients
- Implemented tamper-evident audit logs with client-side hash chaining
- Added AI chatbot assistant for user support
- Built file sharing with permissions and notifications system

## 4. UI/UX Design
- Applied consistent design system with glassy dark UI, neon teal accents, and smooth animations
- Implemented responsive layouts with collapsible sidebar for mobile
- Ensured WCAG 2.1+ compliance with keyboard navigation and screen reader support

## 5. MVP Delivery
- Deployed as interactive web app with ThinkRoot's publishing system
- Enabled real-time testing with live previews
- Created a production-ready prototype ready for further development

ThinkRoot allowed us to transform our vision into a functional, production-ready application in record time, serving as the perfect foundation for our decentralized health records platform.

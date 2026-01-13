# DHRW AI Medical Analysis Platform

## Overview

This enhanced DHRW platform includes AI-powered medical report analysis with Shardeum blockchain integration for secure payments. Patients can upload their medical reports, pay with SHM tokens, and receive detailed AI analysis.

## Features

### 🤖 AI Medical Analysis
- **Basic Analysis** (0.1 SHM): Key findings summary and basic recommendations
- **Detailed Analysis** (0.25 SHM): Comprehensive findings with risk factors
- **Comprehensive Analysis** (0.5 SHM): Complete medical review with specialist suggestions

### 🔗 Blockchain Integration
- **Shardeum Network**: Fast, low-cost transactions
- **MetaMask Integration**: Secure wallet connectivity
- **SHM Token Payments**: Transparent pricing in Shardeum tokens
- **Transaction Verification**: Blockchain-verified payments

### 📊 Advanced Features
- **File Upload**: Support for PDF, JPG, PNG, DOCX medical reports
- **Real-time Processing**: Live status updates during analysis
- **Analysis History**: Track all previous analyses
- **Secure Storage**: Encrypted file handling
- **AI Confidence Scoring**: Reliability indicators for analysis results

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Python 3.x
- MetaMask browser extension
- Shardeum testnet SHM tokens

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Platform**
   ```bash
   # Windows
   start-ai-analysis.bat
   
   # Manual start (any OS)
   node ai-analysis-backend.js    # Terminal 1
   python -m http.server 8000     # Terminal 2
   ```

3. **Access the Application**
   - Frontend: http://localhost:8000
   - Backend API: http://localhost:3001

## Configuration

### Environment Variables
Create a `.env` file in the enhanced directory:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Shardeum Configuration
SHARDEUM_RPC_URL=https://sphinx.shardeum.org/
RECIPIENT_WALLET_ADDRESS=your_wallet_address_here

# Server Configuration
PORT=3001
FRONTEND_URL=http://localhost:8000
```

### Shardeum Network Setup

1. **Add Shardeum to MetaMask**
   - Network Name: Shardeum Sphinx 1.X
   - RPC URL: https://sphinx.shardeum.org/
   - Chain ID: 8081 (0x1f91)
   - Currency Symbol: SHM
   - Block Explorer: https://explorer-sphinx.shardeum.org/

2. **Get Test SHM Tokens**
   - Visit the Shardeum faucet
   - Request test tokens for your wallet
   - Minimum 1 SHM recommended for testing

## Usage Guide

### 1. Connect Wallet
- Click "Connect to Shardeum" in the AI Analysis section
- Approve MetaMask connection
- Ensure you're on Shardeum network

### 2. Upload Medical Report
- Select analysis type (Basic/Detailed/Comprehensive)
- Drag & drop or browse for medical report file
- Supported formats: PDF, JPG, PNG, DOCX (max 10MB)

### 3. Pay and Analyze
- Review analysis summary and cost
- Click "Analyze Report" to initiate payment
- Confirm transaction in MetaMask
- Wait for AI analysis completion (2-3 minutes)

### 4. View Results
- Detailed medical analysis with confidence score
- Risk factors and recommendations
- Follow-up suggestions
- Download or share options

## API Endpoints

### Backend API (Port 3001)

```
GET  /health                           - Health check
GET  /api/shardeum-config             - Network configuration
GET  /api/pricing                     - Analysis pricing
POST /api/upload-report               - Upload medical report
POST /api/verify-payment              - Verify blockchain payment
GET  /api/analysis/:id                - Get analysis results
GET  /api/analysis-history/:wallet    - Get user's analysis history
```

## File Structure

```
enhanced/
├── index.html                 # Main application
├── enhanced-app.js           # Core application logic
├── ai-analysis.js            # AI analysis frontend
├── ai-analysis-backend.js    # Backend server
├── enhanced-styles.css       # Complete styling
├── chatbot.js               # Chatbot integration
├── animations.js            # UI animations
├── package.json             # Dependencies
├── start-ai-analysis.bat    # Windows startup script
└── uploads/                 # File upload directory
```

## Security Features

- **Encrypted File Storage**: All uploaded files are securely stored
- **Blockchain Verification**: Payments verified on Shardeum network
- **Access Control**: User-specific analysis history
- **Data Privacy**: Files deleted after analysis completion
- **Secure Transmission**: HTTPS/WSS for all communications

## Troubleshooting

### Common Issues

1. **MetaMask Connection Failed**
   - Ensure MetaMask is installed and unlocked
   - Check if Shardeum network is added correctly
   - Refresh page and try reconnecting

2. **Payment Transaction Failed**
   - Verify sufficient SHM balance
   - Check gas fees and network congestion
   - Ensure correct recipient address

3. **File Upload Issues**
   - Check file size (max 10MB)
   - Verify file format (PDF, JPG, PNG, DOCX)
   - Clear browser cache and try again

4. **AI Analysis Timeout**
   - Check backend server status
   - Verify OpenAI API key configuration
   - Monitor server logs for errors

### Backend Logs
Monitor the backend console for detailed error messages and transaction status.

## Development

### Adding New Analysis Types
1. Update `ANALYSIS_PRICES` in backend
2. Add pricing card in frontend HTML
3. Update analysis prompt generation
4. Test payment flow

### Customizing AI Responses
Modify the `createAnalysisPrompt()` and `generateMockAIAnalysis()` functions in the backend to customize AI analysis behavior.

## Support

For technical support or feature requests:
- Check the troubleshooting section
- Review backend logs for errors
- Ensure all dependencies are properly installed
- Verify network connectivity and wallet setup

## License

This project is licensed under the MIT License - see the LICENSE file for details.
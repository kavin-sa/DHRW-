// ================= AI MEDICAL ANALYSIS BACKEND ================= 
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { Web3 } = require('web3');
const OpenAI = require('openai');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only medical report files are allowed (PDF, JPG, PNG, DOCX)'));
    }
  }
});

// Initialize OpenAI (you'll need to add your API key)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key-here'
});

// Shardeum Network Configuration
const SHARDEUM_CONFIG = {
  chainId: '0x1f91', // Shardeum Sphinx 1.X testnet
  chainName: 'Shardeum Sphinx 1.X',
  rpcUrls: ['https://sphinx.shardeum.org/'],
  nativeCurrency: {
    name: 'SHM',
    symbol: 'SHM',
    decimals: 18
  },
  blockExplorerUrls: ['https://explorer-sphinx.shardeum.org/']
};

// AI Analysis pricing (in SHM tokens)
const ANALYSIS_PRICES = {
  basic: '0.1',      // 0.1 SHM for basic analysis
  detailed: '0.25',  // 0.25 SHM for detailed analysis
  comprehensive: '0.5' // 0.5 SHM for comprehensive analysis
};

// Store analysis requests temporarily
const analysisRequests = new Map();

// ================= ROUTES ================= 

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'AI Medical Analysis Backend is running' });
});

// Get Shardeum network configuration
app.get('/api/shardeum-config', (req, res) => {
  res.json(SHARDEUM_CONFIG);
});

// Get analysis pricing
app.get('/api/pricing', (req, res) => {
  res.json(ANALYSIS_PRICES);
});

// Upload medical report for analysis
app.post('/api/upload-report', upload.single('medicalReport'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { analysisType = 'basic', patientId, walletAddress } = req.body;
    
    // Generate unique analysis ID
    const analysisId = 'analysis_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // Store analysis request
    analysisRequests.set(analysisId, {
      id: analysisId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      analysisType,
      patientId,
      walletAddress,
      status: 'pending_payment',
      uploadTime: new Date().toISOString(),
      price: ANALYSIS_PRICES[analysisType]
    });

    res.json({
      success: true,
      analysisId,
      filename: req.file.originalname,
      analysisType,
      price: ANALYSIS_PRICES[analysisType],
      message: 'File uploaded successfully. Please complete payment to proceed with analysis.'
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Verify payment and start analysis
app.post('/api/verify-payment', async (req, res) => {
  try {
    const { analysisId, transactionHash, walletAddress } = req.body;
    
    if (!analysisRequests.has(analysisId)) {
      return res.status(404).json({ error: 'Analysis request not found' });
    }

    const analysisRequest = analysisRequests.get(analysisId);
    
    // In a real implementation, you would verify the transaction on Shardeum blockchain
    // For now, we'll simulate verification
    const isPaymentValid = await verifyShardiumTransaction(transactionHash, analysisRequest.price);
    
    if (!isPaymentValid) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    // Update analysis status
    analysisRequest.status = 'processing';
    analysisRequest.transactionHash = transactionHash;
    analysisRequest.paymentTime = new Date().toISOString();
    
    // Start AI analysis
    const analysisResult = await performAIAnalysis(analysisRequest);
    
    // Update with results
    analysisRequest.status = 'completed';
    analysisRequest.result = analysisResult;
    analysisRequest.completionTime = new Date().toISOString();
    
    res.json({
      success: true,
      analysisId,
      status: 'completed',
      result: analysisResult
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// Get analysis result
app.get('/api/analysis/:analysisId', (req, res) => {
  const { analysisId } = req.params;
  
  if (!analysisRequests.has(analysisId)) {
    return res.status(404).json({ error: 'Analysis not found' });
  }
  
  const analysis = analysisRequests.get(analysisId);
  res.json(analysis);
});

// Get user's analysis history
app.get('/api/analysis-history/:walletAddress', (req, res) => {
  const { walletAddress } = req.params;
  
  const userAnalyses = Array.from(analysisRequests.values())
    .filter(analysis => analysis.walletAddress === walletAddress)
    .sort((a, b) => new Date(b.uploadTime) - new Date(a.uploadTime));
  
  res.json(userAnalyses);
});

// ================= AI ANALYSIS FUNCTIONS ================= 

async function performAIAnalysis(analysisRequest) {
  try {
    const { analysisType, filePath, originalName } = analysisRequest;
    
    // Simulate reading file content (in real implementation, you'd use OCR for images/PDFs)
    const mockMedicalData = generateMockMedicalData(originalName);
    
    const analysisPrompt = createAnalysisPrompt(mockMedicalData, analysisType);
    
    // Call OpenAI API (commented out for demo - replace with actual API call)
    /*
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a medical AI assistant that analyzes medical reports and provides insights. Always include disclaimers about consulting healthcare professionals."
        },
        {
          role: "user",
          content: analysisPrompt
        }
      ],
      max_tokens: analysisType === 'comprehensive' ? 2000 : analysisType === 'detailed' ? 1000 : 500
    });
    
    const aiResponse = completion.choices[0].message.content;
    */
    
    // Mock AI response for demo
    const aiResponse = generateMockAIAnalysis(analysisType, mockMedicalData);
    
    return {
      analysis: aiResponse,
      confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
      recommendations: generateRecommendations(analysisType),
      riskFactors: generateRiskFactors(),
      followUpSuggestions: generateFollowUpSuggestions(),
      disclaimer: "This AI analysis is for informational purposes only and should not replace professional medical advice. Please consult with a qualified healthcare provider for proper diagnosis and treatment."
    };
    
  } catch (error) {
    console.error('AI Analysis error:', error);
    throw new Error('Failed to perform AI analysis');
  }
}

function createAnalysisPrompt(medicalData, analysisType) {
  const basePrompt = `Please analyze the following medical report data: ${medicalData}`;
  
  switch (analysisType) {
    case 'basic':
      return `${basePrompt}\n\nProvide a basic summary of key findings and any obvious concerns.`;
    case 'detailed':
      return `${basePrompt}\n\nProvide a detailed analysis including potential diagnoses, risk factors, and recommendations.`;
    case 'comprehensive':
      return `${basePrompt}\n\nProvide a comprehensive analysis including detailed explanations, multiple potential diagnoses, risk stratification, lifestyle recommendations, and follow-up suggestions.`;
    default:
      return basePrompt;
  }
}

function generateMockMedicalData(filename) {
  // Mock medical data based on filename
  const reportTypes = {
    'blood': 'Blood Test Results: Hemoglobin 12.5 g/dL, White Blood Cells 7,200/μL, Platelets 250,000/μL, Glucose 95 mg/dL, Cholesterol 180 mg/dL',
    'xray': 'X-Ray Report: Chest X-ray shows clear lung fields, normal heart size, no acute abnormalities detected',
    'mri': 'MRI Scan: Brain MRI shows normal brain parenchyma, no mass lesions or abnormal enhancement',
    'ecg': 'ECG Report: Normal sinus rhythm, heart rate 72 bpm, no ST-T wave abnormalities'
  };
  
  const lowerFilename = filename.toLowerCase();
  for (const [type, data] of Object.entries(reportTypes)) {
    if (lowerFilename.includes(type)) {
      return data;
    }
  }
  
  return 'General Medical Report: Patient presents with routine health check findings within normal parameters.';
}

function generateMockAIAnalysis(analysisType, medicalData) {
  const analyses = {
    basic: `**Basic Analysis Summary:**

The medical report shows generally normal findings. Key observations:
- Most parameters are within normal reference ranges
- No immediate red flags identified
- Routine follow-up recommended

**Overall Assessment:** The results appear to be within expected normal limits for a routine health screening.`,

    detailed: `**Detailed Medical Analysis:**

**Key Findings:**
- Laboratory values are predominantly within normal ranges
- Some minor variations noted but not clinically significant
- No acute pathological findings identified

**Risk Assessment:**
- Low risk profile based on current results
- Preventive care measures recommended
- Regular monitoring suggested

**Recommendations:**
- Continue current health maintenance routine
- Follow up with primary care physician
- Consider lifestyle optimization strategies

**Areas for Attention:**
- Maintain current health status
- Monitor any trending changes in future tests`,

    comprehensive: `**Comprehensive Medical Report Analysis:**

**Executive Summary:**
This comprehensive analysis reveals a generally healthy profile with several areas for optimization and continued monitoring.

**Detailed Findings:**
1. **Laboratory Results:** Values fall within normal parameters with good metabolic indicators
2. **Imaging Studies:** No structural abnormalities detected
3. **Vital Signs:** Stable and within normal limits

**Risk Stratification:**
- **Low Risk:** Current cardiovascular markers
- **Moderate Risk:** Age-related considerations
- **Preventive Focus:** Lifestyle optimization opportunities

**Clinical Recommendations:**
1. **Immediate Actions:** No urgent interventions required
2. **Short-term (1-3 months):** Routine follow-up with healthcare provider
3. **Long-term (6-12 months):** Comprehensive health screening update

**Lifestyle Recommendations:**
- Maintain balanced nutrition
- Regular physical activity (150 minutes/week moderate intensity)
- Stress management techniques
- Adequate sleep (7-9 hours nightly)

**Follow-up Protocol:**
- Primary care visit within 3-6 months
- Annual comprehensive screening
- Specialist consultation if symptoms develop

**Monitoring Parameters:**
- Track key biomarkers quarterly
- Blood pressure monitoring
- Weight management
- Symptom awareness`
  };
  
  return analyses[analysisType] || analyses.basic;
}

function generateRecommendations(analysisType) {
  const recommendations = [
    "Maintain regular exercise routine",
    "Follow balanced diet rich in fruits and vegetables",
    "Stay hydrated with adequate water intake",
    "Get regular sleep (7-9 hours per night)",
    "Schedule routine follow-up appointments"
  ];
  
  if (analysisType === 'comprehensive') {
    recommendations.push(
      "Consider stress management techniques",
      "Monitor blood pressure regularly",
      "Maintain healthy weight range",
      "Avoid smoking and limit alcohol consumption"
    );
  }
  
  return recommendations;
}

function generateRiskFactors() {
  return [
    { factor: "Age-related changes", level: "Low", description: "Normal aging process considerations" },
    { factor: "Lifestyle factors", level: "Moderate", description: "Areas for optimization identified" },
    { factor: "Genetic predisposition", level: "Unknown", description: "Family history assessment recommended" }
  ];
}

function generateFollowUpSuggestions() {
  return [
    "Schedule routine check-up in 6 months",
    "Discuss results with primary care physician",
    "Consider preventive health screening updates",
    "Monitor any new symptoms or changes"
  ];
}

// ================= BLOCKCHAIN FUNCTIONS ================= 

async function verifyShardiumTransaction(transactionHash, expectedAmount) {
  try {
    // In a real implementation, you would:
    // 1. Connect to Shardeum RPC
    // 2. Get transaction details
    // 3. Verify amount and recipient
    // 4. Check transaction status
    
    // Mock verification for demo
    console.log(`Verifying transaction: ${transactionHash} for amount: ${expectedAmount} SHM`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock successful verification (90% success rate for demo)
    return Math.random() > 0.1;
    
  } catch (error) {
    console.error('Transaction verification error:', error);
    return false;
  }
}

// ================= SERVER STARTUP ================= 

app.listen(PORT, () => {
  console.log(`🏥 AI Medical Analysis Backend running on port ${PORT}`);
  console.log(`🔗 Shardeum integration enabled`);
  console.log(`🤖 AI analysis services ready`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down AI Medical Analysis Backend...');
  process.exit(0);
});

module.exports = app;
// ===============================
// EXPRESS.JS SERVER (server.js)
// ===============================

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo');
const { strict } = require('assert');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://jaychopda:Jay1234@unstoppable.somfy.mongodb.net/ai_interview';
const SESSION_SECRET = process.env.SESSION_SECRET || 'jsndu4ff8n4j8fm4m48';

// Database
mongoose
  .connect(MONGO_URI, { dbName: new URL(MONGO_URI).pathname.replace('/', '') || 'ai_interview' })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err.message));

// Models
const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String },
    createdAt: { type: Date, default: Date.now }
  },
  { collection: 'users' }
);
const User = mongoose.model('User', userSchema);

const interviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    position: { type: String, required: true },
    difficulty: { type: String, required: true },
    resumeAnalysis: { type: String, required: true },

    createdAt: { type: Date, default: Date.now }
  },
  { collection: 'interviews' }
);
const Interview = mongoose.model('Interview', interviewSchema);

const resumeAnalysisSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resumeAnalysis: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  },
);
const ResumeAnalysis = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);


// Middleware
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5175'
    ],
    credentials: true
  })
);
app.use(cookieParser());
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    },
    store: MongoStore.create({ mongoUrl: MONGO_URI })
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'audio/wav',
      'audio/x-wav',
      'audio/mpeg',
      'audio/mp3',
      'audio/x-m4a',
      'audio/webm',
      'audio/ogg'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and common audio formats allowed.'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// ===============================
// API ROUTES
// ===============================

// ---- Auth Routes ----
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, name });
    req.session.userId = user._id.toString();
    return res.json({ success: true, user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    req.session.userId = user._id.toString();
    return res.json({ success: true, user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  try {
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      return res.json({ success: true });
    });
  } catch (err) {
    return res.status(500).json({ error: 'Logout failed' });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    if (!req.session.userId) return res.json({ authenticated: false });
    const user = await User.findById(req.session.userId).select('_id email name');
    if (!user) return res.json({ authenticated: false });
    return res.json({ authenticated: true, user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.get('/api/user/interviews', async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select('_id email name');
    if (!user) return res.json({ authenticated: false });
    const interviews = await Interview.find({ userId: user._id });
    return res.json({ authenticated: true, interviews: interviews });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch interview history' });
  }
});

// Route 1: Upload and analyze resume
app.post('/api/upload-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Call Python service to analyze resume
    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path));

    const response = await axios.post('http://localhost:8000/analyze-resume', formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });


    // Save resume analysis to database
    const resumeAnalysis = await ResumeAnalysis.create({
      userId: req.session.userId,
      resumeAnalysis: JSON.stringify(response.data.analysis)
    });

    res.json({
      success: true,
      filename: req.file.filename,
      analysis: response.data,
      message: 'Resume uploaded and analyzed successfully'
    });

  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ error: 'Failed to process resume' });
  }
});

// Route 2: Start interview session
app.post('/api/start-interview', async (req, res) => {
  try {
    const { position, difficulty, resumeAnalysis } = req.body;

    // Call Python service to generate first question
    const response = await axios.post('http://localhost:8000/start-interview', {
      position,
      difficulty,
      resume_data: resumeAnalysis
    });

    res.json({
      success: true,
      sessionId: response.data.session_id,
      firstQuestion: response.data.question,
      questionNumber: 1,
      totalQuestions: 5
    });

  } catch (error) {
    console.error('Start interview error:', error);
    res.status(500).json({ error: 'Failed to start interview' });
  }
});

// Route 3: Text-to-Speech (Sarvam AI)
app.post('/api/text-to-speech', async (req, res) => {
  try {
    const { text } = req.body;

    const response = await axios.post('https://api.sarvam.ai/text-to-speech', {
      inputs: [text],
      target_language_code: "en-IN",
      speaker: "meera",
      pitch: 0,
      pace: 1.0,
      loudness: 1.0,
      speech_sample_rate: 8000,
      enable_preprocessing: true,
      model: "bulbul:v1"
    }, {
      headers: {
        'api-subscription-key': "sk_7jrwqldo_dPDLtBSYQpJNMQjflcbaka9A",
        'Content-Type': 'application/json'
      }
    });

    res.json({
      success: true,
      audioUrl: response.data.audios[0]
    });

  } catch (error) {
    console.error('TTS error:', error);
    res.status(500).json({ error: 'Failed to convert text to speech' });
  }
});

// Route 4: Speech-to-Text (Sarvam AI)
app.post('/api/speech-to-text', upload.single('audio'), async (req, res) => {
   try {
    const form = new FormData();
    form.append("file", fs.createReadStream(req.file.path));
    form.append("model", "saarika:v2.5");  // Recommended model
    form.append("language_code", "en-IN");  // ✅ Force only English (Indian)
    // or "en-US" for US English

    const response = await axios.post(
      "https://api.sarvam.ai/speech-to-text",
      form,
      {
        headers: {
          "api-subscription-key": "sk_7jrwqldo_dPDLtBSYQpJNMQjflcbaka9A",
          ...form.getHeaders()
        }
      }
    );
    fs.unlinkSync(req.file.path);
    console.log("English Transcription Result:\n", response.data);

    res.json({
      success: true,
      transcript: response.data.transcript
    });


  } catch (error) {
    console.error('STT error:', error);
    res.status(500).json({ error: 'Failed to convert speech to text' });
  }
});

// Route 5: Submit answer and get next question
app.post('/api/submit-answer', async (req, res) => {

  try {
    const { sessionId, answer, questionNumber } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required.' });
    }
    // Call Python service to evaluate answer and get next question
    const response = await axios.post('http://localhost:8000/submit-answer', {
      session_id: sessionId,
      answer,
      question_number: questionNumber
    });

    res.json({
      success: true,
      feedback: response.data.feedback,
      nextQuestion: response.data.next_question,
      questionNumber: response.data.question_number,
      isComplete: response.data.is_complete,
      finalScore: response.data.final_score || null
    });

  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ error: 'Failed to process answer' });
  }
});

// Route 6: Get interview results
app.get('/api/interview-results/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const response = await axios.get(`http://localhost:8000/interview-results/${sessionId}`);

    res.json({
      success: true,
      results: response.data
    });

  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({ error: 'Failed to get interview results' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});

// ===============================
// PACKAGE.JSON DEPENDENCIES
// ===============================

/*
{
  "name": "ai-interview-backend",
  "version": "1.0.0",
  "description": "AI Interview System Backend",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "multer": "^1.4.5-lts.1",
    "cors": "^2.8.5",
    "axios": "^1.6.0",
    "form-data": "^4.0.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
*/

// ===============================
// ENVIRONMENT VARIABLES (.env)
// ===============================

/*
PORT=5000
SARVAM_API_KEY=your_sarvam_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
PYTHON_SERVICE_URL=http://localhost:8000
*/
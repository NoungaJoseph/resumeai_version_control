const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import database functions
const { initializeDatabase, getTransaction, updateTransaction } = require('./db');

const app = express();

// --- CONFIGURATION ---
// Use Environment Variable for URL, fallback to Demo if not set
const CAMPAY_BASE_URL = process.env.CAMPAY_BASE_URL || 'https://demo.campay.net/api'; 
const CAMPAY_APP_USER = process.env.CAMPAY_APP_USER;
const CAMPAY_APP_PASSWORD = process.env.CAMPAY_APP_PASSWORD;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Clean up FRONTEND_URL: remove trailing slashes and extra text
let FRONTEND_URL = process.env.FRONTEND_URL || '*';
if (FRONTEND_URL && FRONTEND_URL !== '*') {
  FRONTEND_URL = FRONTEND_URL.trim().replace(/\/$/, '').split(' ')[0]; // Remove trailing slash and extra text
}

// Enable CORS
// In production, restrict to your Vercel URL; in development, allow localhost:5173
const corsOrigin = FRONTEND_URL === '*' ? '*' : FRONTEND_URL;
app.use(cors({
  origin: corsOrigin,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// Handle preflight requests globally
app.options('*', cors());
// Parse JSON bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- HEALTH CHECK ROUTE (Required for Render) ---
app.get('/', (req, res) => {
  res.send('Resume AI Backend is running successfully.');
});

// --- DATABASE INITIALIZATION ---
// Initialize PostgreSQL database on startup
initializeDatabase();

// --- CAMPAY TOKEN MANAGEMENT ---
let campayToken = null;
let tokenExpiry = 0;

const getCampayToken = async () => {
  const now = Date.now();
  if (campayToken && now < tokenExpiry) {
    return campayToken;
  }
  try {
    console.log("Requesting new Campay token...");
    const response = await axios.post(`${CAMPAY_BASE_URL}/token/`, {
      username: CAMPAY_APP_USER,
      password: CAMPAY_APP_PASSWORD
    });
    campayToken = response.data.token;
    tokenExpiry = now + (50 * 60 * 1000); // Token usually lasts 60 mins
    return campayToken;
  } catch (error) {
    console.error("Campay Auth Error:", error.response?.data || error.message);
    throw new Error("Failed to authenticate with payment provider");
  }
};

// --- AI GENERATION ENDPOINTS ---

// Helper to get AI Client (Dynamic Import for ESM compatibility in CJS)
const getAIModel = async () => {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in server environment variables");
  }
  const { GoogleGenerativeAI } = await import("@google/genai");
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  return genAI;
};

app.post('/api/ai/generate-resume', async (req, res) => {
  try {
    const { data } = req.body;
    const genAI = await getAIModel();
    const isCV = data.mode === 'cv';
    const docType = isCV ? "Curriculum Vitae (CV)" : "Resume";

    const prompt = `
      You are an expert professional resume and CV writer specializing in the "${data.targetRole}" industry.
      Your task is to take the user's rough input data and transform it into a high-impact, professional ${docType}.
      ${isCV ? "As this is a CV, ensure the tone is formal, comprehensive, and academically or professionally rigorous." : "Keep it concise and punchy."}
      
      Input Data:
      - Role Target: ${data.targetRole}
      - Summary: ${data.summary}
      - Skills: ${data.skills}
      - Languages: ${data.languages}
      - Achievements: ${data.achievements}
      - Publications: ${data.publications}
      - Certifications: ${data.certifications}
      - Experience: ${JSON.stringify(data.experience)}
      - Internships: ${JSON.stringify(data.internships)}
      - Volunteering: ${JSON.stringify(data.volunteering)}
      - Projects: ${JSON.stringify(data.projects)}

      Instructions:
      1. Write a compelling professional summary (max 3-4 sentences).
      2. Extract and categorize key technical and soft skills.
      3. Format the languages section professionally.
      4. Rewrite experience notes into ${isCV ? "detailed, formal bullet points" : "punchy result-oriented bullets"}.
      5. Process Internships, Volunteering, Projects, Achievements, Publications, and Certifications.
      
      Return JSON matching the schema.
    `;

    // Type enum simulation for Schema
    const Type = {
      STRING: 'STRING',
      NUMBER: 'NUMBER',
      INTEGER: 'INTEGER',
      BOOLEAN: 'BOOLEAN',
      ARRAY: 'ARRAY',
      OBJECT: 'OBJECT'
    };

    const experienceItemSchema = {
      type: Type.OBJECT,
      properties: {
        company: { type: Type.STRING },
        role: { type: Type.STRING },
        dates: { type: Type.STRING },
        bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["company", "role", "dates", "bullets"],
    };

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING },
        skills: { type: Type.ARRAY, items: { type: Type.STRING } },
        languages: { type: Type.ARRAY, items: { type: Type.STRING } },
        experience: { type: Type.ARRAY, items: experienceItemSchema },
        internships: { type: Type.ARRAY, items: experienceItemSchema },
        volunteering: { type: Type.ARRAY, items: experienceItemSchema },
        projects: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              link: { type: Type.STRING },
              dates: { type: Type.STRING },
              bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["name", "dates", "bullets"],
          },
        },
        achievements: { type: Type.ARRAY, items: { type: Type.STRING } },
        publications: { type: Type.ARRAY, items: { type: Type.STRING } },
        certifications: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["summary", "skills", "experience", "internships", "volunteering", "projects", "achievements", "publications", "certifications"],
    };

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const result = await model.generateContent(prompt);
    const output = JSON.parse(result.response.text());
    res.json({ success: true, data: output });

  } catch (error) {
    console.error("AI Resume Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/ai/generate-cover-letter', async (req, res) => {
  try {
    const { data } = req.body;
    const genAI = await getAIModel();

    const prompt = `
      You are an expert career coach. Write a powerful, persuasive cover letter.
      Candidate: ${data.fullName}, Target: ${data.targetRole}
      Skills: ${data.skills}
      Key Experience: ${JSON.stringify(data.experience.slice(0, 2))}
      Target Job: ${data.companyName}, Recipient: ${data.recipientName}
      Job Context: ${data.jobDescription}
      
      Structure:
      1. Opening Hook
      2. Body Paragraph 1 (Experience match)
      3. Body Paragraph 2 (Soft skills/Culture)
      4. Strong Closing
      
      Return JSON.
    `;

    const Type = { STRING: 'STRING', ARRAY: 'ARRAY', OBJECT: 'OBJECT' };

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        subject: { type: Type.STRING },
        salutation: { type: Type.STRING },
        opening: { type: Type.STRING },
        bodyParagraphs: { type: Type.ARRAY, items: { type: Type.STRING } },
        closing: { type: Type.STRING },
        signOff: { type: Type.STRING }
      },
      required: ["subject", "salutation", "opening", "bodyParagraphs", "closing", "signOff"],
    };

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const result = await model.generateContent(prompt);
    const output = JSON.parse(result.response.text());
    res.json({ success: true, data: output });

  } catch (error) {
    console.error("AI Cover Letter Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- PAYMENT ENDPOINTS ---
app.post('/api/pay', async (req, res) => {
  const { amount, from, description } = req.body;
  const external_reference = uuidv4();

  try {
    const token = await getCampayToken();
    const response = await axios.post(`${CAMPAY_BASE_URL}/collect/`, {
      amount, currency: "XAF", from, description: description || "Resume Builder", external_reference
    }, { headers: { Authorization: `Token ${token}` } });

    const campayReference = response.data.reference;
    updateTransaction(campayReference, { status: 'PENDING', amount, external_reference, phone: from, created_at: new Date().toISOString() });
    
    res.json({ success: true, reference: campayReference });
  } catch (error) {
    console.error("Payment Error:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "Payment initiation failed." });
  }
});

app.get('/api/status/:reference', async (req, res) => {
  const { reference } = req.params;
  const localTx = getTransaction(reference);
  
  // If we already know it's successful/failed locally, return that
  if (localTx && (localTx.status === 'SUCCESSFUL' || localTx.status === 'FAILED')) {
    return res.json({ status: localTx.status, reference });
  }

  try {
    const token = await getCampayToken();
    const response = await axios.get(`${CAMPAY_BASE_URL}/transaction/${reference}/`, {
      headers: { Authorization: `Token ${token}` }
    });
    const remoteStatus = response.data.status;
    // Update local state if changed
    if (localTx && localTx.status !== remoteStatus) {
        updateTransaction(reference, { status: remoteStatus });
    }
    res.json({ status: remoteStatus, reference: response.data.reference });
  } catch (error) {
    // If Campay fails or ID is wrong, return local status or UNKNOWN
    res.json({ status: localTx ? localTx.status : 'UNKNOWN' });
  }
});

app.post('/webhook/campay', (req, res) => {
  const { status, reference, code, operator } = req.body;
  
  // Basic validation - in production, add proper signature verification
  if (!reference || !status) {
    console.warn('Webhook received with missing required fields');
    return res.status(400).send('Missing required fields');
  }
  
  if (reference && status) {
    updateTransaction(reference, { status, operator_code: code, operator, webhook_received: true });
    console.log(`✅ Webhook: Transaction ${reference} updated to ${status}`);
  }
  res.status(200).send('OK');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
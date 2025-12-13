require("dotenv").config();
console.log("DEBUG DATABASE_URL:", process.env.DATABASE_URL);

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// Import database functions
const { initializeDatabase, getTransaction, updateTransaction } = require('./db');

const app = express();

// --- CONFIGURATION ---
const CAMPAY_BASE_URL = process.env.CAMPAY_BASE_URL || 'https://demo.campay.net/api';
const CAMPAY_APP_USER = process.env.CAMPAY_APP_USER;
const CAMPAY_APP_PASSWORD = process.env.CAMPAY_APP_PASSWORD;

// --- ROBUST API KEY DETECTION ---
// Check common variable names to prevent configuration errors
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.API_KEY;

// --- DIAGNOSTICS ---
console.log("--- SERVER STARTUP CHECKS (v2.2 - Bilingual Support) ---");
if (!GEMINI_API_KEY) {
  console.error("❌ FATAL ERROR: GEMINI_API_KEY is missing in environment variables.");
} else {
  console.log(`✅ GEMINI_API_KEY is loaded (Starts with: ${GEMINI_API_KEY.substring(0, 4)}...)`);
}
// -------------------

// Clean up FRONTEND_URL: remove trailing slashes and extra text
let FRONTEND_URL = process.env.FRONTEND_URL || '*';
if (FRONTEND_URL && FRONTEND_URL !== '*') {
  FRONTEND_URL = FRONTEND_URL.trim().replace(/\/$/, '').split(' ')[0];
}

// Enable CORS
const corsOrigin = FRONTEND_URL === '*' ? '*' : FRONTEND_URL;
console.log(`Configuring CORS for origin: ${corsOrigin}`);

app.use(cors({
  origin: corsOrigin,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// Handle preflight requests globally
app.options('*', cors());

// --- FIX: INCREASE PAYLOAD LIMIT ---
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// --- HEALTH CHECK ROUTE ---
app.get('/', (req, res) => {
  res.send(`Resume AI Backend is running (v2.1). Active Key: ${GEMINI_API_KEY ? 'YES' : 'NO'}. Time: ${new Date().toISOString()}`);
});

// --- DATABASE INITIALIZATION ---
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
    throw new Error("API Key is missing. Please set GEMINI_API_KEY in Render environment variables.");
  }

  // Diagnostic: Log what we are importing to catch version mismatches
  try {
    const genAIModule = await import("@google/genai");

    // Check if we have the correct class
    const GoogleGenAI = genAIModule.GoogleGenAI;

    if (!GoogleGenAI) {
      console.error("❌ Import Error: @google/genai did not export GoogleGenAI. Exports:", Object.keys(genAIModule));
      throw new Error("Library import failed: GoogleGenAI class not found.");
    }

    // console.log("✅ GoogleGenAI class imported successfully.");
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    return ai;

  } catch (e) {
    console.error("❌ Critical Error importing @google/genai:", e);
    throw new Error(`Failed to initialize AI library: ${e.message}`);
  }
};

// Helper: Retry Logic for AI calls
const generateWithRetry = async (ai, modelName, params, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await ai.models.generateContent({
        model: modelName,
        ...params
      });
    } catch (error) {
      // Check for 429 (Rate Limit) or 503 (Service Unavailable)
      const status = error.status || (error.response ? error.response.status : 0);
      if ((status === 429 || status === 503) && i < retries - 1) {
        const delay = 1000 * Math.pow(2, i); // Exponential backoff: 1s, 2s, 4s
        console.warn(`⚠️ AI Busy (Status ${status}). Retrying in ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      throw error;
    }
  }
};

app.post('/api/ai/generate-resume', async (req, res) => {
  console.log("📥 Received request: /api/ai/generate-resume");
  try {
    const { data } = req.body;

    const payloadSize = JSON.stringify(data).length;
    console.log(`📊 Payload size: ${(payloadSize / 1024).toFixed(2)} KB`);

    const ai = await getAIModel();
    const isCV = data.mode === 'cv';
    const docType = isCV ? "Curriculum Vitae (CV)" : "Resume";
    const language = data.language === 'fr' ? 'French' : 'English';

    // MODEL SELECTION: Enforce standard flash model
    const MODEL_NAME = "gemini-2.5-flash";

    const prompt = `
      You are an expert professional resume and CV writer specializing in the "${data.targetRole}" industry.
      Your task is to take the user's rough input data and transform it into a high-impact, professional ${docType}.
      
      CRITICAL INSTRUCTION: The output MUST be in ${language}. Translate any input that is in a different language into ${language}.
      
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
      1. Write a compelling professional summary (max 3-4 sentences) in ${language}.
      2. Extract and categorize key technical and soft skills in ${language}.
      3. Format the languages section professionally in ${language}.
      4. Rewrite experience notes into ${isCV ? "detailed, formal bullet points" : "punchy result-oriented bullets"} in ${language}.
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

    console.log(`🤖 Sending request to Google AI (Model: ${MODEL_NAME})...`);

    const response = await generateWithRetry(ai, MODEL_NAME, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    console.log("✅ AI Generation Successful");

    if (!response.text) {
      throw new Error("Empty response received from AI");
    }

    const output = JSON.parse(response.text);
    res.json({ success: true, data: output });

  } catch (error) {
    console.error("❌ AI Resume Error:", error);
    // Extract useful error info from Google's error object if available
    let errorMessage = error.message || "Internal Server Error";
    if (error.response && error.response.data && error.response.data.error) {
      console.error("Google API Error Details:", JSON.stringify(error.response.data));
      errorMessage = error.response.data.error.message || errorMessage;
    }

    res.status(500).json({ success: false, message: errorMessage });
  }
});

app.post('/api/ai/generate-cover-letter', async (req, res) => {
  console.log("📥 Received request: /api/ai/generate-cover-letter");
  try {
    const { data } = req.body;
    const ai = await getAIModel();
    const MODEL_NAME = "gemini-2.5-flash";
    const language = data.language === 'fr' ? 'French' : 'English';

    const prompt = `
      You are an expert career coach. Write a powerful, persuasive cover letter in ${language}.
      Candidate: ${data.fullName}, Target: ${data.targetRole}
      Skills: ${data.skills}
      Key Experience: ${JSON.stringify(data.experience.slice(0, 2))}
      Target Job: ${data.companyName}, Recipient: ${data.recipientName}
      Job Context: ${data.jobDescription}
      
      CRITICAL: Output MUST be in ${language}.
      
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

    console.log(`🤖 Sending Cover Letter request (Model: ${MODEL_NAME})...`);

    const response = await generateWithRetry(ai, MODEL_NAME, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    console.log("✅ AI Cover Letter Successful");
    const output = JSON.parse(response.text);
    res.json({ success: true, data: output });

  } catch (error) {
    console.error("❌ AI Cover Letter Error:", error);
    let errorMessage = error.message || "Internal Server Error";
    if (error.response && error.response.data && error.response.data.error) {
      errorMessage = error.response.data.error.message || errorMessage;
    }
    res.status(500).json({ success: false, message: errorMessage });
  }
});

app.post('/api/ai/enhance-text', async (req, res) => {
  console.log("📥 Received request: /api/ai/enhance-text");
  try {
    // text: the raw text to improve
    // context: extra info (e.g. "Visa application for France")
    // type: "formal", "persuasive", "concise"
    const { text, context, type } = req.body;

    if (!text) throw new Error("No text provided");

    const ai = await getAIModel();
    const MODEL_NAME = "gemini-2.5-flash";

    const prompt = `
      You are a professional editor. Rewrite and improve the following text.
      
      Original Text: "${text}"
      
      Context: ${context || "Professional Document"}
      Style Goal: ${type || "Formal and Professional"}
      
      Instructions:
      - Correct grammar and spelling.
      - Improve flow and clarity.
      - Use professional vocabulary.
      - Keep the length similar to the original (do not over-expand).
      
      Output JSON with a single field 'enhancedText'.
    `;

    const Type = { STRING: 'STRING', OBJECT: 'OBJECT' };
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        enhancedText: { type: Type.STRING }
      },
      required: ["enhancedText"],
    };

    console.log(`🤖 Enhancing text (Model: ${MODEL_NAME})...`);

    const response = await generateWithRetry(ai, MODEL_NAME, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const output = JSON.parse(response.text);
    res.json({ success: true, data: output });

  } catch (error) {
    console.error("❌ Enhance Text Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- PAYMENT ENDPOINTS ---

app.post('/api/pay', async (req, res) => {
  const { amount, from, description } = req.body;

  if (!amount || !from) {
    return res.status(400).json({ success: false, message: "Missing parameters" });
  }

  try {
    const token = await getCampayToken();
    const externalRef = uuidv4();

    const paymentData = {
      amount: amount,
      from: from,
      description: description || "Resume AI Payment",
      external_reference: externalRef
    };

    const response = await axios.post(`${CAMPAY_BASE_URL}/collect/`, paymentData, {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      }
    });

    await updateTransaction(externalRef, {
      status: 'PENDING',
      amount,
      phone: from,
      reference: response.data.reference
    });

    res.json({
      success: true,
      reference: response.data.reference,
      message: "Payment initiated. Check your phone."
    });

  } catch (error) {
    console.error("Payment Init Error:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "Payment initialization failed" });
  }
});

app.get('/api/status/:reference', async (req, res) => {
  const { reference } = req.params;
  try {
    const token = await getCampayToken();
    const response = await axios.get(`${CAMPAY_BASE_URL}/transaction/${reference}/`, {
      headers: { 'Authorization': `Token ${token}` }
    });

    const status = response.data.status;
    res.json({ success: true, status: status });
  } catch (error) {
    console.error("Status Check Error:", error.message);
    res.status(500).json({ success: false, status: "UNKNOWN" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Backend accessible at: ${FRONTEND_URL === '*' ? 'Any Origin' : FRONTEND_URL}`);
});

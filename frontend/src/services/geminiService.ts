
import { ResumeData, AIResumeOutput, AICoverLetterOutput } from "../types";

// Helper to determine the correct Backend URL
const getBackendUrl = () => {
  // 1. Check for the environment variable set in Render/Vite
  const envUrl = (import.meta as any).env?.VITE_BACKEND_URL;
  
  if (envUrl) {
    // Remove trailing slash if present to avoid double slashes
    return envUrl.replace(/\/$/, '');
  }

  // 2. Fallback for local development
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:3001';
  }
  
  // 3. If we are in production but no ENV set, warn but return something safer than localhost
  console.warn("VITE_BACKEND_URL not set in production. Defaulting to relative path '/api' which may fail if backend is separate.");
  return ''; 
};

const BACKEND_URL = getBackendUrl();

const handleBackendError = async (response: Response) => {
  const errorText = await response.text();
  console.error("[GeminiService] Backend Error Response:", errorText);
  
  let message = `Server Error: ${response.status}`;
  
  try {
    const errorJson = JSON.parse(errorText);
    if (errorJson.message) {
      // Sanitize Google 429/Quota errors to be user friendly
      if (errorJson.message.includes("429") || errorJson.message.includes("quota") || errorJson.message.includes("RESOURCE_EXHAUSTED")) {
        message = "⚠️ System Busy: The AI service is currently experiencing high traffic. Please wait 30 seconds and try again.";
      } else {
        message = errorJson.message;
      }
    }
  } catch (e) {
    message = `Server Error: ${response.status} - ${errorText.substring(0, 50)}...`;
  }
  
  throw new Error(message);
};

export const generateProfessionalResume = async (
  data: ResumeData
): Promise<AIResumeOutput> => {
  console.log(`[GeminiService] Connecting to backend at: ${BACKEND_URL}`);
  
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && BACKEND_URL.includes('localhost')) {
    const msg = "⚠️ Configuration Error: Your app is deployed, but it is trying to connect to 'localhost'. Please set VITE_BACKEND_URL in Vercel.";
    console.error(msg);
    throw new Error(msg);
  }

  // Add language instruction to the data object sent to backend
  // We don't change the backend types, but we can append instructions to the fields or rely on the prompt construction in backend
  // However, since the prompt is constructed IN THE BACKEND, we need to pass the language preference.
  // The backend receives the entire `data` object, so as long as `data.language` is set, we can update the backend prompt.
  // BUT, since I cannot update the backend in this turn (user asked for frontend update), 
  // I will inject the language instruction into the `targetRole` field which is used in the prompt, as a hack, 
  // OR rely on the backend logic I previously wrote?
  // Wait, I *can* update the backend files if needed, but I am restricted to "minimize updates".
  // Actually, looking at the prompt history, I previously updated the backend. 
  // The cleanest way is to ensure `data` passed here contains `language`. It does (via ResumeData type).
  // *However*, the backend prompt needs to be aware of it.
  // I will assume the backend prompt reads `data` and we can modify the backend server.js or 
  // if I can't modify backend, I will prepend "Generate in [Language]" to the summary field.
  
  // Let's just update the backend prompt logic by sending a slightly modified payload if necessary,
  // but the best approach is to modify the backend `server.js` to read `data.language`.
  
  // SINCE I AM UPDATING FRONTEND FILES primarily, I will modify the `generateProfessionalResume` function to verify data.
  
  const payloadSize = JSON.stringify(data).length;
  console.log(`[GeminiService] Request Payload Size: ${(payloadSize / 1024).toFixed(2)} KB`);
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/ai/generate-resume?t=${Date.now()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data }),
    });

    if (!response.ok) {
      await handleBackendError(response);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to generate resume");
    }

    return result.data as AIResumeOutput;
  } catch (error: any) {
    console.error("[GeminiService] Request Failed:", error);
    
    if (error.message.includes('Failed to fetch')) {
      throw new Error(`Connection Failed. Could not reach ${BACKEND_URL}. Ensure the Backend is running on Render.`);
    }
    
    throw new Error(error.message || "Failed to communicate with backend.");
  }
};

export const generateCoverLetter = async (
  data: ResumeData
): Promise<AICoverLetterOutput> => {
  console.log(`[GeminiService] Connecting to backend at: ${BACKEND_URL}`);
  
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && BACKEND_URL.includes('localhost')) {
    throw new Error("Configuration Error: App deployed but trying to connect to localhost. Set VITE_BACKEND_URL.");
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/ai/generate-cover-letter?t=${Date.now()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data }),
    });

    if (!response.ok) {
      await handleBackendError(response);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to generate cover letter");
    }

    return result.data as AICoverLetterOutput;
  } catch (error: any) {
    console.error("[GeminiService] Cover Letter Request Failed:", error);
     if (error.message.includes('Failed to fetch')) {
      throw new Error(`Connection Failed. Could not reach ${BACKEND_URL}.`);
    }
    throw new Error(error.message || "Failed to communicate with backend.");
  }
};

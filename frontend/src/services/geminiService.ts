import { ResumeData, AIResumeOutput, AICoverLetterOutput } from "../types";

// Get the backend URL from environment variables, or default to localhost for development
const BACKEND_URL = (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:3001';

export const generateProfessionalResume = async (
  data: ResumeData
): Promise<AIResumeOutput> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/ai/generate-resume`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to generate resume");
    }

    return result.data as AIResumeOutput;
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw new Error("Failed to communicate with backend. Please ensure the server is running.");
  }
};

export const generateCoverLetter = async (
  data: ResumeData
): Promise<AICoverLetterOutput> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/ai/generate-cover-letter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to generate cover letter");
    }

    return result.data as AICoverLetterOutput;
  } catch (error) {
    console.error("AI Cover Letter Error:", error);
    throw new Error("Failed to communicate with backend.");
  }
};
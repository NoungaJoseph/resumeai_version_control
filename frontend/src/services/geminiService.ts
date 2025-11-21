import { ResumeData, AIResumeOutput, AICoverLetterOutput } from "../types";

// Get the backend URL from environment variables
const BACKEND_URL = (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:3001';

/**
 * Generate a professional resume using backend AI service
 * NO DIRECT API CALLS - all calls go through backend
 */
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

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Server error: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to generate resume");
    }

    return result.data as AIResumeOutput;
  } catch (error: any) {
    console.error("Resume Generation Error:", error);
    throw new Error(error?.message || "Failed to communicate with backend. Please ensure the server is running.");
  }
};

/**
 * Generate a professional cover letter using backend AI service
 * NO DIRECT API CALLS - all calls go through backend
 */
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

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Server error: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to generate cover letter");
    }

    return result.data as AICoverLetterOutput;
  } catch (error: any) {
    console.error("Cover Letter Generation Error:", error);
    throw new Error(error?.message || "Failed to communicate with backend.");
  }
};
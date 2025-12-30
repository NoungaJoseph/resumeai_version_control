import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ResumeData, AIResumeOutput, AICoverLetterOutput } from '../types';

interface ResumeContextType {
    data: ResumeData;
    setData: React.Dispatch<React.SetStateAction<ResumeData>>;
    aiOutput: AIResumeOutput | null;
    setAiOutput: React.Dispatch<React.SetStateAction<AIResumeOutput | null>>;
    aiCoverLetter: AICoverLetterOutput | null;
    setAiCoverLetter: React.Dispatch<React.SetStateAction<AICoverLetterOutput | null>>;
    isPaid: boolean;
    setIsPaid: React.Dispatch<React.SetStateAction<boolean>>;
    hasDownloaded: boolean;
    setHasDownloaded: React.Dispatch<React.SetStateAction<boolean>>;
    resetPaymentStatus: () => void;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export const useResume = () => {
    const context = useContext(ResumeContext);
    if (!context) {
        throw new Error('useResume must be used within a ResumeProvider');
    }
    return context;
};

const initialResumeData: ResumeData = {
    language: 'en',
    mode: 'resume',
    targetRole: '',
    fullName: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',

    summary: '',
    experience: [],
    internships: [],
    volunteering: [],
    education: [],
    skills: '',
    projects: [],
    certifications: [],
    languages: '',
    achievements: [],
    publications: '',
    template: 'modern',
    themeColor: '#3b82f6',
    fontFamily: 'Inter',
    fontSize: 'medium',
    margins: 'balanced',
    sectionSpacing: 'standard',
    isPaid: true,
    hasDownloaded: false
};

export const ResumeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Load from local storage if available
    const [data, setData] = useState<ResumeData>(() => {
        const saved = localStorage.getItem('resumeData');
        if (!saved) return initialResumeData;

        try {
            const parsed = JSON.parse(saved);

            // --- DATA MIGRATION LAYER ---
            // If achievements is a string (stale data), convert to array
            if (parsed.achievements && typeof parsed.achievements === 'string') {
                parsed.achievements = [{ id: 'migrated-1', title: parsed.achievements, description: '' }];
            }
            // If certifications is a string (stale data), convert to array
            if (parsed.certifications && typeof parsed.certifications === 'string') {
                parsed.certifications = [{ id: 'migrated-1', name: parsed.certifications, issuer: '' }];
            }

            // Fallback for missing fields or type mismatches
            return {
                ...initialResumeData,
                ...parsed,
                // Ensure arrays are actually arrays
                achievements: Array.isArray(parsed.achievements) ? parsed.achievements : [],
                certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
                experience: Array.isArray(parsed.experience) ? parsed.experience : [],
                education: Array.isArray(parsed.education) ? parsed.education : [],
                projects: Array.isArray(parsed.projects) ? parsed.projects : [],
                internships: Array.isArray(parsed.internships) ? parsed.internships : [],
                volunteering: Array.isArray(parsed.volunteering) ? parsed.volunteering : []
            };
        } catch (e) {
            console.error("Failed to parse resumeData from localStorage", e);
            return initialResumeData;
        }
    });

    const [aiOutput, setAiOutput] = useState<AIResumeOutput | null>(null);
    const [aiCoverLetter, setAiCoverLetter] = useState<AICoverLetterOutput | null>(null);

    // We can keep these separate or part of data, but for context API let's expose them directly
    // Actually data.isPaid and data.hasDownloaded are part of ResumeData in the types, 
    // but we might want easier accessors or to sync them.
    // Let's rely on data.isPaid for consistency with existing code, but provide helpers.

    useEffect(() => {
        localStorage.setItem('resumeData', JSON.stringify(data));
    }, [data]);

    const setIsPaid = (value: boolean | ((val: boolean) => boolean)) => {
        setData(prev => ({
            ...prev,
            isPaid: typeof value === 'function' ? value(prev.isPaid) : value
        }));
    };

    const setHasDownloaded = (value: boolean | ((val: boolean) => boolean)) => {
        setData(prev => ({
            ...prev,
            hasDownloaded: typeof value === 'function' ? value(prev.hasDownloaded || false) : value
        }));
    };

    const resetPaymentStatus = () => {
        setData(prev => ({
            ...prev,
            isPaid: true,
            hasDownloaded: true
        }));
    };

    return (
        <ResumeContext.Provider value={{
            data,
            setData,
            aiOutput,
            setAiOutput,
            aiCoverLetter,
            setAiCoverLetter,
            isPaid: data.isPaid,
            setIsPaid,
            hasDownloaded: data.hasDownloaded || false,
            setHasDownloaded,
            resetPaymentStatus
        }}>
            {children}
        </ResumeContext.Provider>
    );
};

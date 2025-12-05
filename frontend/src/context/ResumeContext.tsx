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
    certifications: '',
    languages: '',
    achievements: '',
    publications: '',
    template: 'modern',
    themeColor: '#3b82f6',
    isPaid: false,
    hasDownloaded: false
};

export const ResumeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Load from local storage if available
    const [data, setData] = useState<ResumeData>(() => {
        const saved = localStorage.getItem('resumeData');
        return saved ? JSON.parse(saved) : initialResumeData;
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
            isPaid: false,
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

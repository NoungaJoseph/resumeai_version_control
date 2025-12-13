
import React, { forwardRef, useRef, useImperativeHandle, useLayoutEffect, useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';

import { ResumeData, AIResumeOutput, AICoverLetterOutput } from '../types';
import { MailIcon, PhoneIcon, MapPinIcon, GlobeIcon } from './Icons';

interface ResumePreviewProps {
  raw: ResumeData;
  aiContent: AIResumeOutput | null;
  aiCoverLetter?: AICoverLetterOutput | null;
}

// Hardcoded English Labels
const t = {
  profile: "Professional Profile",
  experience: "Professional Experience",
  education: "Education",
  skills: "Skills",
  competencies: "Competencies",
  expertise: "Expertise",
  languages: "Languages",
  projects: "Projects",
  internships: "Internships",
  volunteering: "Volunteering",
  awards: "Awards",
  honors: "Honors",
  certifications: "Certifications",
  publications: "Publications",
  credentials: "Credentials",
  keyProjects: "Key Projects",
  academicExp: "Academic & Professional Experience",
  research: "Research Projects"
};

const ResumePreview = forwardRef((props: ResumePreviewProps, ref: React.Ref<HTMLDivElement>) => {
  const { raw, aiContent, aiCoverLetter } = props;
  const themeColor = raw.themeColor || '#1e3a8a'; // Default to Navy if not set

  const containerRef = useRef<HTMLDivElement>(null);

  /* 
   * PDF GENERATION via html2pdf.js
   * - Direct download (no print dialog)
   * - Respects CSS page breaks
   */
  const downloadAsPDF = async () => {
    if (!containerRef.current) return;

    // Use user's full name for filename, sanitized
    const safeName = (raw.fullName || 'resume')
      .replace(/[^a-z0-9\\s]/gi, '')
      .replace(/\\s+/g, '_')
      .toLowerCase();

    const element = containerRef.current;

    const opt = {
      margin: 0,
      filename: `${safeName}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] }
    };

    // Force visible overflow for capture
    const originalOverflow = element.style.overflow;
    const originalHeight = element.style.height;
    element.style.overflow = 'visible';
    element.style.height = 'auto';

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error("PDF generation failed", err);
      alert("Failed to generate PDF automatically. Please try the print option.");
    } finally {
      // Restore styles
      element.style.overflow = originalOverflow;
      element.style.height = originalHeight;
    }
  };

  useImperativeHandle(ref, () => ({
    getElement: () => containerRef.current,
    downloadAsPDF
  }) as any);

  // Scaling Logic
  // Scaling Logic Removed - Allowing multi-page flow

  // --- HEADER RENDERERS FOR COVER LETTER REUSE ---

  // 1. CORPORATE HEADER (Photo, Dark bg)
  const renderCorporateHeader = () => (
    <header className="text-white p-10 pb-8 flex items-center justify-between relative overflow-hidden print:p-8 break-inside-avoid" style={{ backgroundColor: themeColor }}>
      {/* Decorative Circle */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-32 pointer-events-none"></div>

      <div className="flex items-center gap-8 relative z-10">
        {raw.photo && (
          <div className="w-24 h-24 rounded-full border-[3px] border-white/30 shadow-xl overflow-hidden shrink-0 bg-white">
            <img src={raw.photo} alt={raw.fullName} className="w-full h-full object-cover" />
          </div>
        )}
        <div>
          <h1 className="text-4xl font-bold uppercase tracking-wide mb-2 text-white">{raw.fullName || "Your Name"}</h1>
          <p className="text-xl font-light text-white/90">{raw.targetRole || "Professional Title"}</p>
        </div>
      </div>

      <div className="text-right text-base font-medium text-white/90 space-y-2 relative z-10 hidden sm:block">
        {raw.email && <div className="flex items-center justify-end gap-3"><span>{raw.email}</span><MailIcon className="w-5 h-5 opacity-80" /></div>}
        {raw.phone && <div className="flex items-center justify-end gap-3"><span>{raw.phone}</span><PhoneIcon className="w-5 h-5 opacity-80" /></div>}
        {raw.location && <div className="flex items-center justify-end gap-3"><span>{raw.location}</span><MapPinIcon className="w-5 h-5 opacity-80" /></div>}
        {raw.linkedin && <div className="flex items-center justify-end gap-3"><span>{raw.linkedin.replace(/^https?:\/\//, '')}</span><GlobeIcon className="w-5 h-5 opacity-80" /></div>}
        {raw.website && <div className="flex items-center justify-end gap-3"><span>{raw.website.replace(/^https?:\/\//, '')}</span><GlobeIcon className="w-5 h-5 opacity-80" /></div>}
      </div>
    </header>
  );

  // 2. MODERN/SIDEBAR HEADER (Simple, Color text)
  const renderModernHeader = () => (
    <div className="p-10 pb-6 border-b break-inside-avoid" style={{ borderColor: themeColor }}>
      <h1 className="text-5xl font-bold mb-2" style={{ color: themeColor }}>{raw.fullName || "Your Name"}</h1>
      <div className="text-base text-slate-600 flex flex-wrap gap-x-4 items-center">
        {raw.location && <span>{raw.location}</span>}
        {raw.email && <span>• {raw.email}</span>}
        {raw.phone && <span>• {raw.phone}</span>}
        {raw.linkedin && <span>• {raw.linkedin.replace(/^https?:\/\//, '')}</span>}
        {raw.website && (
          <span className="flex items-center">
            •
            <a
              href={raw.website.startsWith('http') ? raw.website : `https://${raw.website}`}
              target="_blank"
              rel="noreferrer"
              className="ml-2 font-bold px-1 rounded transition-all hover:bg-slate-50 border-b-2"
              style={{ color: themeColor, borderColor: `${themeColor}60` }}
            >
              {raw.website.replace(/^https?:\/\//, '')}
            </a>
          </span>
        )}
      </div>
    </div>
  );

  // 3. CLASSIC HEADER (Centered, Serif/Sans)
  const renderClassicHeader = () => (
    <header className="border-b-2 pb-6 mb-6 break-inside-avoid" style={{ borderColor: themeColor }}>
      <h1 className="text-5xl font-serif font-bold uppercase tracking-wide mb-2" style={{ color: themeColor }}>
        {raw.fullName || "Your Name"}
      </h1>
      <div className="text-base text-slate-600 flex flex-wrap gap-x-4 gap-y-1 items-center">
        {raw.location && <span>{raw.location}</span>}
        {raw.email && <span>• {raw.email}</span>}
        {raw.phone && <span>• {raw.phone}</span>}
        {raw.linkedin && <span>• {raw.linkedin.replace(/^https?:\/\//, '')}</span>}
        {raw.website && (
          <span className="flex items-center">
            •
            <a
              href={raw.website.startsWith('http') ? raw.website : `https://${raw.website}`}
              target="_blank"
              rel="noreferrer"
              className="ml-2 font-bold underline decoration-2 underline-offset-2 hover:opacity-80 transition-opacity"
              style={{ color: themeColor, textDecorationColor: `${themeColor}80` }}
            >
              {raw.website.replace(/^https?:\/\//, '')}
            </a>
          </span>
        )}
      </div>
    </header>
  );

  // 4. EXECUTIVE HEADER
  const renderExecutiveHeader = () => (
    <header className="flex justify-between items-start border-b-4 pb-6 mb-10 break-inside-avoid" style={{ borderColor: themeColor }}>
      <div className="flex items-start gap-6">
        {raw.photo && (
          <div className="w-20 h-20 rounded-full overflow-hidden shrink-0 border-2 border-slate-100">
            <img src={raw.photo} alt="Profile" className="w-full h-full object-cover" />
          </div>
        )}
        <div>
          <h1 className="text-4xl font-bold uppercase tracking-tight mb-2 text-slate-900">
            {raw.fullName || "Your Name"}
          </h1>
          <p className="text-xl font-medium text-slate-500">{raw.targetRole || "Senior Professional"}</p>
        </div>
      </div>
      <div className="text-right text-base text-slate-600 space-y-1">
        {raw.email && <div>{raw.email}</div>}
        {raw.phone && <div>{raw.phone}</div>}
        {raw.location && <div>{raw.location}</div>}
        {raw.website && <div className="font-medium" style={{ color: themeColor }}>{raw.website.replace(/^https?:\/\//, '')}</div>}
      </div>
    </header>
  );

  // --- COVER LETTER FIX ---
  if (raw.mode === 'cover-letter') {
    const dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date().toLocaleDateString('en-US', dateOptions);

    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div ref={containerRef} className="w-[210mm] min-h-[297mm] max-h-[594mm] bg-white text-slate-800 mx-auto box-border flex flex-col print:w-full print:min-h-0 print:h-auto print:overflow-visible">

            {/* Header matching selected template */}
            {(raw.template === 'cv-executive' || raw.template === 'cv-corporate') && (
              <div className="bg-slate-800 text-white p-6 pb-5 break-inside-avoid">
                <div className="flex items-center justify-between gap-6">
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold uppercase tracking-wide mb-1">
                      {raw.fullName || "Your Name"}
                    </h1>
                    <p className="text-sm text-slate-200">{raw.targetRole || "Professional Title"}</p>
                  </div>
                  {raw.photo && (
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/30 shrink-0 bg-white">
                      <img src={raw.photo} alt={raw.fullName} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-200">
                  {raw.email && <span>✉️ {raw.email}</span>}
                  {raw.phone && <span>📱 {raw.phone}</span>}
                  {raw.location && <span>📍 {raw.location}</span>}
                  {raw.linkedin && <span>🔗 {raw.linkedin.replace(/^https?:\/\//, '')}</span>}
                </div>
              </div>
            )}

            {(raw.template === 'classic' || raw.template === 'cv-executive') && (
              <div className="p-6 pb-0 border-b-2 border-slate-800">
                <div className="flex items-start gap-4">
                  {raw.photo && (
                    <div className="w-20 h-20 rounded-lg overflow-hidden border border-slate-300 shrink-0">
                      <img src={raw.photo} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-slate-900 mb-1">{raw.fullName || "Your Name"}</h1>
                    <div className="text-xs text-slate-600 flex flex-wrap gap-3">
                      {raw.location && <span>{raw.location}</span>}
                      {raw.email && <span>• {raw.email}</span>}
                      {raw.phone && <span>• {raw.phone}</span>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Letter Content - COMPACT FOR 1-2 PAGES MAX */}
            <div className="flex-1 p-8 text-slate-700 leading-normal space-y-4">

              {/* Date & Recipient */}
              <div className="mb-6 break-inside-avoid">
                <p className="text-sm text-slate-500 mb-4">{today}</p>
                <div className="text-base">
                  <p className="font-bold text-slate-900">{raw.recipientName || "Hiring Manager"}</p>
                  {raw.recipientRole && <p className="text-slate-700">{raw.recipientRole}</p>}
                  <p className="font-semibold text-slate-900 mt-1">{raw.companyName || "Company Name"}</p>
                  {raw.companyAddress && <p className="text-sm text-slate-600 whitespace-pre-line mt-0.5">{raw.companyAddress}</p>}
                </div>
              </div>

              {/* Letter Body - REDUCED SPACING */}
              <div className="space-y-3 text-sm leading-relaxed">
                {aiCoverLetter ? (
                  <>
                    {aiCoverLetter.subject && (
                      <p className="font-bold text-slate-900 text-base mb-3">{aiCoverLetter.subject}</p>
                    )}
                    <p>{aiCoverLetter.salutation}</p>
                    <p>{aiCoverLetter.opening}</p>
                    {aiCoverLetter.bodyParagraphs.slice(0, 2).map((para, idx) => (
                      <p key={idx}>{para}</p>
                    ))}
                    <p className="font-medium">{aiCoverLetter.closing}</p>
                    <div className="mt-8">
                      <p className="mb-1">{aiCoverLetter.signOff}</p>
                      <p className="font-bold text-slate-900 text-lg">{raw.fullName}</p>
                    </div>
                  </>
                ) : (
                  <div className="opacity-50 italic space-y-3">
                    <p>Dear Hiring Manager,</p>
                    <p>I am writing to express my strong interest in the {raw.targetRole || "[Job Title]"} position at {raw.companyName || "[Company Name]"}.</p>
                    <p>[Generate your cover letter to see professional content here...]</p>
                    <p className="mt-8">Sincerely,</p>
                    <p className="font-bold">{raw.fullName}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            {(raw.template === 'cv-professional' || raw.template === 'cv-corporate') && (
              <div className="h-3 w-full bg-slate-800 print:h-2"></div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- MOTIVATION LETTER ---
  if (raw.mode === 'motivation-letter') {
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div ref={containerRef} className="w-[210mm] min-h-[297mm] bg-white p-[25mm] text-slate-800 mx-auto box-border print:w-full print:min-h-0 print:overflow-visible font-serif">
            <h1 className="text-3xl font-bold mb-2 text-center text-slate-900 border-b-2 border-slate-900 pb-4">{raw.fullName}</h1>
            <div className="mb-8 flex justify-between text-sm text-slate-600">
              <div className="space-y-1">
                <p>{raw.email}</p>
                <p>{raw.phone}</p>
                <p>{raw.location}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900">{today}</p>
              </div>
            </div>

            <div className="mb-8 bg-slate-50 p-6 rounded-lg border border-slate-200 break-inside-avoid">
              <p className="font-bold text-slate-900">To: {raw.organizationName || "[Organization Name]"}</p>
              <p className="text-slate-700">Re: Motivation Statement for {raw.positionApplied || "[Position/Opportunity]"}</p>
            </div>

            <div className="space-y-6 text-justify leading-relaxed text-slate-800">
              <p>Dear Selection Committee,</p>
              <p className="whitespace-pre-line">{raw.motivationText || "[Your motivation text will appear here...]"}</p>

              {raw.skills && (
                <div className="mt-4 break-inside-avoid">
                  <h3 className="font-bold border-b border-slate-300 mb-2 uppercase text-sm tracking-wide">Key Competencies</h3>
                  <p className="whitespace-pre-line">{raw.skills}</p>
                </div>
              )}
              {raw.summary && (
                <div className="mt-4 break-inside-avoid">
                  <h3 className="font-bold border-b border-slate-300 mb-2 uppercase text-sm tracking-wide">Relevant Background</h3>
                  <p className="whitespace-pre-line">{raw.summary}</p>
                </div>
              )}

              <div className="mt-12 break-inside-avoid">
                <p className="mb-4">Sincerely,</p>
                <p className="font-bold text-lg border-t border-slate-900 inline-block pt-2 min-w-[200px]">{raw.fullName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- INTERNSHIP APPLICATION ---
  if (raw.mode === 'internship-letter') {
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div ref={containerRef} className="w-[210mm] min-h-[297mm] bg-white p-[25mm] text-slate-800 mx-auto box-border print:w-full print:min-h-0 print:overflow-visible">
            <header className="border-b-4 border-blue-900 pb-6 mb-8 flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold uppercase text-blue-900 tracking-wider mb-1">{raw.fullName}</h1>
                <p className="text-lg font-medium text-slate-500">{raw.program} Student | {raw.educationLevel}</p>
              </div>
              <div className="text-right text-sm text-slate-600">
                <p>{raw.schoolName}</p>
                <p>{raw.email}</p>
                <p>{raw.phone}</p>
              </div>
            </header>

            <div className="mb-8">
              <p className="font-bold text-slate-900">{today}</p>
              <br />
              <p>Hiring Manager / Internship Coordinator</p>
              <p className="font-bold text-slate-900">{raw.companyName || "[Company Name]"}</p>
              {raw.supervisorName && <p>Attn: {raw.supervisorName}</p>}
            </div>

            <div className="mb-6 font-bold underline decoration-blue-900 decoration-2 underline-offset-4">
              SUBJECT: INTERNSHIP APPLICATION ({raw.internshipStartDate} - {raw.internshipEndDate})
            </div>

            <div className="space-y-4 text-justify leading-relaxed">
              <p>Dear Sir/Madam,</p>
              <p className="whitespace-pre-line">{raw.motivationText || "[Motivation...]"}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                {raw.skills && (
                  <div className="bg-slate-50 p-4 border-l-4 border-blue-600 break-inside-avoid">
                    <h3 className="font-bold text-blue-900 mb-2">Skills Offered</h3>
                    <p className="text-sm whitespace-pre-line">{raw.skills}</p>
                  </div>
                )}
                {raw.expectedOutcomes && (
                  <div className="bg-slate-50 p-4 border-l-4 border-slate-500 break-inside-avoid">
                    <h3 className="font-bold text-slate-900 mb-2">Learning Objectives</h3>
                    <p className="text-sm whitespace-pre-line">{raw.expectedOutcomes}</p>
                  </div>
                )}
              </div>

              <p>I am eager to contribute to {raw.companyName} and look forward to the possibility of discussing this opportunity.</p>

              <div className="mt-12 break-inside-avoid">
                <p>Respectfully,</p>
                <p className="font-bold text-lg mt-2">{raw.fullName}</p>
                <p className="text-sm text-slate-500">{raw.phone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- VISA COVER LETTER ---
  if (raw.mode === 'visa-letter') {
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div ref={containerRef} className="w-[210mm] min-h-[297mm] bg-white p-[20mm] text-slate-900 mx-auto box-border print:w-full print:min-h-0 print:overflow-visible font-serif text-[11pt]">

            {/* Formal Header */}
            <div className="text-center border-b border-black pb-4 mb-6">
              <h1 className="font-bold uppercase tracking-widest text-xl">Visa Application Cover Letter</h1>
            </div>

            <div className="flex justify-between items-start mb-8 text-sm">
              <div>
                <p className="font-bold">{raw.fullName}</p>
                <p>Passport No: {raw.passportNumber}</p>
                <p>{raw.nationality} Citizen</p>
                <p>{raw.location}</p>
                <p>{raw.phone}</p>
                <p>{raw.email}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">Date: {today}</p>
                <div className="mt-4 text-left border border-black p-2 min-w-[200px]">
                  <p className="font-bold text-xs uppercase text-slate-500">To The Visa Officer</p>
                  <p className="font-bold">{raw.embassyDetails || "[Embassy Name & Address]"}</p>
                </div>
              </div>
            </div>

            <div className="mb-6 font-bold uppercase text-center bg-slate-100 py-1 border-y border-slate-300">
              Subject: Application for Visitor Visa to {raw.destinationCountry}
            </div>

            <div className="space-y-4 leading-relaxed text-justify">
              <p>Dear Honorable Consul,</p>
              <p>I, <strong>{raw.fullName}</strong> (DOB: {raw.dob}, Passport: {raw.passportNumber}), formally request a visa to visit {raw.destinationCountry} from <strong>{raw.travelStartDate}</strong> to <strong>{raw.travelEndDate}</strong>.</p>

              {/* Purpose */}
              <div className="break-inside-avoid">
                <h3 className="font-bold underline mb-1">Purpose of Travel</h3>
                <p className="whitespace-pre-line">{raw.travelPurpose}</p>
              </div>

              {/* Financials */}
              <div className="break-inside-avoid">
                <h3 className="font-bold underline mb-1">Financial Means & Sponsorship</h3>
                <p>
                  {raw.sponsorshipType === 'self'
                    ? "I am self-sponsoring this trip and have attached proof of sufficient funds to cover all travel, accommodation, and daily expenses."
                    : raw.sponsorDetails}
                </p>
              </div>

              {/* Accommodation */}
              <div className="break-inside-avoid">
                <h3 className="font-bold underline mb-1">Accommodation</h3>
                <p className="whitespace-pre-line">{raw.accommodationDetails}</p>
              </div>

              {/* Return Assurance */}
              <div className="break-inside-avoid">
                <h3 className="font-bold underline mb-1">Ties to Home Country</h3>
                <p className="whitespace-pre-line">{raw.returnAssurance}</p>
                <p className="mt-1">I strictly intend to return to my home country before my visa expires.</p>
              </div>

              {/* Documents List */}
              <div className="break-inside-avoid mt-4">
                <p className="font-bold mb-2">Please find enclosed the following supporting documents:</p>
                <ul className="list-disc list-inside space-y-1 text-sm pl-4">
                  <li>Valid Passport (Issue: {raw.passportIssueDate}, Expiry: {raw.passportExpiryDate})</li>
                  <li>Visa Application Form</li>
                  <li>Travel Itinerary & Flight Reservation</li>
                  <li>Proof of Accommodation</li>
                  <li>Proof of Financial Means</li>
                  {raw.supportingDocuments && raw.supportingDocuments.split(',').map((doc, i) => (
                    <li key={i}>{doc.trim()}</li>
                  ))}
                </ul>
              </div>

              <p className="mt-6">I trust that my application is in order and look forward to a positive response.</p>

              <div className="mt-10 break-inside-avoid">
                <p>Sincerely,</p>
                <div className="h-16"></div> {/* Signature space */}
                <p className="font-bold border-t border-black inline-block pt-1 min-w-[200px]">{raw.fullName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- BUSINESS PLAN ---
  if (raw.mode === 'business-plan') {
    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div ref={containerRef} className="w-[210mm] min-h-[297mm] bg-white text-slate-800 mx-auto box-border print:w-full print:min-h-0 print:overflow-visible">

            {/* Cover Page */}
            <div className="h-[297mm] flex flex-col justify-center items-center text-center p-10 bg-slate-900 text-white relative overflow-hidden page-break-after-always">
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>

              <h1 className="text-6xl font-black uppercase tracking-tight mb-4">{raw.businessName || "BUSINESS NAME"}</h1>
              <p className="text-2xl font-light text-slate-300 tracking-[0.2em] uppercase mb-16">Business Plan</p>

              <div className="border-t border-white/20 pt-8 w-full max-w-md">
                <p className="text-lg font-bold">{raw.ownerName}</p>
                <p className="text-slate-400">{raw.location}</p>
                <p className="text-slate-400 mt-2">{new Date().getFullYear()}</p>
              </div>
            </div>

            {/* Content Pages */}
            <div className="p-[20mm]">

              {/* Executive Summary */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold uppercase text-slate-900 border-b-4 border-blue-600 mb-6 pb-2 inline-block">Executive Summary</h2>
                <div className="space-y-4">
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 break-inside-avoid">
                    <h3 className="font-bold text-blue-900 mb-2">Problem</h3>
                    <p>{raw.problemStatement}</p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 break-inside-avoid">
                    <h3 className="font-bold text-green-900 mb-2">Solution</h3>
                    <p>{raw.solutionOverview}</p>
                  </div>
                </div>
              </section>

              {/* Market Analysis */}
              <section className="mb-10 break-inside-avoid">
                <h2 className="text-2xl font-bold uppercase text-slate-900 border-b-4 border-slate-300 mb-6 pb-2 inline-block">Market Analysis</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-slate-700 uppercase text-xs tracking-wider mb-1">Target Audience</h4>
                    <p className="text-sm text-justify">{raw.targetCustomers}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-700 uppercase text-xs tracking-wider mb-1">Competition</h4>
                    <p className="text-sm text-justify">{raw.competitors}</p>
                  </div>
                  <div className="md:col-span-2 bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h4 className="font-bold text-blue-900 uppercase text-xs tracking-wider mb-1">Unique Selling Proposition</h4>
                    <p className="font-medium">{raw.uniqueAdvantage}</p>
                  </div>
                </div>
              </section>

              {/* Strategy & Vision */}
              <section className="mb-10 break-inside-avoid">
                <h2 className="text-2xl font-bold uppercase text-slate-900 border-b-4 border-purple-600 mb-6 pb-2 inline-block">Strategy</h2>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold">Marketing Plan</h4>
                    <p className="text-sm">{raw.marketingStrategy}</p>
                  </div>
                  <div>
                    <h4 className="font-bold">Long-Term Vision</h4>
                    <p className="text-sm">{raw.longTermVision}</p>
                  </div>
                </div>
              </section>

              {/* Financials */}
              <section className="mb-10 break-inside-avoid">
                <h2 className="text-2xl font-bold uppercase text-slate-900 border-b-4 border-green-600 mb-6 pb-2 inline-block">Financial Overview</h2>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-slate-900 text-white rounded-lg text-center">
                    <p className="text-xs text-slate-400 uppercase">Startup Cost</p>
                    <p className="text-xl font-bold">{raw.startupCosts}</p>
                  </div>
                  <div className="p-4 bg-green-700 text-white rounded-lg text-center">
                    <p className="text-xs text-green-200 uppercase">Expected Revenue</p>
                    <p className="text-xl font-bold">{raw.expectedRevenue}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-8 text-sm border-t pt-4">
                  <div>
                    <span className="font-bold block text-slate-500">Revenue Model</span>
                    {raw.revenueModel}
                  </div>
                  <div>
                    <span className="font-bold block text-slate-500">Monthly OpEx</span>
                    {raw.operatingCosts}
                  </div>
                </div>
              </section>

            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- LEGAL AGREEMENT ---
  if (raw.mode === 'legal-agreement') {
    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div ref={containerRef} className="w-[210mm] min-h-[297mm] bg-white p-[25mm] text-black mx-auto box-border print:w-full print:min-h-0 print:overflow-visible font-serif leading-loose text-justify">

            <h1 className="text-center font-bold uppercase text-2xl mb-8 border-b-2 border-black pb-4">
              {raw.template === 'legal-lease' ? 'LEASE AGREEMENT' :
                raw.template === 'legal-partnership' ? 'PARTNERSHIP AGREEMENT' :
                  raw.template === 'legal-sale' ? 'SALE AGREEMENT' : 'LEGAL AGREEMENT'}
            </h1>

            <p className="mb-6">
              This Agreement is made on this <strong>{raw.agreementDate || "[Date]"}</strong>, by and between:
            </p>

            <div className="pl-6 mb-6">
              <p className="mb-4">
                <strong>1. FIRST PARTY:</strong> {raw.legalPartyA || "[Party A Name]"}, hereinafter referred to as the
                "{raw.template === 'legal-lease' ? 'Landlord' : raw.template === 'legal-sale' ? 'Seller' : 'First Party'}".
              </p>
              <p>
                <strong>2. SECOND PARTY:</strong> {raw.legalPartyB || "[Party B Name]"}, hereinafter referred to as the
                "{raw.template === 'legal-lease' ? 'Tenant' : raw.template === 'legal-sale' ? 'Buyer' : 'Second Party'}".
              </p>
            </div>

            <div className="space-y-6">
              <h3 className="font-bold text-center underline">WHEREAS:</h3>

              <div className="pl-6">
                <p>The Parties wish to enter into an agreement for the {raw.template === 'legal-lease' ? 'lease of property' : 'transaction described below'};</p>
              </div>

              <h3 className="font-bold text-center underline">IT IS HEREBY AGREED AS FOLLOWS:</h3>

              <div className="space-y-4">
                <div className="break-inside-avoid">
                  <span className="font-bold mr-2">1. CONSIDERATION:</span>
                  The financial value associated with this agreement is <strong>{raw.financialValue || "[Amount]"}</strong>, to be paid as per the agreed schedule.
                </div>

                <div className="break-inside-avoid">
                  <span className="font-bold mr-2">2. TERMS AND CONDITIONS:</span>
                  <p className="whitespace-pre-line pl-6 mt-2">{raw.agreementTerms || "[Enter specific terms here...]"}</p>
                </div>

                <div className="break-inside-avoid">
                  <span className="font-bold mr-2">3. GOVERNING LAW:</span>
                  This Agreement shall be governed by and construed in accordance with the laws of the applicable jurisdiction.
                </div>
              </div>

              <div className="mt-16 flex justify-between items-end break-inside-avoid">
                <div className="text-center w-1/3">
                  <div className="border-b border-black mb-2 h-12"></div>
                  <p className="uppercase font-bold text-xs">{raw.legalPartyA}</p>
                  <p className="text-xs text-slate-500">(Signature)</p>
                </div>
                <div className="text-center w-1/3">
                  <div className="border-b border-black mb-2 h-12"></div>
                  <p className="uppercase font-bold text-xs">{raw.legalPartyB}</p>
                  <p className="text-xs text-slate-500">(Signature)</p>
                </div>
              </div>

              <div className="mt-8 text-center text-xs text-slate-400 italic">
                * This document is a generated template and does not constitute professional legal advice.
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }


  // --- STANDARD RESUME/CV DATA PREP ---
  const dataToRender = {
    summary: aiContent?.summary || raw.summary,
    skills: aiContent?.skills || raw.skills.split(',').map(s => s.trim()).filter(Boolean),
    languages: aiContent?.languages || (raw.languages ? raw.languages.split(',').map(s => s.trim()).filter(Boolean) : []),
    experience: aiContent?.experience || raw.experience.map(e => ({
      company: e.company,
      role: e.role,
      dates: e.dates,
      bullets: [e.description]
    })),
    internships: aiContent?.internships || raw.internships.map(e => ({
      company: e.company,
      role: e.role,
      dates: e.dates,
      bullets: [e.description]
    })),
    volunteering: aiContent?.volunteering || raw.volunteering.map(e => ({
      company: e.company,
      role: e.role,
      dates: e.dates,
      bullets: [e.description]
    })),
    projects: aiContent?.projects || raw.projects.map(p => ({
      name: p.name,
      link: p.link,
      dates: p.dates,
      bullets: [p.description]
    })),
    achievements: aiContent?.achievements || raw.achievements.split('\n').map(a => a.trim()).filter(Boolean),
    publications: aiContent?.publications || (raw.publications ? raw.publications.split('\n').map(a => a.trim()).filter(Boolean) : []),
    certifications: aiContent?.certifications || (raw.certifications ? raw.certifications.split('\n').map(a => a.trim()).filter(Boolean) : [])
  };

  const SectionTitle = ({ title, className = '' }: { title: string; className?: string }) => (
    <h2
      className={`text-sm font-bold uppercase tracking-widest mb-3 border-b pb-1 ${className}`}
      style={{ color: raw.template === 'modern' ? themeColor : '#64748b', borderColor: raw.template === 'modern' ? themeColor : '#e2e8f0' }}
    >
      {title}
    </h2>
  );

  // --- TEMPLATE: CORPORATE CV (Top-Tier, Shaded Sidebar, Photo) ---
  if (raw.template === 'cv-corporate') {
    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div ref={containerRef} className="w-[210mm] min-h-[297mm] bg-white text-slate-800 mx-auto box-border flex flex-col print:w-full print:min-h-0 print:h-auto print:overflow-visible print:print-color-adjust-exact">

            {/* Header Area */}
            {renderCorporateHeader()}

            <div className="flex flex-1 min-h-0 print:block">
              {/* Left Column (Main) */}
              <div className="flex-[2.2] p-10 pr-8 print:p-8 print:w-full">
                {dataToRender.summary && (
                  <section className="mb-10 break-inside-avoid">
                    <h2 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-3" style={{ color: themeColor }}>
                      <span className="w-8 h-0.5 bg-slate-300"></span>
                      {t.profile}
                    </h2>
                    <p className="text-sm leading-7 text-slate-700 text-justify">{dataToRender.summary}</p>
                  </section>
                )}

                {dataToRender.experience.length > 0 && (
                  <section className="mb-10">
                    <h2 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-3" style={{ color: themeColor }}>
                      <span className="w-8 h-0.5 bg-slate-300"></span>
                      {t.experience}
                    </h2>
                    <div className="space-y-8">
                      {dataToRender.experience.map((exp, idx) => (
                        <div key={idx} className="page-break-avoid">
                          <div className="flex justify-between items-baseline mb-1">
                            <h3 className="font-bold text-slate-900 text-base">{exp.role}</h3>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{exp.dates}</span>
                          </div>
                          <div className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                            {exp.company}
                          </div>
                          <ul className="list-disc list-outside ml-4 space-y-1.5">
                            {exp.bullets.map((bullet, bIdx) => (
                              <li key={bIdx} className="text-sm leading-relaxed text-slate-600 pl-1 text-justify">{bullet}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {dataToRender.internships.length > 0 && (
                  <section className="mb-10">
                    <h2 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-3" style={{ color: themeColor }}>
                      <span className="w-8 h-0.5 bg-slate-300"></span>
                      {t.internships}
                    </h2>
                    <div className="space-y-8">
                      {dataToRender.internships.map((exp, idx) => (
                        <div key={idx} className="page-break-avoid">
                          <div className="flex justify-between items-baseline mb-1">
                            <h3 className="font-bold text-slate-900 text-base">{exp.role}</h3>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{exp.dates}</span>
                          </div>
                          <div className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                            {exp.company}
                          </div>
                          <ul className="list-disc list-outside ml-4 space-y-1.5">
                            {exp.bullets.map((bullet, bIdx) => (
                              <li key={bIdx} className="text-sm leading-relaxed text-slate-600 pl-1 text-justify">{bullet}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {dataToRender.projects.length > 0 && (
                  <section className="mb-10">
                    <h2 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-3" style={{ color: themeColor }}>
                      <span className="w-8 h-0.5 bg-slate-300"></span>
                      {t.keyProjects}
                    </h2>
                    <div className="space-y-6">
                      {dataToRender.projects.map((proj, idx) => (
                        <div key={idx} className="page-break-avoid">
                          <h3 className="font-bold text-slate-900 text-sm flex justify-between items-center mb-1">
                            <span>{proj.name}</span>
                            <span className="text-slate-400 font-medium text-xs">{proj.dates}</span>
                          </h3>
                          {proj.link && <a href={proj.link} className="text-xs text-blue-600 hover:underline mb-2 block">{proj.link}</a>}
                          <ul className="list-disc list-outside ml-4 mt-2 space-y-1.5">
                            {proj.bullets.map((bullet, bIdx) => (
                              <li key={bIdx} className="text-sm leading-relaxed text-slate-600 pl-1 text-justify">{bullet}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {dataToRender.volunteering.length > 0 && (
                  <section>
                    <h2 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-3" style={{ color: themeColor }}>
                      <span className="w-8 h-0.5 bg-slate-300"></span>
                      {t.volunteering}
                    </h2>
                    <div className="space-y-6">
                      {dataToRender.volunteering.map((vol, idx) => (
                        <div key={idx} className="page-break-avoid">
                          <div className="flex justify-between items-baseline mb-1">
                            <h3 className="font-bold text-slate-900 text-sm">{vol.role}</h3>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{vol.dates}</span>
                          </div>
                          <div className="text-sm font-medium text-slate-700 mb-2">{vol.company}</div>
                          <ul className="list-disc list-outside ml-4 space-y-1.5">
                            {vol.bullets.map((bullet, bIdx) => (
                              <li key={bIdx} className="text-sm leading-relaxed text-slate-600 pl-1 text-justify">{bullet}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              {/* Right Column (Sidebar) */}
              <div className="flex-1 bg-slate-50 p-10 pl-6 border-l border-slate-100 print:bg-slate-50 print:p-8 print:pl-8 print:border-l-0 print:border-t print:w-full">
                {dataToRender.skills.length > 0 && (
                  <section className="mb-8">
                    <h2 className="text-xs font-bold uppercase tracking-widest mb-4 text-slate-900 border-b border-slate-200 pb-2">{t.competencies}</h2>
                    <div className="flex flex-wrap gap-2">
                      {dataToRender.skills.map((skill, idx) => (
                        <span key={idx} className="text-xs font-medium bg-white border border-slate-200 text-slate-700 px-2.5 py-1 rounded-md shadow-sm print:border-slate-300">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {dataToRender.languages && dataToRender.languages.length > 0 && (
                  <section className="mb-8">
                    <h2 className="text-xs font-bold uppercase tracking-widest mb-4 text-slate-900 border-b border-slate-200 pb-2">{t.languages}</h2>
                    <ul className="space-y-2">
                      {dataToRender.languages.map((langItem, idx) => (
                        <li key={idx} className="text-sm text-slate-600 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 print:bg-slate-600"></span>
                          {langItem}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {raw.education.length > 0 && (
                  <section className="mb-8">
                    <h2 className="text-xs font-bold uppercase tracking-widest mb-4 text-slate-900 border-b border-slate-200 pb-2">{t.education}</h2>
                    <div className="space-y-5">
                      {raw.education.map((edu, idx) => (
                        <div key={idx}>
                          <div className="font-bold text-slate-900 text-sm leading-tight">{edu.school}</div>
                          <div className="text-xs text-slate-600 mt-1 font-medium">{edu.degree}</div>
                          <div className="text-xs text-slate-400 mt-1 italic">{edu.dates}</div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {dataToRender.certifications && dataToRender.certifications.length > 0 && (
                  <section className="mb-8">
                    <h2 className="text-xs font-bold uppercase tracking-widest mb-4 text-slate-900 border-b border-slate-200 pb-2">{t.certifications}</h2>
                    <ul className="space-y-3">
                      {dataToRender.certifications.map((cert, idx) => (
                        <li key={idx} className="text-xs text-slate-600 leading-relaxed">
                          {cert}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {dataToRender.publications && dataToRender.publications.length > 0 && (
                  <section className="mb-8">
                    <h2 className="text-xs font-bold uppercase tracking-widest mb-4 text-slate-900 border-b border-slate-200 pb-2">{t.publications}</h2>
                    <ul className="space-y-3">
                      {dataToRender.publications.map((pub, idx) => (
                        <li key={idx} className="text-xs text-slate-600 leading-relaxed italic">
                          {pub}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {dataToRender.achievements && dataToRender.achievements.length > 0 && (
                  <section>
                    <h2 className="text-xs font-bold uppercase tracking-widest mb-4 text-slate-900 border-b border-slate-200 pb-2">{t.awards}</h2>
                    <ul className="space-y-3">
                      {dataToRender.achievements.map((ach, idx) => (
                        <li key={idx} className="text-xs text-slate-600 leading-relaxed">
                          {ach}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- TEMPLATE: ACADEMIC CV ---
  if (raw.template === 'cv-academic') {
    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div ref={containerRef} className="w-[210mm] min-h-[297mm] bg-white p-[20mm] text-slate-900 font-serif mx-auto box-border print:w-full print:min-h-0 print:p-[15mm] print:h-auto print:overflow-visible print:print-color-adjust-exact">

            {/* Header - Centered & Formal */}
            <header className="mb-10 text-center border-b-2 border-slate-900 pb-8 relative break-inside-avoid">
              {raw.photo && (
                <div className="absolute top-0 right-0 w-24 h-24 border border-slate-200 p-1 bg-white hidden sm:block print:block">
                  <img src={raw.photo} alt="Profile" className="w-full h-full object-cover grayscale" />
                </div>
              )}

              <h1 className="text-3xl font-bold uppercase tracking-wider mb-4 text-slate-900">
                {raw.fullName || "Your Name"}
              </h1>

              <div className="text-sm text-slate-700 flex flex-wrap justify-center gap-x-4 gap-y-1 max-w-2xl mx-auto">
                {raw.location && <span>{raw.location}</span>}
                {raw.email && <span>• {raw.email}</span>}
                {raw.phone && <span>• {raw.phone}</span>}
                {raw.website && <span>• {raw.website.replace(/^https?:\/\//, '')}</span>}
                {raw.linkedin && <span>• {raw.linkedin}</span>}
              </div>
            </header>

            {/* Summary */}
            {dataToRender.summary && (
              <section className="mb-8 break-inside-avoid">
                <h2 className="text-sm font-bold uppercase border-b border-slate-300 mb-4 pb-1 tracking-widest">{t.profile}</h2>
                <p className="text-sm leading-relaxed text-slate-800 text-justify">{dataToRender.summary}</p>
              </section>
            )}

            {/* Education - Top Priority for Academic */}
            {raw.education.length > 0 && (
              <section className="mb-8">
                <h2 className="text-sm font-bold uppercase border-b border-slate-300 mb-4 pb-1 tracking-widest">{t.education}</h2>
                <div className="space-y-4">
                  {raw.education.map((edu, idx) => (
                    <div key={idx} className="page-break-avoid">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-bold text-slate-900 text-base">{edu.school}</h3>
                        <span className="text-sm text-slate-700 font-medium">{edu.dates}</span>
                      </div>
                      <div className="text-sm italic text-slate-800 mt-1">{edu.degree}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Experience */}
            {dataToRender.experience.length > 0 && (
              <section className="mb-8">
                <h2 className="text-sm font-bold uppercase border-b border-slate-300 mb-4 pb-1 tracking-widest">{t.academicExp}</h2>
                <div className="space-y-6">
                  {dataToRender.experience.map((exp, idx) => (
                    <div key={idx} className="page-break-avoid">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-bold text-slate-900 text-base">{exp.role}</h3>
                        <span className="text-sm text-slate-700 font-medium">{exp.dates}</span>
                      </div>
                      <div className="text-sm font-bold italic text-slate-800 mb-2">{exp.company}</div>
                      <ul className="list-disc list-outside ml-5 space-y-1.5">
                        {exp.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="text-sm leading-relaxed text-slate-800 pl-1 text-justify">{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Internships */}
            {dataToRender.internships.length > 0 && (
              <section className="mb-8">
                <h2 className="text-sm font-bold uppercase border-b border-slate-300 mb-4 pb-1 tracking-widest">{t.internships}</h2>
                <div className="space-y-6">
                  {dataToRender.internships.map((exp, idx) => (
                    <div key={idx} className="page-break-avoid">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-bold text-slate-900 text-base">{exp.role}</h3>
                        <span className="text-sm text-slate-700 font-medium">{exp.dates}</span>
                      </div>
                      <div className="text-sm font-bold italic text-slate-800 mb-2">{exp.company}</div>
                      <ul className="list-disc list-outside ml-5 space-y-1.5">
                        {exp.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="text-sm leading-relaxed text-slate-800 pl-1 text-justify">{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Publications */}
            {dataToRender.publications && dataToRender.publications.length > 0 && (
              <section className="mb-8">
                <h2 className="text-sm font-bold uppercase border-b border-slate-300 mb-4 pb-1 tracking-widest">{t.publications}</h2>
                <ul className="list-decimal list-outside ml-5 space-y-3">
                  {dataToRender.publications.map((pub, idx) => (
                    <li key={idx} className="text-sm leading-relaxed text-slate-800 pl-1 text-justify break-inside-avoid">{pub}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* Research / Projects */}
            {dataToRender.projects.length > 0 && (
              <section className="mb-8">
                <h2 className="text-sm font-bold uppercase border-b border-slate-300 mb-4 pb-1 tracking-widest">{t.research}</h2>
                <div className="space-y-5">
                  {dataToRender.projects.map((proj, idx) => (
                    <div key={idx} className="page-break-avoid">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-bold text-slate-900">
                          {proj.name} {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" className="text-xs font-normal underline ml-1 text-slate-600">[Link]</a>}
                        </h3>
                        <span className="text-sm text-slate-700 font-medium">{proj.dates}</span>
                      </div>
                      <ul className="list-disc list-outside ml-5 space-y-1">
                        {proj.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="text-sm leading-relaxed text-slate-800 pl-1 text-justify">{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Volunteering */}
            {dataToRender.volunteering.length > 0 && (
              <section className="mb-8">
                <h2 className="text-sm font-bold uppercase border-b border-slate-300 mb-4 pb-1 tracking-widest">{t.volunteering}</h2>
                <div className="space-y-6">
                  {dataToRender.volunteering.map((exp, idx) => (
                    <div key={idx} className="page-break-avoid">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-bold text-slate-900 text-base">{exp.role}</h3>
                        <span className="text-sm text-slate-700 font-medium">{exp.dates}</span>
                      </div>
                      <div className="text-sm font-bold italic text-slate-800 mb-2">{exp.company}</div>
                      <ul className="list-disc list-outside ml-5 space-y-1.5">
                        {exp.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="text-sm leading-relaxed text-slate-800 pl-1 text-justify">{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Certifications */}
            {dataToRender.certifications && dataToRender.certifications.length > 0 && (
              <section className="mb-8">
                <h2 className="text-sm font-bold uppercase border-b border-slate-300 mb-4 pb-1 tracking-widest">{t.certifications}</h2>
                <ul className="list-disc list-outside ml-5 space-y-1.5">
                  {dataToRender.certifications.map((cert, idx) => (
                    <li key={idx} className="text-sm leading-relaxed text-slate-800 pl-1 break-inside-avoid">{cert}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* Languages & Skills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {dataToRender.languages && dataToRender.languages.length > 0 && (
                <section className="page-break-avoid">
                  <h2 className="text-sm font-bold uppercase border-b border-slate-300 mb-4 pb-1 tracking-widest">{t.languages}</h2>
                  <ul className="list-none space-y-1">
                    {dataToRender.languages.map((langItem, idx) => (
                      <li key={idx} className="text-sm leading-relaxed text-slate-800">{langItem}</li>
                    ))}
                  </ul>
                </section>
              )}

              {dataToRender.skills.length > 0 && (
                <section className="page-break-avoid">
                  <h2 className="text-sm font-bold uppercase border-b border-slate-300 mb-4 pb-1 tracking-widest">{t.skills}</h2>
                  <p className="text-sm leading-relaxed text-slate-800">
                    {dataToRender.skills.join(' • ')}
                  </p>
                </section>
              )}
            </div>

            {/* Achievements */}
            {dataToRender.achievements && dataToRender.achievements.length > 0 && (
              <section className="mt-8">
                <h2 className="text-sm font-bold uppercase border-b border-slate-300 mb-4 pb-1 tracking-widest">{t.awards}</h2>
                <ul className="list-disc list-outside ml-5 space-y-1">
                  {dataToRender.achievements.map((ach, idx) => (
                    <li key={idx} className="text-sm leading-relaxed text-slate-800 pl-1 break-inside-avoid">{ach}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- TEMPLATE 1: PROFESSIONAL CV (Dark Header with Photo - Image 3) ---
  if (raw.template === 'cv-professional') {
    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div ref={containerRef} className="w-[210mm] min-h-[297mm] bg-white text-slate-900 mx-auto box-border print:w-full print:min-h-0 print:h-auto print:overflow-visible">

            {/* HEADER SECTION */}
            <div className="bg-slate-800 text-white p-8 pb-6 relative break-inside-avoid">
              <div className="flex items-start justify-between gap-6">
                {/* Left: Name and Title */}
                <div className="flex-1">
                  <h1 className="text-4xl font-bold uppercase tracking-wide mb-2">
                    {raw.fullName || "YOUR NAME"}
                  </h1>
                  <p className="text-lg text-slate-300 font-medium">
                    {raw.targetRole || "Professional Title"}
                  </p>
                </div>

                {/* Right: Photo */}
                {raw.photo && (
                  <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white/20 shrink-0 bg-white">
                    <img src={raw.photo} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Contact Info Bar */}
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300">
                {raw.phone && (
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="w-4 h-4" />
                    <span>{raw.phone}</span>
                  </div>
                )}
                {raw.email && (
                  <div className="flex items-center gap-2">
                    <MailIcon className="w-4 h-4" />
                    <span>{raw.email}</span>
                  </div>
                )}
                {raw.location && (
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{raw.location}</span>
                  </div>
                )}
                {raw.linkedin && (
                  <div className="flex items-center gap-2">
                    <GlobeIcon className="w-4 h-4" />
                    <span>{raw.linkedin.replace(/^https?:\/\//, '')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* MAIN CONTENT - COMPACT FOR 2 PAGES MAX */}
            <div className="p-6 space-y-6">

              {/* Professional Summary */}
              {dataToRender.summary && (
                <section className="page-break-avoid">
                  <div className="bg-slate-100 text-center py-2 mb-3 rounded">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-slate-700">
                      Professional Summary
                    </h2>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-800 text-justify px-2">
                    {dataToRender.summary}
                  </p>
                </section>
              )}

              {/* Core Competencies */}
              {dataToRender.skills.length > 0 && (
                <section className="page-break-avoid">
                  <div className="bg-slate-800 text-white text-center py-2 mb-3 rounded">
                    <h2 className="text-sm font-bold uppercase tracking-widest">
                      Core Competencies
                    </h2>
                  </div>
                  <div className="grid grid-cols-3 gap-x-4 gap-y-1.5 px-2">
                    {dataToRender.skills.map((skill, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-800 shrink-0"></span>
                        <span className="text-xs text-slate-700">{skill}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Work Experience */}
              {dataToRender.experience.length > 0 && (
                <section>
                  <div className="bg-slate-800 text-white text-center py-2 mb-3 rounded">
                    <h2 className="text-sm font-bold uppercase tracking-widest">
                      Work Experiences
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {dataToRender.experience.map((exp, idx) => (
                      <div key={idx} className="page-break-avoid">
                        <div className="flex justify-between items-start mb-1.5">
                          <div className="flex-1">
                            <h3 className="text-base font-bold text-slate-900">{exp.role}</h3>
                            <p className="text-sm text-slate-700 font-semibold flex items-center gap-2 mt-0.5">
                              <span className="text-blue-600 text-base">★</span>
                              {exp.company}
                            </p>
                          </div>
                          <span className="text-sm text-slate-600 font-medium whitespace-nowrap ml-4">
                            {exp.dates}
                          </span>
                        </div>

                        {/* Achievements Section */}
                        <div className="mb-2">
                          <p className="text-xs font-bold text-slate-700 uppercase mb-1">Achievements:</p>
                          <ul className="list-disc list-outside ml-4 space-y-0.5">
                            {exp.bullets.slice(0, 3).map((bullet, bIdx) => (
                              <li key={bIdx} className="text-xs text-slate-700 leading-tight">
                                {bullet}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Internships */}
              {dataToRender.internships.length > 0 && (
                <section>
                  <div className="bg-slate-800 text-white text-center py-2 mb-3 rounded">
                    <h2 className="text-sm font-bold uppercase tracking-widest">
                      Internship
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {dataToRender.internships.map((int, idx) => (
                      <div key={idx} className="page-break-avoid">
                        <div className="flex justify-between items-start mb-1.5">
                          <div className="flex-1">
                            <h3 className="text-base font-bold text-slate-900">{int.role}</h3>
                            <p className="text-sm text-slate-700 font-semibold flex items-center gap-2 mt-0.5">
                              <span className="text-blue-600 text-base">★</span>
                              {int.company}
                            </p>
                          </div>
                          <span className="text-sm text-slate-600 font-medium whitespace-nowrap ml-4">
                            {int.dates}
                          </span>
                        </div>
                        <ul className="list-disc list-outside ml-4 space-y-0.5">
                          {int.bullets.slice(0, 2).map((bullet, bIdx) => (
                            <li key={bIdx} className="text-xs text-slate-700 leading-tight">
                              {bullet}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Education */}
              {raw.education.length > 0 && (
                <section className="page-break-avoid">
                  <div className="bg-slate-800 text-white text-center py-2 mb-3 rounded">
                    <h2 className="text-sm font-bold uppercase tracking-widest">
                      Educational Qualifications
                    </h2>
                  </div>
                  <div className="space-y-2 px-2">
                    {raw.education.map((edu, idx) => (
                      <div key={idx}>
                        <h3 className="text-base font-bold text-slate-900">{edu.degree}</h3>
                        <p className="text-sm text-slate-700">{edu.school} | GPA: 3.50/4.00</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Certifications */}
              {dataToRender.certifications && dataToRender.certifications.length > 0 && (
                <section className="page-break-avoid">
                  <div className="bg-slate-800 text-white text-center py-2 mb-3 rounded">
                    <h2 className="text-sm font-bold uppercase tracking-widest">
                      Certifications
                    </h2>
                  </div>
                  <ul className="space-y-1 px-2">
                    {dataToRender.certifications.slice(0, 3).map((cert, idx) => (
                      <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                        <span className="text-slate-800 font-bold">•</span>
                        {cert}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Tools & Tech */}
              <section className="page-break-avoid">
                <div className="bg-slate-800 text-white text-center py-2 mb-3 rounded">
                  <h2 className="text-sm font-bold uppercase tracking-widest">
                    Tools and Tech
                  </h2>
                </div>
                <p className="text-xs text-slate-700 px-2">
                  {dataToRender.skills.slice(0, 8).join(' • ')}
                </p>
              </section>

              {/* Extracurricular Activities */}
              {dataToRender.achievements && dataToRender.achievements.length > 0 && (
                <section className="page-break-avoid">
                  <div className="bg-slate-800 text-white text-center py-2 mb-3 rounded">
                    <h2 className="text-sm font-bold uppercase tracking-widest">
                      Extracurricular Activities
                    </h2>
                  </div>
                  <ul className="space-y-1 px-2">
                    {dataToRender.achievements.slice(0, 2).map((ach, idx) => (
                      <li key={idx} className="text-xs text-slate-700">
                        <span className="font-bold">• </span>{ach}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Languages */}
              {dataToRender.languages && dataToRender.languages.length > 0 && (
                <section className="page-break-avoid">
                  <p className="text-xs text-slate-700 px-2">
                    <span className="font-bold uppercase">Languages: </span>
                    {dataToRender.languages.join(' | ')}
                  </p>
                </section>
              )}

              {/* References */}
              <section className="page-break-avoid">
                <p className="text-sm text-slate-700 font-bold uppercase px-2">
                  References:
                </p>
                <p className="text-xs text-slate-600 italic px-2">
                  Available upon request.
                </p>
              </section>

            </div>

            {/* Footer */}
            <div className="text-right py-2 px-6 text-[10px] text-slate-500">
              <div className="flex items-center justify-end gap-2">
                <span></span>
                <span className="font-bold"></span>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // --- TEMPLATE 2: CORPORATE CV (Dark Gray Header - Image 4) ---
  if ((raw.template as ResumeData['template']) === 'cv-corporate') {
    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div ref={containerRef} className="w-[210mm] min-h-[297mm] bg-white text-slate-900 mx-auto box-border print:w-full print:min-h-0 print:h-auto print:overflow-visible">

            {/* HEADER */}
            <div className="bg-slate-700 text-white p-6 pb-5 relative break-inside-avoid">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold uppercase mb-1">
                    {raw.fullName || "YOUR NAME"}
                  </h1>
                  <p className="text-base text-slate-200 font-medium">
                    {raw.targetRole || "Business Development Professional | 10+ Years of Experience | MBA & BBA"}
                  </p>
                </div>

                {raw.photo && (
                  <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-white/30 shrink-0 bg-white">
                    <img src={raw.photo} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-200">
                {raw.phone && <span>📱 {raw.phone}</span>}
                {raw.email && <span>✉️ {raw.email}</span>}
                {raw.location && <span>📍 {raw.location}</span>}
                {raw.linkedin && <span>🔗 {raw.linkedin.replace(/^https?:\/\//, '')}</span>}
              </div>

              {dataToRender.summary && (
                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="text-sm text-slate-100 leading-relaxed">
                    {dataToRender.summary}
                  </p>
                </div>
              )}
            </div>

            {/* MAIN CONTENT */}
            <div className="p-6 space-y-5">

              {/* Core Competencies */}
              {dataToRender.skills.length > 0 && (
                <section className="page-break-avoid">
                  <div className="bg-slate-700 text-white text-center py-2 mb-3 rounded">
                    <h2 className="text-sm font-bold uppercase tracking-widest">
                      Core Competencies
                    </h2>
                  </div>
                  <div className="grid grid-cols-3 gap-x-4 gap-y-1.5 px-2">
                    {dataToRender.skills.map((skill, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-700 shrink-0"></span>
                        <span className="text-xs text-slate-700">{skill}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Work Experience */}
              {dataToRender.experience.length > 0 && (
                <section>
                  <div className="bg-slate-700 text-white text-center py-2 mb-3 rounded">
                    <h2 className="text-sm font-bold uppercase tracking-widest">
                      Work Experiences
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {dataToRender.experience.map((exp, idx) => (
                      <div key={idx} className="page-break-avoid">
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex-1">
                            <h3 className="text-base font-bold text-slate-900">{exp.role}</h3>
                            <p className="text-sm text-slate-700 font-bold flex items-center gap-2 mt-0.5">
                              <span className="text-yellow-600">★</span>
                              {exp.company}
                            </p>
                          </div>
                          <span className="text-sm text-slate-600 font-medium whitespace-nowrap ml-4">
                            {exp.dates}
                          </span>
                        </div>

                        <div className="mb-1.5">
                          <p className="text-xs font-bold text-slate-700 uppercase">Achievements:</p>
                          <ul className="list-disc list-outside ml-4 space-y-0.5">
                            {exp.bullets.slice(0, 3).map((bullet, bIdx) => (
                              <li key={bIdx} className="text-xs text-slate-700 leading-tight">
                                {bullet}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Education */}
              {raw.education.length > 0 && (
                <section className="page-break-avoid">
                  <div className="bg-slate-700 text-white text-center py-2 mb-3 rounded">
                    <h2 className="text-sm font-bold uppercase tracking-widest">
                      Educational Qualifications
                    </h2>
                  </div>
                  <div className="space-y-2 px-2">
                    {raw.education.map((edu, idx) => (
                      <div key={idx}>
                        <h3 className="text-base font-bold text-slate-900">{edu.degree}</h3>
                        <p className="text-sm text-slate-700">{edu.school}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Certifications */}
              {dataToRender.certifications && dataToRender.certifications.length > 0 && (
                <section className="page-break-avoid">
                  <div className="bg-slate-700 text-white text-center py-2 mb-3 rounded">
                    <h2 className="text-sm font-bold uppercase tracking-widest">
                      Certifications
                    </h2>
                  </div>
                  <ul className="space-y-1 px-2">
                    {dataToRender.certifications.slice(0, 2).map((cert, idx) => (
                      <li key={idx} className="text-xs text-slate-700">
                        <span className="font-bold">• </span>{cert}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* References */}
              <section className="page-break-avoid">
                <p className="text-sm text-slate-700 font-bold uppercase px-2">References:</p>
                <p className="text-xs text-slate-600 italic px-2">Available upon Request.</p>
              </section>
            </div>



          </div>
        </div>
      </div>
    );
  }

  // --- TEMPLATE 3: CLASSIC CV (Light Header with Border - Image 5) ---
  if (raw.template === 'cv-classic') {
    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div ref={containerRef} className="w-[210mm] min-h-[297mm] bg-white text-slate-900 mx-auto box-border print:w-full print:min-h-0 print:h-auto print:overflow-visible">

            {/* HEADER WITH SIDEBAR PHOTO */}
            <div className="flex border-b-2 border-slate-800 pb-4 mb-5 p-6 break-inside-avoid">
              {raw.photo && (
                <div className="w-28 h-28 rounded-lg overflow-hidden border border-slate-300 shrink-0 mr-6 bg-slate-100">
                  <img src={raw.photo} alt="Profile" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="flex-1">
                <h1 className="text-2xl font-bold uppercase tracking-wide mb-2 text-slate-900">
                  {raw.fullName || "YOUR NAME"}
                </h1>
                <div className="text-xs text-slate-700 space-y-1">
                  {raw.phone && <p>📱 {raw.phone} • ✉️ {raw.email}</p>}
                  {raw.location && <p>📍 {raw.location}</p>}
                  {raw.linkedin && <p>🔗 {raw.linkedin.replace(/^https?:\/\//, '')}</p>}
                </div>

                {dataToRender.summary && (
                  <p className="mt-3 text-xs text-slate-700 leading-relaxed">
                    {dataToRender.summary}
                  </p>
                )}
              </div>
            </div>

            {/* CONTENT */}
            <div className="px-6 pb-6 space-y-5">

              {/* Work Experience */}
              {dataToRender.experience.length > 0 && (
                <section>
                  <h2 className="text-base font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-3">
                    Work Experience
                  </h2>
                  <div className="space-y-4">
                    {dataToRender.experience.map((exp, idx) => (
                      <div key={idx} className="page-break-avoid">
                        <div className="mb-1">
                          <h3 className="text-base font-bold text-slate-900">Your Designation</h3>
                          <p className="text-sm text-slate-700 font-bold flex items-center gap-2 mt-0.5">
                            <span className="text-red-600">■</span>
                            {exp.company}
                          </p>
                          <p className="text-sm text-slate-600 italic">{exp.dates}</p>
                        </div>

                        <ul className="list-disc list-outside ml-4 space-y-0.5">
                          {exp.bullets.slice(0, 3).map((bullet, bIdx) => (
                            <li key={bIdx} className="text-xs text-slate-700 leading-tight">
                              {bullet}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Education */}
              {raw.education.length > 0 && (
                <section className="page-break-avoid">
                  <h2 className="text-base font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-3">
                    Educational Qualifications
                  </h2>
                  <div className="space-y-2">
                    {raw.education.map((edu, idx) => (
                      <div key={idx}>
                        <h3 className="text-base font-bold text-slate-900">{edu.degree}</h3>
                        <p className="text-sm text-slate-700">{edu.school}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Core Competencies */}
              {dataToRender.skills.length > 0 && (
                <section className="page-break-avoid">
                  <h2 className="text-base font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-3">
                    Core Competencies
                  </h2>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {dataToRender.skills.join(' • ')}
                  </p>
                </section>
              )}

              {/* Tools & Tech */}
              <section className="page-break-avoid">
                <h2 className="text-base font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-3">
                  Tools & Tech
                </h2>
                <p className="text-xs text-slate-700">
                  MS Office • Google Docs • Mail Management • CRM Software • HRIS
                </p>
              </section>

              {/* References */}
              <section className="page-break-avoid">
                <h2 className="text-base font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-3">
                  References
                </h2>
                <p className="text-xs text-slate-600 italic">Available upon Request.</p>
              </section>
            </div>



          </div>
        </div>
      </div>
    );
  }

  // --- TEMPLATE 4: EXECUTIVE CV (Blue Accent Header - Image 6) ---
  if (raw.template === 'cv-executive') {
    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div ref={containerRef} className="w-[210mm] min-h-[297mm] bg-white text-slate-900 mx-auto box-border print:w-full print:min-h-0 print:h-auto print:overflow-visible">

            {/* HEADER */}
            <div className="border-b-4 border-blue-600 pb-4 p-6 break-inside-avoid">
              <div className="flex items-start justify-between gap-6">
                {raw.photo && (
                  <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-slate-200 shrink-0 bg-slate-100">
                    <img src={raw.photo} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex-1">
                  <h1 className="text-2xl font-bold uppercase tracking-wide mb-2 text-slate-900">
                    {raw.fullName || "YOUR NAME"}
                  </h1>
                  <div className="text-xs text-slate-700 space-y-0.5">
                    <p>📞 {raw.phone || "+88 01817118571"} • ✉️ {raw.email || "contact@example.com"} • 📍 {raw.location || "Austin, USA"}</p>
                  </div>

                  {dataToRender.summary && (
                    <p className="mt-3 text-xs text-slate-700 leading-relaxed">
                      {dataToRender.summary}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* CONTENT */}
            <div className="p-6 space-y-5">

              {/* Work Experience */}
              {dataToRender.experience.length > 0 && (
                <section>
                  <h2 className="text-base font-bold uppercase tracking-wider text-blue-600 border-b-2 border-blue-600 pb-1 mb-3">
                    Work Experience
                  </h2>
                  <div className="space-y-4">
                    {dataToRender.experience.map((exp, idx) => (
                      <div key={idx} className="page-break-avoid">
                        <div className="mb-1">
                          <h3 className="text-base font-bold text-slate-900">{exp.role}</h3>
                          <p className="text-sm text-slate-700 font-bold flex items-center gap-2 mt-0.5">
                            <span className="text-blue-600">■</span>
                            {exp.company}
                          </p>
                          <p className="text-sm text-slate-600 italic">{exp.dates}</p>
                        </div>

                        <ul className="list-disc list-outside ml-4 space-y-0.5">
                          {exp.bullets.slice(0, 3).map((bullet, bIdx) => (
                            <li key={bIdx} className="text-xs text-slate-700 leading-tight">
                              {bullet}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Education */}
              {raw.education.length > 0 && (
                <section className="page-break-avoid">
                  <h2 className="text-base font-bold uppercase tracking-wider text-blue-600 border-b-2 border-blue-600 pb-1 mb-3">
                    Educational Qualifications
                  </h2>
                  <div className="space-y-2">
                    {raw.education.map((edu, idx) => (
                      <div key={idx}>
                        <h3 className="text-base font-bold text-slate-900">{edu.degree}</h3>
                        <p className="text-sm text-slate-700">{edu.school}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Core Competencies */}
              {dataToRender.skills.length > 0 && (
                <section className="page-break-avoid">
                  <h2 className="text-base font-bold uppercase tracking-wider text-blue-600 border-b-2 border-blue-600 pb-1 mb-3">
                    Core Competencies
                  </h2>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {dataToRender.skills.join(' • ')}
                  </p>
                </section>
              )}

              {/* Tools & Tech */}
              <section className="page-break-avoid">
                <h2 className="text-base font-bold uppercase tracking-wider text-blue-600 border-b-2 border-blue-600 pb-1 mb-3">
                  Tools & Tech
                </h2>
                <p className="text-xs text-slate-700">
                  MS Office • Google Docs • Mail Management • CRM Software • HRIS
                </p>
              </section>
            </div>



          </div>
        </div>
      </div>
    );
  }

  // --- TEMPLATE: CLASSIC (Simple Top-Down) ---
  if (raw.template === 'classic') {
    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div ref={containerRef} className="w-[210mm] min-h-[297mm] bg-white p-[15mm] text-slate-800 mx-auto box-border print:w-full print:min-h-0 print:p-[10mm] print:h-auto print:overflow-visible">

            {renderClassicHeader()}

            {dataToRender.summary && (
              <section className="mb-6 break-inside-avoid">
                <SectionTitle title={t.profile} />
                <p className="text-sm leading-relaxed text-slate-700">{dataToRender.summary}</p>
              </section>
            )}

            {dataToRender.experience.length > 0 && (
              <section className="mb-6">
                <SectionTitle title={t.experience} />
                <div className="space-y-5">
                  {dataToRender.experience.map((exp, idx) => (
                    <div key={idx} className="page-break-avoid">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-bold text-slate-900">{exp.role}</h3>
                        <span className="text-sm font-medium text-slate-500 whitespace-nowrap">{exp.dates}</span>
                      </div>
                      <div className="text-slate-700 font-medium mb-2" style={{ color: themeColor }}>{exp.company}</div>
                      <ul className="list-disc list-outside ml-4 space-y-1">
                        {exp.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="text-sm leading-relaxed text-slate-700 pl-1">{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {dataToRender.internships.length > 0 && (
              <section className="mb-6">
                <SectionTitle title={t.internships} />
                <div className="space-y-5">
                  {dataToRender.internships.map((exp, idx) => (
                    <div key={idx} className="page-break-avoid">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-bold text-slate-900">{exp.role}</h3>
                        <span className="text-sm font-medium text-slate-500 whitespace-nowrap">{exp.dates}</span>
                      </div>
                      <div className="text-slate-700 font-medium mb-2" style={{ color: themeColor }}>{exp.company}</div>
                      <ul className="list-disc list-outside ml-4 space-y-1">
                        {exp.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="text-sm leading-relaxed text-slate-700 pl-1">{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {dataToRender.projects.length > 0 && (
              <section className="mb-6">
                <SectionTitle title={t.projects} />
                <div className="space-y-4">
                  {dataToRender.projects.map((proj, idx) => (
                    <div key={idx} className="page-break-avoid">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-bold text-slate-900">
                          {proj.name} {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" className="text-xs font-normal underline ml-1" style={{ color: themeColor }}>Link ↗</a>}
                        </h3>
                        <span className="text-sm font-medium text-slate-500 whitespace-nowrap">{proj.dates}</span>
                      </div>
                      <ul className="list-disc list-outside ml-4 space-y-1">
                        {proj.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="text-sm leading-relaxed text-slate-700 pl-1">{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {dataToRender.volunteering.length > 0 && (
              <section className="mb-6">
                <SectionTitle title={t.volunteering} />
                <div className="space-y-4">
                  {dataToRender.volunteering.map((vol, idx) => (
                    <div key={idx} className="page-break-avoid">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-bold text-slate-900">{vol.role}</h3>
                        <span className="text-sm font-medium text-slate-500 whitespace-nowrap">{vol.dates}</span>
                      </div>
                      <div className="text-slate-700 font-medium mb-2" style={{ color: themeColor }}>{vol.company}</div>
                      <ul className="list-disc list-outside ml-4 space-y-1">
                        {vol.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="text-sm leading-relaxed text-slate-700 pl-1">{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {raw.education.length > 0 && (
              <section className="mb-6 break-inside-avoid">
                <SectionTitle title={t.education} />
                <div className="space-y-3">
                  {raw.education.map((edu, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-bold text-slate-900">{edu.school}</h3>
                        <span className="text-sm text-slate-500 whitespace-nowrap">{edu.dates}</span>
                      </div>
                      <div className="text-sm text-slate-700">{edu.degree}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {dataToRender.achievements && dataToRender.achievements.length > 0 && (
              <section className="mb-6 break-inside-avoid">
                <SectionTitle title={t.awards} />
                <ul className="list-disc list-outside ml-4 space-y-1">
                  {dataToRender.achievements.map((ach, idx) => (
                    <li key={idx} className="text-sm leading-relaxed text-slate-700 pl-1">{ach}</li>
                  ))}
                </ul>
              </section>
            )}

            {dataToRender.skills.length > 0 && (
              <section className="page-break-avoid">
                <SectionTitle title={t.skills} />
                <div className="flex flex-wrap gap-2">
                  {dataToRender.skills.map((skill, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-medium print:bg-transparent print:p-0 print:text-slate-700 print:after:content-[','] print:last:after:content-none print:mr-1">
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- TEMPLATE: MODERN (2-Column, Clean) ---
  if (raw.template === 'modern') {
    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div ref={containerRef} className="w-[210mm] min-h-[297mm] bg-white text-slate-800 mx-auto box-border print:w-full print:min-h-0 print:h-auto print:overflow-visible flex flex-col print:print-color-adjust-exact">
            {/* Header */}
            {renderModernHeader()}

            <div className="flex flex-1 print:block">
              {/* Left Column (Main Content) */}
              <div className="flex-[1.6] p-10 pr-6 border-r border-slate-100 print:border-none print:w-full print:p-10">
                {dataToRender.summary && (
                  <div className="mb-8 break-inside-avoid">
                    <h2 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: themeColor }}>{t.profile}</h2>
                    <p className="text-sm leading-relaxed text-slate-700">{dataToRender.summary}</p>
                  </div>
                )}

                {dataToRender.experience.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: themeColor }}>{t.experience}</h2>
                    <div className="space-y-6">
                      {dataToRender.experience.map((exp, idx) => (
                        <div key={idx} className="page-break-avoid">
                          <h3 className="font-bold text-slate-900">{exp.role}</h3>
                          <div className="text-slate-600 font-medium text-sm mb-2">{exp.company}</div>
                          <ul className="list-disc list-outside ml-4 space-y-1">
                            {exp.bullets.map((bullet, bIdx) => (
                              <li key={bIdx} className="text-sm leading-relaxed text-slate-600 pl-1">{bullet}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {dataToRender.internships.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: themeColor }}>{t.internships}</h2>
                    <div className="space-y-6">
                      {dataToRender.internships.map((exp, idx) => (
                        <div key={idx} className="page-break-avoid">
                          <h3 className="font-bold text-slate-900">{exp.role}</h3>
                          <div className="text-slate-600 font-medium text-sm mb-2">{exp.company}</div>
                          <ul className="list-disc list-outside ml-4 space-y-1">
                            {exp.bullets.map((bullet, bIdx) => (
                              <li key={bIdx} className="text-sm leading-relaxed text-slate-600 pl-1">{bullet}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {dataToRender.projects.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: themeColor }}>{t.projects}</h2>
                    <div className="space-y-5">
                      {dataToRender.projects.map((proj, idx) => (
                        <div key={idx} className="page-break-avoid">
                          <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            {proj.name}
                            {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" className="text-xs underline opacity-70 hover:opacity-100">Link</a>}
                          </h3>
                          <ul className="list-disc list-outside ml-4 mt-2 space-y-1">
                            {proj.bullets.map((bullet, bIdx) => (
                              <li key={bIdx} className="text-sm leading-relaxed text-slate-600 pl-1">{bullet}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {dataToRender.volunteering.length > 0 && (
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: themeColor }}>{t.volunteering}</h2>
                    <div className="space-y-5">
                      {dataToRender.volunteering.map((vol, idx) => (
                        <div key={idx} className="page-break-avoid">
                          <h3 className="font-bold text-slate-900">{vol.role}</h3>
                          <div className="text-slate-600 font-medium text-sm mb-2">{vol.company}</div>
                          <ul className="list-disc list-outside ml-4 mt-2 space-y-1">
                            {vol.bullets.map((bullet, bIdx) => (
                              <li key={bIdx} className="text-sm leading-relaxed text-slate-600 pl-1">{bullet}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column (Sidebar) */}
              <div className="flex-1 p-10 pl-6 bg-slate-50/30 print:bg-slate-50 print:w-full print:p-10 print:border-t">
                {raw.education.length > 0 && (
                  <div className="mb-8 break-inside-avoid">
                    <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: themeColor }}>{t.education}</h2>
                    <div className="space-y-4">
                      {raw.education.map((edu, idx) => (
                        <div key={idx}>
                          <div className="font-bold text-slate-900">{edu.school}</div>
                          <div className="text-sm text-slate-700">{edu.degree}</div>
                          <div className="text-xs text-slate-500 mt-1">{edu.dates}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {dataToRender.skills.length > 0 && (
                  <div className="mb-8 break-inside-avoid">
                    <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: themeColor }}>{t.skills}</h2>
                    <div className="flex flex-wrap gap-2">
                      {dataToRender.skills.map((skill, idx) => (
                        <div key={idx} className="text-sm text-slate-700 bg-white border border-slate-200 px-2 py-1 rounded">
                          {skill}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {dataToRender.achievements && dataToRender.achievements.length > 0 && (
                  <div className="page-break-avoid">
                    <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: themeColor }}>{t.awards}</h2>
                    <ul className="list-disc list-outside ml-4 space-y-2">
                      {dataToRender.achievements.map((ach, idx) => (
                        <li key={idx} className="text-sm leading-relaxed text-slate-600 pl-1">{ach}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- TEMPLATE: MINIMALIST (Executive) ---
  if (raw.template === 'minimalist') {
    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div ref={containerRef} className="w-[210mm] min-h-[297mm] bg-white p-[15mm] text-slate-800 mx-auto box-border print:w-full print:min-h-0 print:p-[10mm] print:h-auto print:overflow-visible print:print-color-adjust-exact">
            {/* Header */}
            <div className="text-center border-b-2 pb-6 mb-8 break-inside-avoid" style={{ borderColor: themeColor }}>
              <h1 className="text-3xl font-serif font-bold text-slate-900 mb-3 uppercase tracking-wider">
                {raw.fullName || "Your Name"}
              </h1>
              <div className="text-sm text-slate-500 flex flex-wrap justify-center gap-4">
                {raw.location && <span>{raw.location}</span>}
                {raw.email && <span>{raw.email}</span>}
                {raw.phone && <span>{raw.phone}</span>}
                {raw.linkedin && <span>{raw.linkedin}</span>}
                {raw.website && <span>{raw.website}</span>}
              </div>
            </div>

            {/* Content */}
            <div className="space-y-8">
              {dataToRender.summary && (
                <div className="text-center max-w-2xl mx-auto break-inside-avoid">
                  <p className="text-sm leading-relaxed text-slate-700 italic">{dataToRender.summary}</p>
                </div>
              )}

              {/* Experience */}
              {dataToRender.experience.length > 0 && (
                <div>
                  <div className="flex items-center mb-4 break-inside-avoid">
                    <div className="h-px flex-1 bg-slate-200"></div>
                    <h2 className="px-4 text-sm font-bold uppercase tracking-widest text-slate-500">{t.experience}</h2>
                    <div className="h-px flex-1 bg-slate-200"></div>
                  </div>
                  <div className="space-y-6">
                    {dataToRender.experience.map((exp, idx) => (
                      <div key={idx} className="page-break-avoid">
                        <div className="flex justify-between items-end mb-2">
                          <div>
                            <h3 className="font-bold text-slate-900 text-lg">{exp.role}</h3>
                            <div className="text-sm font-medium" style={{ color: themeColor }}>{exp.company}</div>
                          </div>
                          <span className="text-sm text-slate-500 italic">{exp.dates}</span>
                        </div>
                        <ul className="list-disc list-outside ml-4 space-y-1">
                          {exp.bullets.map((bullet, bIdx) => (
                            <li key={bIdx} className="text-sm leading-relaxed text-slate-700 pl-1">{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Internships */}
              {dataToRender.internships.length > 0 && (
                <div>
                  <div className="flex items-center mb-4 break-inside-avoid">
                    <div className="h-px flex-1 bg-slate-200"></div>
                    <h2 className="px-4 text-sm font-bold uppercase tracking-widest text-slate-500">{t.internships}</h2>
                    <div className="h-px flex-1 bg-slate-200"></div>
                  </div>
                  <div className="space-y-6">
                    {dataToRender.internships.map((exp, idx) => (
                      <div key={idx} className="page-break-avoid">
                        <div className="flex justify-between items-end mb-2">
                          <div>
                            <h3 className="font-bold text-slate-900 text-lg">{exp.role}</h3>
                            <div className="text-sm font-medium" style={{ color: themeColor }}>{exp.company}</div>
                          </div>
                          <span className="text-sm text-slate-500 italic">{exp.dates}</span>
                        </div>
                        <ul className="list-disc list-outside ml-4 space-y-1">
                          {exp.bullets.map((bullet, bIdx) => (
                            <li key={bIdx} className="text-sm leading-relaxed text-slate-700 pl-1">{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {dataToRender.projects.length > 0 && (
                <div>
                  <div className="flex items-center mb-4 break-inside-avoid">
                    <div className="h-px flex-1 bg-slate-200"></div>
                    <h2 className="px-4 text-sm font-bold uppercase tracking-widest text-slate-500">{t.projects}</h2>
                    <div className="h-px flex-1 bg-slate-200"></div>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    {dataToRender.projects.map((proj, idx) => (
                      <div key={idx} className="page-break-avoid">
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className="font-bold text-slate-900">{proj.name}</h3>
                          <span className="text-sm text-slate-500">{proj.dates}</span>
                        </div>
                        <p className="text-xs text-blue-600 mb-2">{proj.link}</p>
                        <ul className="list-disc list-outside ml-4 space-y-1">
                          {proj.bullets.map((bullet, bIdx) => (
                            <li key={bIdx} className="text-sm leading-relaxed text-slate-700 pl-1">{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Volunteering */}
              {dataToRender.volunteering.length > 0 && (
                <div>
                  <div className="flex items-center mb-4 break-inside-avoid">
                    <div className="h-px flex-1 bg-slate-200"></div>
                    <h2 className="px-4 text-sm font-bold uppercase tracking-widest text-slate-500">{t.volunteering}</h2>
                    <div className="h-px flex-1 bg-slate-200"></div>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    {dataToRender.volunteering.map((vol, idx) => (
                      <div key={idx} className="page-break-avoid">
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className="font-bold text-slate-900">{vol.role}</h3>
                          <span className="text-sm text-slate-500">{vol.dates}</span>
                        </div>
                        <div className="text-sm font-medium" style={{ color: themeColor }}>{vol.company}</div>
                        <ul className="list-disc list-outside ml-4 space-y-1">
                          {vol.bullets.map((bullet, bIdx) => (
                            <li key={bIdx} className="text-sm leading-relaxed text-slate-700 pl-1">{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education & Skills Row */}
              <div className="grid grid-cols-2 gap-8 break-inside-avoid">
                {raw.education.length > 0 && (
                  <div>
                    <h2 className="text-center text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 pb-1 border-b border-slate-100">{t.education}</h2>
                    <div className="space-y-4">
                      {raw.education.map((edu, idx) => (
                        <div key={idx} className="text-center">
                          <div className="font-bold text-slate-900">{edu.school}</div>
                          <div className="text-sm text-slate-700">{edu.degree}</div>
                          <div className="text-xs text-slate-500 mt-1">{edu.dates}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {dataToRender.skills.length > 0 && (
                  <div>
                    <h2 className="text-center text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 pb-1 border-b border-slate-100">{t.skills}</h2>
                    <div className="flex flex-wrap justify-center gap-2">
                      {dataToRender.skills.map((skill, idx) => (
                        <span key={idx} className="text-sm text-slate-700 font-medium border-b border-slate-200 pb-0.5">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {dataToRender.achievements && dataToRender.achievements.length > 0 && (
                <div className="page-break-avoid">
                  <h2 className="text-center text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 pb-1 border-b border-slate-100">{t.awards}</h2>
                  <ul className="list-none text-center space-y-1">
                    {dataToRender.achievements.map((ach, idx) => (
                      <li key={idx} className="text-sm text-slate-700">{ach}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- TEMPLATE: SIDEBAR (Colored Left Col) ---
  if (raw.template === 'sidebar') {
    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div
            ref={containerRef}
            className="w-[210mm] min-h-[297mm] bg-white text-slate-800 relative mx-auto box-border flex flex-col print:w-full print:min-h-0 print:h-auto print:overflow-visible print:print-color-adjust-exact"
          >
            <div className="page-break-avoid">
              <div className="p-8 pb-4">
                <h1 className="text-4xl font-bold text-slate-900 mb-2" style={{ color: themeColor }}>{raw.fullName || "Your Name"}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                  {raw.email && <span>{raw.email}</span>}
                  {raw.phone && <span>{raw.phone}</span>}
                  {raw.location && <span>{raw.location}</span>}
                  {raw.linkedin && <span>{raw.linkedin.replace(/^https?:\/\//, '')}</span>}
                </div>
              </div>
              {/* Color Separator */}
              <div className="w-full h-1 mb-0" style={{ backgroundColor: themeColor }}></div>
            </div>

            <div className="flex flex-col w-full">
              {dataToRender.summary && (
                <div className="flex break-inside-avoid">
                  <div className="w-[160px] text-white p-4 pt-6 text-xs font-bold tracking-widest uppercase text-right shrink-0" style={{ backgroundColor: themeColor }}>
                    {t.profile}
                  </div>
                  <div className="flex-1 p-6 border-b border-slate-100">
                    <p className="text-sm text-slate-700 leading-relaxed">{dataToRender.summary}</p>
                  </div>
                </div>
              )}

              {dataToRender.experience.length > 0 && (
                <div className="flex">
                  <div className="w-[160px] text-white p-4 pt-6 text-xs font-bold tracking-widest uppercase text-right shrink-0" style={{ backgroundColor: themeColor }}>
                    {t.experience}
                  </div>
                  <div className="flex-1 p-6 border-b border-slate-100 space-y-6">
                    {dataToRender.experience.map((exp, idx) => (
                      <div key={idx} className="page-break-avoid">
                        <div className="font-bold text-slate-900">{exp.company}</div>
                        <div className="flex justify-between items-baseline text-sm mb-2">
                          <span className="text-slate-700 italic">{exp.role}</span>
                          <span className="text-slate-500 font-medium">{exp.dates}</span>
                        </div>
                        <ul className="list-disc list-outside ml-4 space-y-1">
                          {exp.bullets.map((bullet, bIdx) => (
                            <li key={bIdx} className="text-sm leading-relaxed text-slate-600 pl-1">{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {dataToRender.internships.length > 0 && (
                <div className="flex">
                  <div className="w-[160px] text-white p-4 pt-6 text-xs font-bold tracking-widest uppercase text-right shrink-0" style={{ backgroundColor: themeColor }}>
                    {t.internships}
                  </div>
                  <div className="flex-1 p-6 border-b border-slate-100 space-y-6">
                    {dataToRender.internships.map((exp, idx) => (
                      <div key={idx} className="page-break-avoid">
                        <div className="font-bold text-slate-900">{exp.company}</div>
                        <div className="flex justify-between items-baseline text-sm mb-2">
                          <span className="text-slate-700 italic">{exp.role}</span>
                          <span className="text-slate-500 font-medium">{exp.dates}</span>
                        </div>
                        <ul className="list-disc list-outside ml-4 space-y-1">
                          {exp.bullets.map((bullet, bIdx) => (
                            <li key={bIdx} className="text-sm leading-relaxed text-slate-600 pl-1">{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {raw.education.length > 0 && (
                <div className="flex break-inside-avoid">
                  <div className="w-[160px] text-white p-4 pt-6 text-xs font-bold tracking-widest uppercase text-right shrink-0" style={{ backgroundColor: themeColor }}>
                    {t.education}
                  </div>
                  <div className="flex-1 p-6 border-b border-slate-100 space-y-4">
                    {raw.education.map((edu, idx) => (
                      <div key={idx}>
                        <div className="font-bold text-slate-900">{edu.school}</div>
                        <div className="text-sm text-slate-700">{edu.degree}</div>
                        <div className="text-sm text-slate-500 mt-1">{edu.dates}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {dataToRender.projects.length > 0 && (
                <div className="flex">
                  <div className="w-[160px] text-white p-4 pt-6 text-xs font-bold tracking-widest uppercase text-right shrink-0" style={{ backgroundColor: themeColor }}>
                    {t.projects}
                  </div>
                  <div className="flex-1 p-6 border-b border-slate-100 space-y-4">
                    {dataToRender.projects.map((proj, idx) => (
                      <div key={idx} className="page-break-avoid">
                        <div className="flex justify-between items-baseline">
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            {proj.name}
                          </div>
                          <span className="text-sm text-slate-500">{proj.dates}</span>
                        </div>
                        <ul className="list-disc list-outside ml-4 mt-2 space-y-1">
                          {proj.bullets.map((bullet, bIdx) => (
                            <li key={bIdx} className="text-sm leading-relaxed text-slate-600 pl-1">{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {dataToRender.volunteering.length > 0 && (
                <div className="flex">
                  <div className="w-[160px] text-white p-4 pt-6 text-xs font-bold tracking-widest uppercase text-right shrink-0" style={{ backgroundColor: themeColor }}>
                    {t.volunteering}
                  </div>
                  <div className="flex-1 p-6 border-b border-slate-100 space-y-4">
                    {dataToRender.volunteering.map((vol, idx) => (
                      <div key={idx} className="page-break-avoid">
                        <div className="flex justify-between items-baseline">
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            {vol.role}
                          </div>
                          <span className="text-sm text-slate-500">{vol.dates}</span>
                        </div>
                        <div className="text-slate-700 text-sm mb-1">{vol.company}</div>
                        <ul className="list-disc list-outside ml-4 mt-2 space-y-1">
                          {vol.bullets.map((bullet, bIdx) => (
                            <li key={bIdx} className="text-sm leading-relaxed text-slate-600 pl-1">{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {dataToRender.skills.length > 0 && (
                <div className="flex break-inside-avoid">
                  <div className="w-[160px] text-white p-4 pt-6 text-xs font-bold tracking-widest uppercase text-right shrink-0" style={{ backgroundColor: themeColor }}>
                    {t.skills}
                  </div>
                  <div className="flex-1 p-6 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                      {dataToRender.skills.map((skill, idx) => (
                        <div key={idx} className="text-sm text-slate-700 font-medium flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full mr-2 opacity-60" style={{ backgroundColor: themeColor }}></span>
                          {skill}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {dataToRender.achievements && dataToRender.achievements.length > 0 && (
                <div className="flex flex-1 break-inside-avoid">
                  <div className="w-[160px] text-white p-4 pt-6 text-xs font-bold tracking-widest uppercase text-right shrink-0" style={{ backgroundColor: themeColor }}>
                    {t.awards}
                  </div>
                  <div className="flex-1 p-6">
                    <ul className="list-disc list-outside ml-4 space-y-2">
                      {dataToRender.achievements.map((ach, idx) => (
                        <li key={idx} className="text-sm leading-relaxed text-slate-600 pl-1">{ach}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Fill remaining height with colored sidebar if needed */}
              <div className="flex flex-1 min-h-[20mm] print:hidden">
                <div className="w-[160px] shrink-0" style={{ backgroundColor: themeColor }}></div>
                <div className="flex-1 bg-white"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === NEW RESUME TEMPLATE: ATS-OPTIMIZED ===
  // Simple, single-column, zero graphics for maximum ATS compatibility
  if (raw.template === 'resume-ats') {
    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div ref={containerRef} className="w-[210mm] min-h-[297mm] bg-white p-[25mm] text-slate-900 mx-auto box-border print:w-full print:min-h-0 print:p-[20mm]">

            {/* Header - Simple Text Only */}
            <header className="mb-8 page-break-avoid">
              <h1 className="text-2xl font-bold uppercase tracking-wide mb-2 text-slate-900">
                {raw.fullName || "YOUR NAME"}
              </h1>
              <div className="text-sm text-slate-700 space-y-1">
                {raw.email && <div>{raw.email}</div>}
                {raw.phone && <div>{raw.phone}</div>}
                {raw.location && <div>{raw.location}</div>}
                {raw.linkedin && <div>{raw.linkedin}</div>}
              </div>
            </header>

            {/* Professional Summary */}
            {dataToRender.summary && (
              <section className="mb-6 page-break-avoid">
                <h2 className="text-base font-bold uppercase mb-3 text-slate-900 border-b-2 border-slate-900 pb-1">
                  PROFESSIONAL SUMMARY
                </h2>
                <p className="text-sm leading-relaxed text-slate-800">{dataToRender.summary}</p>
              </section>
            )}

            {/* Work Experience */}
            {dataToRender.experience.length > 0 && (
              <section className="mb-6">
                <h2 className="text-base font-bold uppercase mb-3 text-slate-900 border-b-2 border-slate-900 pb-1">
                  WORK EXPERIENCE
                </h2>
                <div className="space-y-4">
                  {dataToRender.experience.map((exp, idx) => (
                    <div key={idx} className="page-break-avoid">
                      <div className="flex justify-between mb-1">
                        <h3 className="font-bold text-slate-900">{exp.role}</h3>
                        <span className="text-sm text-slate-600">{exp.dates}</span>
                      </div>
                      <div className="font-semibold text-slate-700 mb-2">{exp.company}</div>
                      <ul className="list-disc list-outside ml-5 space-y-1">
                        {exp.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="text-sm text-slate-700 leading-relaxed">{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Education */}
            {raw.education.length > 0 && (
              <section className="mb-6">
                <h2 className="text-base font-bold uppercase mb-3 text-slate-900 border-b-2 border-slate-900 pb-1">
                  EDUCATION
                </h2>
                <div className="space-y-3">
                  {raw.education.map((edu, idx) => (
                    <div key={idx} className="page-break-avoid">
                      <div className="flex justify-between">
                        <h3 className="font-bold text-slate-900">{edu.degree}</h3>
                        <span className="text-sm text-slate-600">{edu.dates}</span>
                      </div>
                      <div className="text-slate-700">{edu.school}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Skills */}
            {dataToRender.skills.length > 0 && (
              <section className="mb-6 page-break-avoid">
                <h2 className="text-base font-bold uppercase mb-3 text-slate-900 border-b-2 border-slate-900 pb-1">
                  SKILLS
                </h2>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {dataToRender.skills.join(' • ')}
                </p>
              </section>
            )}

            {/* Certifications */}
            {dataToRender.certifications && (
              <section className="mb-6 page-break-avoid">
                <h2 className="text-base font-bold uppercase mb-3 text-slate-900 border-b-2 border-slate-900 pb-1">
                  CERTIFICATIONS
                </h2>
                <p className="text-sm text-slate-700">{dataToRender.certifications}</p>
              </section>
            )}
          </div>
        </div>
      </div>
    );
  }

  // === RESUME TEMPLATE: EXECUTIVE ===
  if (raw.template === 'resume-executive') {
    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div ref={containerRef} className="w-[210mm] min-h-[297mm] bg-white p-[20mm] text-slate-900 mx-auto box-border print:w-full print:min-h-0">
            <header className="mb-8 pb-6 border-b-4 page-break-avoid" style={{ borderColor: themeColor }}>
              <h1 className="text-3xl font-bold mb-2" style={{ color: themeColor }}>{raw.fullName || "EXECUTIVE NAME"}</h1>
              <h2 className="text-xl text-slate-600 mb-4">{raw.targetRole || "Senior Leadership Position"}</h2>
              <div className="flex flex-wrap gap-x-4 text-sm text-slate-700">
                {raw.email && <span>{raw.email}</span>}
                {raw.phone && <span>• {raw.phone}</span>}
                {raw.location && <span>• {raw.location}</span>}
                {raw.linkedin && <span>• {raw.linkedin}</span>}
              </div>
            </header>

            {dataToRender.summary && (
              <section className="mb-6 page-break-avoid">
                <h3 className="text-lg font-bold mb-3 uppercase tracking-wide" style={{ color: themeColor }}>Executive Profile</h3>
                <p className="text-sm leading-relaxed text-slate-800">{dataToRender.summary}</p>
              </section>
            )}

            {dataToRender.experience.length > 0 && (
              <section className="mb-6">
                <h3 className="text-lg font-bold mb-4 uppercase tracking-wide" style={{ color: themeColor }}>Professional Experience</h3>
                <div className="space-y-5">
                  {dataToRender.experience.map((exp, idx) => (
                    <div key={idx} className="page-break-avoid">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-base font-bold text-slate-900">{exp.role}</h4>
                          <p className="text-slate-700 font-semibold">{exp.company}</p>
                        </div>
                        <span className="text-sm text-slate-600 whitespace-nowrap">{exp.dates}</span>
                      </div>
                      <ul className="list-disc list-outside ml-5 space-y-1.5">
                        {exp.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="text-sm text-slate-700 leading-relaxed">{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {raw.education.length > 0 && (
              <section className="mb-6 page-break-avoid">
                <h3 className="text-lg font-bold mb-3 uppercase tracking-wide" style={{ color: themeColor }}>Education</h3>
                <div className="space-y-2">
                  {raw.education.map((edu, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-900">{edu.degree}</span>
                        <span className="text-sm text-slate-600">{edu.dates}</span>
                      </div>
                      <p className="text-slate-700">{edu.school}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    );
  }

  // === RESUME TEMPLATE: CREATIVE ===
  if (raw.template === 'resume-creative') {
    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div ref={containerRef} className="w-[210mm] min-h-[297mm] bg-white mx-auto box-border print:w-full print:min-h-0">
            <div className="grid grid-cols-3 gap-0">
              <div className="col-span-1 p-8 text-white" style={{ backgroundColor: themeColor }}>
                {raw.photo && (
                  <div className="mb-6 page-break-avoid">
                    <img src={raw.photo} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-white mx-auto" />
                  </div>
                )}
                <div className="mb-6 page-break-avoid">
                  <h2 className="text-xs font-bold uppercase tracking-widest mb-3">Contact</h2>
                  <div className="text-xs space-y-2 text-white/90">
                    {raw.email && <div>{raw.email}</div>}
                    {raw.phone && <div>{raw.phone}</div>}
                    {raw.location && <div>{raw.location}</div>}
                  </div>
                </div>
                {dataToRender.skills.length > 0 && (
                  <div className="mb-6 page-break-avoid">
                    <h2 className="text-xs font-bold uppercase tracking-widest mb-3">Skills</h2>
                    <div className="flex flex-wrap gap-2">
                      {dataToRender.skills.map((skill, idx) => (
                        <span key={idx} className="text-xs bg-white/20 px-2 py-1 rounded">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="col-span-2 p-8">
                <header className="mb-6 page-break-avoid">
                  <h1 className="text-3xl font-bold mb-1" style={{ color: themeColor }}>{raw.fullName || "Your Name"}</h1>
                  <p className="text-lg text-slate-600">{raw.targetRole}</p>
                </header>

                {dataToRender.summary && (
                  <section className="mb-6 page-break-avoid">
                    <h3 className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: themeColor }}>About</h3>
                    <p className="text-sm leading-relaxed text-slate-700">{dataToRender.summary}</p>
                  </section>
                )}

                {dataToRender.experience.length > 0 && (
                  <section className="mb-6">
                    <h3 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: themeColor }}>Experience</h3>
                    <div className="space-y-4">
                      {dataToRender.experience.map((exp, idx) => (
                        <div key={idx} className="page-break-avoid">
                          <div className="flex justify-between mb-1">
                            <h4 className="font-bold text-slate-900">{exp.role}</h4>
                            <span className="text-xs text-slate-600">{exp.dates}</span>
                          </div>
                          <p className="text-sm font-semibold text-slate-700 mb-2">{exp.company}</p>
                          <ul className="list-disc list-outside ml-4 space-y-1">
                            {exp.bullets.slice(0, 3).map((bullet, bIdx) => (
                              <li key={bIdx} className="text-xs text-slate-600 leading-relaxed">{bullet}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {raw.education.length > 0 && (
                  <section className="page-break-avoid">
                    <h3 className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: themeColor }}>Education</h3>
                    <div className="space-y-2">
                      {raw.education.map((edu, idx) => (
                        <div key={idx}>
                          <p className="font-bold text-sm text-slate-900">{edu.degree}</p>
                          <p className="text-xs text-slate-700">{edu.school} • {edu.dates}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === RESUME TEMPLATE: TECHNICAL ===
  if (raw.template === 'resume-technical') {
    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div ref={containerRef} className="w-[210mm] min-h-[297mm] bg-white p-[20mm] text-slate-900 mx-auto box-border print:w-full print:min-h-0">
            <header className="mb-6 page-break-avoid">
              <h1 className="text-2xl font-mono font-bold mb-1">{raw.fullName || "DEVELOPER_NAME"}</h1>
              <p className="text-slate-600 font-mono text-sm mb-3">{raw.targetRole}</p>
              <div className="flex flex-wrap gap-x-3 text-xs font-mono text-slate-700">
                {raw.email && <span>{raw.email}</span>}
                {raw.location && <span>| {raw.location}</span>}
                {raw.linkedin && <span>| {raw.linkedin}</span>}
              </div>
            </header>

            {dataToRender.skills.length > 0 && (
              <section className="mb-6 page-break-avoid">
                <h3 className="text-sm font-mono font-bold mb-2 pb-1 border-b-2 border-slate-900">TECHNICAL_STACK</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {dataToRender.skills.map((skill, idx) => (
                    <div key={idx} className="font-mono text-slate-700">• {skill}</div>
                  ))}
                </div>
              </section>
            )}

            {dataToRender.experience.length > 0 && (
              <section className="mb-6">
                <h3 className="text-sm font-mono font-bold mb-3 pb-1 border-b-2 border-slate-900">EXPERIENCE</h3>
                <div className="space-y-4">
                  {dataToRender.experience.map((exp, idx) => (
                    <div key={idx} className="page-break-avoid">
                      <div className="flex justify-between mb-1">
                        <h4 className="font-mono font-bold text-sm">{exp.role}</h4>
                        <span className="font-mono text-xs text-slate-600">{exp.dates}</span>
                      </div>
                      <p className="font-mono text-xs text-slate-700 mb-2">{exp.company}</p>
                      <ul className="list-none space-y-1">
                        {exp.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="text-xs text-slate-700 leading-relaxed">→ {bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {dataToRender.projects.length > 0 && (
              <section className="mb-6">
                <h3 className="text-sm font-mono font-bold mb-3 pb-1 border-b-2 border-slate-900">PROJECTS</h3>
                <div className="space-y-3">
                  {dataToRender.projects.map((proj, idx) => (
                    <div key={idx} className="page-break-avoid">
                      <h4 className="font-mono font-bold text-sm">{proj.name}</h4>
                      <ul className="list-none space-y-0.5 mt-1">
                        {proj.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="text-xs text-slate-700">→ {bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {raw.education.length > 0 && (
              <section className="page-break-avoid">
                <h3 className="text-sm font-mono font-bold mb-2 pb-1 border-b-2 border-slate-900">EDUCATION</h3>
                {raw.education.map((edu, idx) => (
                  <div key={idx} className="font-mono text-sm">
                    <span className="font-bold">{edu.degree}</span> | {edu.school} | {edu.dates}
                  </div>
                ))}
              </section>
            )}
          </div>
        </div>
      </div>
    );
  }

  // === RESUME TEMPLATE: ENTRY-LEVEL ===
  if (raw.template === 'resume-entry') {
    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div ref={containerRef} className="w-[210mm] min-h-[297mm] bg-white p-[22mm] text-slate-900 mx-auto box-border print:w-full print:min-h-0">
            <header className="text-center mb-6 page-break-avoid">
              <h1 className="text-2xl font-bold mb-2">{raw.fullName || "Your Name"}</h1>
              <p className="text-slate-600 mb-3">{raw.targetRole}</p>
              <div className="text-sm text-slate-700 flex flex-wrap justify-center gap-x-3">
                {raw.email && <span>{raw.email}</span>}
                {raw.phone && <span>• {raw.phone}</span>}
                {raw.linkedin && <span>• {raw.linkedin}</span>}
              </div>
            </header>

            {raw.education.length > 0 && (
              <section className="mb-6 page-break-avoid">
                <h3 className="text-base font-bold mb-3 pb-2 border-b-2" style={{ borderColor: themeColor, color: themeColor }}>Education</h3>
                {raw.education.map((edu, idx) => (
                  <div key={idx} className="mb-3">
                    <div className="flex justify-between">
                      <h4 className="font-bold">{edu.degree}</h4>
                      <span className="text-sm text-slate-600">{edu.dates}</span>
                    </div>
                    <p className="text-slate-700">{edu.school}</p>
                  </div>
                ))}
              </section>
            )}

            {dataToRender.skills.length > 0 && (
              <section className="mb-6 page-break-avoid">
                <h3 className="text-base font-bold mb-3 pb-2 border-b-2" style={{ borderColor: themeColor, color: themeColor }}>Skills</h3>
                <p className="text-sm text-slate-700 leading-relaxed">{dataToRender.skills.join(' • ')}</p>
              </section>
            )}

            {dataToRender.projects.length > 0 && (
              <section className="mb-6">
                <h3 className="text-base font-bold mb-3 pb-2 border-b-2" style={{ borderColor: themeColor, color: themeColor }}>Projects</h3>
                <div className="space-y-3">
                  {dataToRender.projects.map((proj, idx) => (
                    <div key={idx} className="page-break-avoid">
                      <h4 className="font-bold text-slate-900">{proj.name}</h4>
                      <ul className="list-disc list-outside ml-5 space-y-1 mt-1">
                        {proj.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="text-sm text-slate-700">{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {dataToRender.experience.length > 0 && (
              <section className="mb-6">
                <h3 className="text-base font-bold mb-3 pb-2 border-b-2" style={{ borderColor: themeColor, color: themeColor }}>Experience</h3>
                <div className="space-y-3">
                  {dataToRender.experience.map((exp, idx) => (
                    <div key={idx} className="page-break-avoid">
                      <div className="flex justify-between">
                        <h4 className="font-bold">{exp.role}</h4>
                        <span className="text-sm text-slate-600">{exp.dates}</span>
                      </div>
                      <p className="text-slate-700 font-semibold mb-1">{exp.company}</p>
                      <ul className="list-disc list-outside ml-5 space-y-0.5">
                        {exp.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="text-sm text-slate-700">{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    );
  }

  // === CV TEMPLATE: RESEARCH-FOCUSED ===
  if (raw.template === 'cv-research') {
    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div ref={containerRef} className="w-[210mm] min-h-[297mm] bg-white p-[20mm] text-slate-900 font-serif mx-auto box-border print:w-full print:min-h-0">
            <header className="mb-8 text-center border-b-2 border-slate-900 pb-6 page-break-avoid">
              <h1 className="text-3xl font-bold uppercase mb-2">{raw.fullName || "RESEARCHER NAME"}</h1>
              <p className="text-slate-700 mb-3">{raw.targetRole}</p>
              <div className="text-sm text-slate-600 flex flex-wrap justify-center gap-x-3">
                {raw.email && <span>{raw.email}</span>}
                {raw.location && <span>• {raw.location}</span>}
                {raw.website && <span>• {raw.website.replace(/^https?:\/\//, '')}</span>}
              </div>
            </header>

            {dataToRender.summary && (
              <section className="mb-6 page-break-avoid">
                <h2 className="text-base font-bold uppercase tracking-wide border-b border-slate-300 pb-1 mb-3">Research Interests</h2>
                <p className="text-sm leading-relaxed">{dataToRender.summary}</p>
              </section>
            )}

            {raw.education.length > 0 && (
              <section className="mb-6">
                <h2 className="text-base font-bold uppercase tracking-wide border-b border-slate-300 pb-1 mb-3">Education</h2>
                <div className="space-y-3">
                  {raw.education.map((edu, idx) => (
                    <div key={idx} className="page-break-avoid">
                      <div className="flex justify-between">
                        <span className="font-bold">{edu.degree}</span>
                        <span className="text-sm text-slate-600">{edu.dates}</span>
                      </div>
                      <p className="text-slate-700">{edu.school}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {dataToRender.experience.length > 0 && (
              <section className="mb-6">
                <h2 className="text-base font-bold uppercase tracking-wide border-b border-slate-300 pb-1 mb-3">Research Experience</h2>
                <div className="space-y-4">
                  {dataToRender.experience.map((exp, idx) => (
                    <div key={idx} className="page-break-avoid">
                      <div className="flex justify-between mb-1">
                        <span className="font-bold">{exp.role}</span>
                        <span className="text-sm text-slate-600">{exp.dates}</span>
                      </div>
                      <p className="italic text-slate-700 mb-2">{exp.company}</p>
                      <ul className="list-disc list-outside ml-5 space-y-1">
                        {exp.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="text-sm text-slate-700">{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {dataToRender.publications && (
              <section className="mb-6 page-break-avoid">
                <h2 className="text-base font-bold uppercase tracking-wide border-b border-slate-300 pb-1 mb-3">Selected Publications</h2>
                <p className="text-sm text-slate-700">{dataToRender.publications}</p>
              </section>
            )}

            {dataToRender.skills.length > 0 && (
              <section className="page-break-avoid">
                <h2 className="text-base font-bold uppercase tracking-wide border-b border-slate-300 pb-1 mb-3">Technical Skills</h2>
                <p className="text-sm text-slate-700">{dataToRender.skills.join(' • ')}</p>
              </section>
            )}
          </div>
        </div>
      </div >
    );
  }

  // === CV TEMPLATE: MEDICAL ===
  if (raw.template === 'cv-medical') {
    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div ref={containerRef} className="w-[210mm] min-h-[297mm] bg-white p-[20mm] text-slate-900 mx-auto box-border print:w-full print:min-h-0">
            <header className="mb-6 pb-4 border-b-2 page-break-avoid" style={{ borderColor: themeColor }}>
              <h1 className="text-2xl font-bold mb-1">{raw.fullName || "PHYSICIAN NAME"}</h1>
              <p className="text-lg text-slate-600 mb-3">{raw.targetRole}</p>
              <div className="text-sm text-slate-700 grid grid-cols-2 gap-2">
                {raw.email && <div>Email: {raw.email}</div>}
                {raw.phone && <div>Phone: {raw.phone}</div>}
                {raw.location && <div>Location: {raw.location}</div>}
                {raw.linkedin && <div>LinkedIn: {raw.linkedin}</div>}
              </div>
            </header>

            {dataToRender.certifications && (
              <section className="mb-6 page-break-avoid">
                <h2 className="text-base font-bold uppercase tracking-wide mb-3" style={{ color: themeColor }}>Certifications & Licenses</h2>
                <p className="text-sm text-slate-700 leading-relaxed">{dataToRender.certifications}</p>
              </section>
            )}

            {raw.education.length > 0 && (
              <section className="mb-6 page-break-avoid">
                <h2 className="text-base font-bold uppercase tracking-wide mb-3" style={{ color: themeColor }}>Medical Education</h2>
                <div className="space-y-3">
                  {raw.education.map((edu, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between">
                        <span className="font-bold">{edu.degree}</span>
                        <span className="text-sm text-slate-600">{edu.dates}</span>
                      </div>
                      <p className="text-slate-700">{edu.school}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {dataToRender.experience.length > 0 && (
              <section className="mb-6">
                <h2 className="text-base font-bold uppercase tracking-wide mb-3" style={{ color: themeColor }}>Clinical Experience</h2>
                <div className="space-y-4">
                  {dataToRender.experience.map((exp, idx) => (
                    <div key={idx} className="page-break-avoid">
                      <div className="flex justify-between">
                        <span className="font-bold">{exp.role}</span>
                        <span className="text-sm text-slate-600">{exp.dates}</span>
                      </div>
                      <p className="text-slate-700 font-semibold mb-2">{exp.company}</p>
                      <ul className="list-disc list-outside ml-5 space-y-1">
                        {exp.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="text-sm text-slate-700">{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {dataToRender.skills.length > 0 && (
              <section className="page-break-avoid">
                <h2 className="text-base font-bold uppercase tracking-wide mb-3" style={{ color: themeColor }}>Specializations & Skills</h2>
                <p className="text-sm text-slate-700">{dataToRender.skills.join(' • ')}</p>
              </section>
            )}
          </div>
        </div>
      </div>
    );
  }

  // === CV TEMPLATE: FACULTY ===
  if (raw.template === 'cv-faculty') {
    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div ref={containerRef} className="w-[210mm] min-h-[297mm] bg-white p-[20mm] text-slate-900 font-serif mx-auto box-border print:w-full print:min-h-0">
            <header className="mb-6 text-center border-b-2 border-slate-900 pb-4 page-break-avoid">
              <h1 className="text-2xl font-bold uppercase mb-1">{raw.fullName || "FACULTY NAME"}</h1>
              <p className="text-slate-700">{raw.targetRole}</p>
              <div className="text-sm text-slate-600 mt-2">
                {raw.email} • {raw.location} • {raw.website && raw.website.replace(/^https?:\/\//, '')}
              </div>
            </header>

            {dataToRender.summary && (
              <section className="mb-6 page-break-avoid">
                <h2 className="text-base font-bold uppercase border-b border-slate-300 pb-1 mb-3">Teaching Philosophy</h2>
                <p className="text-sm leading-relaxed">{dataToRender.summary}</p>
              </section>
            )}

            {raw.education.length > 0 && (
              <section className="mb-6 page-break-avoid">
                <h2 className="text-base font-bold uppercase border-b border-slate-300 pb-1 mb-3">Academic Qualifications</h2>
                <div className="space-y-2">
                  {raw.education.map((edu, idx) => (
                    <div key={idx}>
                      <span className="font-bold">{edu.degree}</span>, {edu.school}, {edu.dates}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {dataToRender.experience.length > 0 && (
              <section className="mb-6">
                <h2 className="text-base font-bold uppercase border-b border-slate-300 pb-1 mb-3">Teaching Experience</h2>
                <div className="space-y-3">
                  {dataToRender.experience.map((exp, idx) => (
                    <div key={idx} className="page-break-avoid">
                      <div className="flex justify-between mb-1">
                        <span className="font-bold">{exp.role}</span>
                        <span className="text-sm text-slate-600">{exp.dates}</span>
                      </div>
                      <p className="italic mb-2">{exp.company}</p>
                      <ul className="list-disc list-outside ml-5 space-y-0.5 text-sm">
                        {exp.bullets.map((bullet, bIdx) => (
                          <li key={bIdx}>{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {dataToRender.publications && (
              <section className="mb-6 page-break-avoid">
                <h2 className="text-base font-bold uppercase border-b border-slate-300 pb-1 mb-3">Publications</h2>
                <p className="text-sm">{dataToRender.publications}</p>
              </section>
            )}
          </div>
        </div>
      </div>
    );
  }

  // === CV TEMPLATE: SCIENTIFIC ===
  if (raw.template === 'cv-scientific') {
    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div ref={containerRef} className="w-[210mm] min-h-[297mm] bg-white p-[20mm] text-slate-900 mx-auto box-border print:w-full print:min-h-0">
            <header className="mb-6 page-break-avoid">
              <h1 className="text-2xl font-bold mb-1">{raw.fullName || "SCIENTIST NAME"}</h1>
              <p className="text-lg text-slate-600 mb-2">{raw.targetRole}</p>
              <div className="text-sm text-slate-700 flex gap-x-3">
                {raw.email && <span>{raw.email}</span>}
                {raw.phone && <span>| {raw.phone}</span>}
                {raw.location && <span>| {raw.location}</span>}
              </div>
            </header>

            {dataToRender.skills.length > 0 && (
              <section className="mb-6 page-break-avoid">
                <h2 className="text-base font-bold uppercase border-b-2 border-slate-900 pb-1 mb-3">Technical Expertise</h2>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  {dataToRender.skills.map((skill, idx) => (
                    <div key={idx}>• {skill}</div>
                  ))}
                </div>
              </section>
            )}

            {raw.education.length > 0 && (
              <section className="mb-6 page-break-avoid">
                <h2 className="text-base font-bold uppercase border-b-2 border-slate-900 pb-1 mb-3">Education</h2>
                {raw.education.map((edu, idx) => (
                  <div key={idx} className="mb-2">
                    <div className="font-bold">{edu.degree} - {edu.school}</div>
                    <div className="text-sm text-slate-600">{edu.dates}</div>
                  </div>
                ))}
              </section>
            )}

            {dataToRender.experience.length > 0 && (
              <section className="mb-6">
                <h2 className="text-base font-bold uppercase border-b-2 border-slate-900 pb-1 mb-3">Research & Lab Experience</h2>
                <div className="space-y-4">
                  {dataToRender.experience.map((exp, idx) => (
                    <div key={idx} className="page-break-avoid">
                      <div className="flex justify-between">
                        <span className="font-bold">{exp.role}</span>
                        <span className="text-sm text-slate-600">{exp.dates}</span>
                      </div>
                      <p className="text-slate-700 mb-2">{exp.company}</p>
                      <ul className="list-disc list-outside ml-5 space-y-0.5 text-sm">
                        {exp.bullets.map((bullet, bIdx) => (
                          <li key={bIdx}>{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {dataToRender.publications && (
              <section className="page-break-avoid">
                <h2 className="text-base font-bold uppercase border-b-2 border-slate-900 pb-1 mb-3">Publications</h2>
                <p className="text-sm">{dataToRender.publications}</p>
              </section>
            )}
          </div>
        </div>
      </div>
    );
  }

  // === CV TEMPLATE: INTERNATIONAL ===
  if (raw.template === 'cv-international') {
    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div ref={containerRef} className="w-[210mm] min-h-[297mm] bg-white p-[20mm] text-slate-900 mx-auto box-border print:w-full print:min-h-0">
            <header className="mb-6 flex gap-6 page-break-avoid">
              {raw.photo && (
                <div className="w-32 h-32 flex-shrink-0">
                  <img src={raw.photo} alt="Profile" className="w-full h-full object-cover border-2 border-slate-300" />
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{raw.fullName || "YOUR NAME"}</h1>
                <p className="text-slate-600 mb-3">{raw.targetRole}</p>
                <div className="text-sm text-slate-700 space-y-1">
                  {raw.email && <div>Email: {raw.email}</div>}
                  {raw.phone && <div>Phone: {raw.phone}</div>}
                  {raw.location && <div>Address: {raw.location}</div>}
                  {raw.linkedin && <div>LinkedIn: {raw.linkedin}</div>}
                </div>
              </div>
            </header>

            {dataToRender.summary && (
              <section className="mb-6 page-break-avoid">
                <h2 className="text-base font-bold uppercase tracking-wide bg-slate-100 px-3 py-2 mb-3">Professional Profile</h2>
                <p className="text-sm leading-relaxed px-3">{dataToRender.summary}</p>
              </section>
            )}

            {dataToRender.experience.length > 0 && (
              <section className="mb-6">
                <h2 className="text-base font-bold uppercase tracking-wide bg-slate-100 px-3 py-2 mb-3">Work Experience</h2>
                <div className="space-y-3 px-3">
                  {dataToRender.experience.map((exp, idx) => (
                    <div key={idx} className="page-break-avoid">
                      <div className="flex justify-between mb-1">
                        <span className="font-bold">{exp.role}</span>
                        <span className="text-sm text-slate-600">{exp.dates}</span>
                      </div>
                      <p className="text-slate-700 font-semibold mb-2">{exp.company}</p>
                      <ul className="list-disc list-outside ml-5 space-y-0.5 text-sm">
                        {exp.bullets.map((bullet, bIdx) => (
                          <li key={bIdx}>{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {raw.education.length > 0 && (
              <section className="mb-6 page-break-avoid">
                <h2 className="text-base font-bold uppercase tracking-wide bg-slate-100 px-3 py-2 mb-3">Education</h2>
                <div className="space-y-2 px-3">
                  {raw.education.map((edu, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between">
                        <span className="font-bold">{edu.degree}</span>
                        <span className="text-sm text-slate-600">{edu.dates}</span>
                      </div>
                      <p className="text-slate-700">{edu.school}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {dataToRender.skills.length > 0 && (
              <section className="page-break-avoid">
                <h2 className="text-base font-bold uppercase tracking-wide bg-slate-100 px-3 py-2 mb-3">Skills & Competencies</h2>
                <p className="text-sm px-3">{dataToRender.skills.join(' • ')}</p>
              </section>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
});

ResumePreview.displayName = 'ResumePreview';
export default ResumePreview;

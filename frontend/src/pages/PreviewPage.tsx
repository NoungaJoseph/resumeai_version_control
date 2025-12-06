import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckIcon, DownloadIcon, SparklesIcon } from '../components/Icons';
import { useResume } from '../context/ResumeContext';
import ResumePreview from '../components/ResumePreview';
import { PaymentModal } from '../components/PaymentModal';
import { DownloadVerificationModal } from '../components/DownloadVerificationModal';
import { UI } from '../constants';

export const PreviewPage: React.FC = () => {
    const navigate = useNavigate();
    const { data, setData, aiOutput, aiCoverLetter } = useResume();
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isDownloadVerificationOpen, setIsDownloadVerificationOpen] = useState(false);
    const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [autoFitZoom, setAutoFitZoom] = useState(1);
    const printRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const t = UI;

    // Calculate auto-fit zoom based on viewport
    useEffect(() => {
        const calculateAutoFit = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                const a4Width = 794; // A4 width in pixels at 96 DPI
                const padding = 40; // Account for padding
                const calculatedZoom = Math.min((containerWidth - padding) / a4Width, 1.2);
                setAutoFitZoom(calculatedZoom);
                setZoom(calculatedZoom);
            }
        };

        calculateAutoFit();
        window.addEventListener('resize', calculateAutoFit);
        return () => window.removeEventListener('resize', calculateAutoFit);
    }, []);

    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev + 0.1, 2.0));
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev - 0.1, 0.3));
    };

    const handleResetZoom = () => {
        setZoom(autoFitZoom);
    };

    const handleDownloadClick = () => {
        // Bypass payment for testing/dev
        // if (!data.isPaid) {
        //     setIsPaymentModalOpen(true);
        //     return;
        // }
        setIsDownloadVerificationOpen(true);
    };

    const handleDownloadConfirmed = () => {
        setIsDownloadVerificationOpen(false);
        executeDownload();

        setTimeout(() => {
            setData(prev => ({
                ...prev,
                isPaid: false,
                hasDownloaded: true
            }));
        }, 2000);
    };

    const handlePaymentSuccess = () => {
        setData(prev => ({
            ...prev,
            isPaid: true,
            hasDownloaded: false
        }));
        setIsPaymentModalOpen(false);
        setShowSuccessAnimation(true);

        setTimeout(() => {
            setIsDownloadVerificationOpen(true);
        }, 500);

        setTimeout(() => setShowSuccessAnimation(false), 3000);
    };

    const executeDownload = () => {
        setTimeout(async () => {
            if (printRef.current && printRef.current.downloadAsPDF) {
                try {
                    await printRef.current.downloadAsPDF();
                } catch (error) {
                    console.error("PDF Download failed", error);
                    alert("Failed to generate PDF. Please try again.");
                }
            } else {
                alert("Preview not ready. Please try again.");
            }
        }, 500);
    };




    return (
        <div className="h-screen flex flex-col bg-slate-50">
            {/* Navigation */}
            <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm flex-none">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white transition-all duration-300 group-hover:scale-110" style={{ backgroundColor: data.themeColor }}>
                            <SparklesIcon className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-xl text-slate-800 group-hover:text-slate-600 transition-colors">ResumeAI</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/edit')}
                            className="text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            Back to Edit
                        </button>
                        <button
                            onClick={handleDownloadClick}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all hover:scale-105 shadow-sm ${data.hasDownloaded
                                ? 'bg-slate-400 text-white cursor-not-allowed'
                                : 'bg-slate-900 text-white hover:bg-slate-800'
                                }`}
                        >
                            {data.hasDownloaded ? (
                                <>
                                    <CheckIcon className="w-4 h-4" />
                                    <span className="hidden sm:inline">{t.downloaded}</span>
                                </>
                            ) : (
                                <>
                                    <DownloadIcon className="w-4 h-4" />
                                    <span className="hidden sm:inline">{t.download}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </nav>

            <main ref={containerRef} className="flex-1 w-full overflow-auto bg-slate-100/50">
                <div className="max-w-full mx-auto p-4 sm:p-8 flex flex-col items-center">
                    {/* Zoom Controls */}
                    <div className="mb-4 flex items-center gap-2 bg-white rounded-lg shadow-md px-4 py-2 sticky top-4 z-10">
                        <button
                            onClick={handleZoomOut}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                            disabled={zoom <= 0.3}
                            title="Zoom Out"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                        </button>
                        <span className="text-sm font-medium text-slate-700 min-w-[50px] text-center">
                            {Math.round(zoom * 100)}%
                        </span>
                        <button
                            onClick={handleZoomIn}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                            disabled={zoom >= 2.0}
                            title="Zoom In"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                        <button
                            onClick={handleResetZoom}
                            className="ml-2 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded transition-colors"
                            title="Reset to Auto-fit"
                        >
                            Fit
                        </button>
                    </div>

                    {/* Preview with zoom transform */}
                    <div
                        style={{
                            transform: `scale(${zoom})`,
                            transformOrigin: 'top center',
                            transition: 'transform 0.2s ease-out'
                        }}
                    >
                        <ResumePreview ref={printRef} raw={data} aiContent={aiOutput} aiCoverLetter={aiCoverLetter} />
                    </div>
                </div>
            </main>

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onSuccess={handlePaymentSuccess}
                amountXAF={300}
            />

            <DownloadVerificationModal
                isOpen={isDownloadVerificationOpen}
                onClose={() => setIsDownloadVerificationOpen(false)}
                onConfirm={handleDownloadConfirmed}
            />

            {showSuccessAnimation && (
                <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
                    <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-bounce">
                        <div className="flex items-center gap-2">
                            <CheckIcon className="w-5 h-5" />
                            <span className="font-semibold">{t.success}</span>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        @media print {
          nav, .print\\:hidden {
            display: none !important;
          }
          body {
            background: white;
          }
        }
      `}</style>
        </div>
    );
};

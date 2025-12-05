import React, { useState, useRef } from 'react';
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
    const printRef = useRef<any>(null);
    const t = UI;

    const handleDownloadClick = () => {
        if (!data.isPaid) {
            setIsPaymentModalOpen(true);
            return;
        }
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


    const [zoomLevel, setZoomLevel] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initial fit to screen
    React.useEffect(() => {
        const fitToScreen = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.clientWidth;
                const containerHeight = containerRef.current.clientHeight;
                const padding = 40; // 20px padding on each side

                // A4 dimensions in pixels at 96 DPI (approx)
                const a4Width = 794;
                const a4Height = 1123;

                const scaleX = (containerWidth - padding) / a4Width;
                const scaleY = (containerHeight - padding) / a4Height;

                // Use the smaller scale to ensure full visibility
                const scale = Math.min(scaleX, scaleY, 1); // Cap at 1 (100%)
                setZoomLevel(scale);
            }
        };

        fitToScreen();
        window.addEventListener('resize', fitToScreen);
        return () => window.removeEventListener('resize', fitToScreen);
    }, []);

    const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.1, 2));
    const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.1, 0.3));
    const handleFitScreen = () => {
        if (containerRef.current) {
            const containerWidth = containerRef.current.clientWidth;
            const containerHeight = containerRef.current.clientHeight;
            const padding = 40;
            const a4Width = 794;
            const a4Height = 1123;
            const scale = Math.min((containerWidth - padding) / a4Width, (containerHeight - padding) / a4Height, 1);
            setZoomLevel(scale);
        }
    };

    return (
        <div className="h-screen flex flex-col bg-slate-50 print:bg-white overflow-hidden">
            {/* Navigation */}
            <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 print:hidden shadow-sm flex-none">
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
                                : data.isPaid
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : 'bg-slate-900 text-white hover:bg-slate-800 ring-2 ring-offset-2 ring-slate-900'
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
                                    <span className="hidden sm:inline">{data.isPaid ? t.download : t.download}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </nav>

            <main className="flex-1 relative w-full h-full overflow-hidden bg-slate-100/50 print:bg-white">
                {/* Zoom Controls */}
                <div className="absolute bottom-8 right-8 z-40 flex flex-col gap-2 bg-white p-2 rounded-xl shadow-lg border border-slate-200 print:hidden">
                    <button onClick={handleZoomIn} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600" title="Zoom In">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    </button>
                    <button onClick={handleZoomOut} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600" title="Zoom Out">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                    </button>
                    <button onClick={handleFitScreen} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600" title="Fit to Screen">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                    </button>
                    <div className="text-xs text-center text-slate-400 font-medium border-t border-slate-100 pt-2 mt-1">
                        {Math.round(zoomLevel * 100)}%
                    </div>
                </div>

                <div
                    ref={containerRef}
                    className="w-full h-full overflow-auto flex items-center justify-center p-8 print:p-0 print:block"
                >
                    <div
                        className="transition-transform duration-200 ease-out print:transform-none origin-center"
                        style={{ transform: `scale(${zoomLevel})` }}
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

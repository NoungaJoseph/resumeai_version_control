import React from 'react';
import { AlertTriangleIcon, CheckIcon, XIcon } from './Icons';

interface DownloadVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export const DownloadVerificationModal: React.FC<DownloadVerificationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangleIcon className="w-8 h-8" />
                    </div>

                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Check Before Downloading</h2>

                    <div className="text-slate-600 space-y-3 mb-6 text-sm">
                        <p>
                            Please review your document carefully in the preview screen.
                        </p>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 text-left text-xs">
                            <strong>Important:</strong> Once you download, this session will be marked as complete. Any future downloads will require a new payment.
                        </div>
                        <p>
                            Are you sure everything is correct and you are ready to download?
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                        >
                            <XIcon className="w-4 h-4" />
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-lg flex items-center justify-center gap-2"
                        >
                            <CheckIcon className="w-4 h-4" />
                            Confirm & Download
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

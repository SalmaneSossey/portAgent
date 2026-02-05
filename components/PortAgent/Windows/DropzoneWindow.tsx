
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DropzoneWindowProps {
    isOpen: boolean;
    file?: File | null;
    progress: number; // 0-100
    status: string;
}

export const DropzoneWindow: React.FC<DropzoneWindowProps> = ({ isOpen, file, progress, status }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, x: 20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.95 }}
                    className="fixed bottom-32 right-[450px] w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-40"
                >
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                        <span className="text-xs font-bold uppercase text-gray-500 tracking-wider">Zone de Dépôt</span>
                        <i className="fa-solid fa-cloud-arrow-up text-gray-400"></i>
                    </div>
                    <div className="p-6 flex flex-col items-center">
                        {file ? (
                            <>
                                <div className="w-16 h-16 bg-red-50 rounded-lg flex items-center justify-center mb-4 text-red-500 text-3xl">
                                    <i className="fa-solid fa-file-pdf"></i>
                                </div>
                                <div className="text-sm font-medium text-gray-700 mb-1 truncate max-w-full">{file.name}</div>
                                <div className="text-xs text-gray-400 mb-4">{(file.size / 1024).toFixed(0)} KB</div>

                                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                                    <motion.div
                                        className="h-full bg-[#0a1d37]"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                                <div className="flex items-center gap-2 text-xs text-[#0a1d37] font-medium animate-pulse">
                                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                                    {status}
                                </div>
                            </>
                        ) : (
                            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 w-full flex flex-col items-center text-center">
                                <i className="fa-solid fa-download text-gray-300 text-2xl mb-2"></i>
                                <span className="text-xs text-gray-400">Glissez votre facture ici</span>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

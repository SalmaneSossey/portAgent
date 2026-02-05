
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PipelineWindowProps {
    isOpen: boolean;
    currentStep: number; // 0 to 4
}

const STEPS = [
    { label: "Analyse Sémantique", duration: 800 },
    { label: "Extraction des Entités", duration: 1200 },
    { label: "Validation Business (The Judge)", duration: 1500 },
    { label: "Vérification Position Tarifaire", duration: 1000 },
    { label: "Génération du Package", duration: 800 }
];

export const PipelineWindow: React.FC<PipelineWindowProps> = ({ isOpen, currentStep }) => {
    const [minimized, setMinimized] = useState(false);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`fixed bottom-32 right-[450px] w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-40 transition-all ${minimized ? 'h-12' : 'h-auto'}`}
                >
                    <div
                        className="bg-[#0a1d37] text-white px-4 py-3 flex justify-between items-center cursor-pointer"
                        onClick={() => setMinimized(!minimized)}
                    >
                        <div className="flex items-center gap-2">
                            <i className="fa-solid fa-microchip text-yellow-400"></i>
                            <span className="text-xs font-bold uppercase tracking-wider">Pipeline IA</span>
                        </div>
                        <i className={`fa-solid fa-chevron-${minimized ? 'up' : 'down'} text-xs`}></i>
                    </div>

                    {!minimized && (
                        <div className="p-4 space-y-4">
                            {STEPS.map((step, index) => {
                                const status = index < currentStep ? 'completed' : index === currentStep ? 'active' : 'pending';
                                return (
                                    <div key={index} className="flex items-center gap-3">
                                        <div className={`
                                            w-6 h-6 rounded-full flex items-center justify-center text-[10px] border-2 transition-all
                                            ${status === 'completed' ? 'bg-green-500 border-green-500 text-white' :
                                                status === 'active' ? 'border-[#0a1d37] text-[#0a1d37] animate-pulse bg-blue-50' :
                                                    'border-gray-200 text-gray-300'}
                                        `}>
                                            {status === 'completed' ? <i className="fa-solid fa-check"></i> : index + 1}
                                        </div>
                                        <div className="flex flex-col flex-1">
                                            <span className={`text-xs font-medium ${status === 'pending' ? 'text-gray-400' : 'text-gray-800'}`}>
                                                {step.label}
                                            </span>
                                            {status === 'active' && (
                                                <div className="h-1 w-full bg-gray-100 rounded-full mt-1 overflow-hidden">
                                                    <motion.div
                                                        className="h-full bg-[#0a1d37]"
                                                        initial={{ width: "0%" }}
                                                        animate={{ width: "100%" }}
                                                        transition={{ duration: step.duration / 1000, ease: "linear" }}
                                                    />
                                                </div>
                                            )}
                                            {status === 'completed' && (
                                                <span className="text-[9px] text-gray-400">{step.duration}ms</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

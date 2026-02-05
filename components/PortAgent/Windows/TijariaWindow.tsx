
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TijariaWindowProps {
    isOpen: boolean;
    query: string;
    answer?: string;
    checklist?: string[];
    loading?: boolean;
}

export const TijariaWindow: React.FC<TijariaWindowProps> = ({ isOpen, query, answer, checklist, loading }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, x: 20, y: 20 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, x: 20, y: 20 }}
                    className="fixed bottom-32 right-[450px] w-96 bg-gradient-to-br from-emerald-50 to-white rounded-xl shadow-2xl border border-emerald-100 overflow-hidden z-40"
                >
                    <div className="bg-emerald-600 px-4 py-3 flex justify-between items-center text-white">
                        <div className="flex items-center gap-2">
                            <i className="fa-solid fa-seedling text-white"></i>
                            <span className="text-xs font-bold uppercase tracking-wider">TijarIA Insight</span>
                        </div>
                        <span className="text-[10px] bg-emerald-700 px-2 py-0.5 rounded">Assistant Réglementaire</span>
                    </div>

                    <div className="p-5">
                        <div className="text-xs font-medium text-emerald-800 mb-2 opacity-75">REQUÊTE</div>
                        <div className="text-sm font-semibold text-gray-800 mb-4 italic">"{query}"</div>

                        {loading ? (
                            <div className="space-y-2 animate-pulse">
                                <div className="h-4 bg-emerald-100 rounded w-3/4"></div>
                                <div className="h-4 bg-emerald-100 rounded w-full"></div>
                                <div className="h-4 bg-emerald-100 rounded w-5/6"></div>
                            </div>
                        ) : (
                            <>
                                <div className="text-sm text-gray-600 mb-4 leading-relaxed bg-white/50 p-3 rounded border border-emerald-50">
                                    {answer}
                                </div>

                                {checklist && checklist.length > 0 && (
                                    <div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Exigences Documentaires</div>
                                        <ul className="space-y-1">
                                            {checklist.map((item, idx) => (
                                                <li key={idx} className="flex items-center gap-2 text-xs text-gray-700">
                                                    <i className="fa-solid fa-check text-emerald-500 text-[10px]"></i>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};


import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface JuryConsoleProps {
    isOpen: boolean;
    logs: any[];
    payload?: any;
}

export const JuryConsole: React.FC<JuryConsoleProps> = ({ isOpen, logs, payload }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, x: -300 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -300 }}
                    className="fixed top-4 left-4 min-w-[400px] max-w-lg bottom-4 bg-black/95 backdrop-blur-md rounded-lg shadow-2xl z-[100] border border-gray-800 flex flex-col font-mono"
                >
                    <div className="p-3 border-b border-gray-800 bg-gray-900/50 flex justify-between items-center">
                        <span className="text-yellow-500 font-bold text-xs tracking-[0.2em] flex items-center gap-2">
                            <i className="fa-solid fa-gavel"></i>
                            CONSOLE JURY
                        </span>
                        <div className="flex gap-2 text-[10px] text-gray-500">
                            <span>V 1.0.4</span>
                            <span>DEBUG_MODE</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {/* Stream of system thoughts used for "Jury" demo purposes */}
                        <div className="space-y-3">
                            {logs.map((log, i) => (
                                <div key={i} className="flex gap-3 text-[10px]">
                                    <span className="text-gray-500 shrink-0">{log.time}</span>
                                    <span className={`${log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-green-400' : 'text-blue-300'}`}>
                                        [{log.source}]
                                    </span>
                                    <span className="text-gray-300">{log.message}</span>
                                </div>
                            ))}
                        </div>

                        {payload && (
                            <div className="mt-8 border-t border-gray-800 pt-4">
                                <span className="text-gray-500 text-[10px] uppercase mb-2 block">Payload Preview</span>
                                <pre className="text-[10px] text-green-500 bg-gray-900 p-2 rounded overflow-x-auto">
                                    {JSON.stringify(payload, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

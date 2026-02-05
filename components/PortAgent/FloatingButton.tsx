
import React from 'react';
import { motion } from 'framer-motion';
import { PortAgentLogo } from './Logo';

interface FloatingButtonProps {
    onClick: () => void;
    isOpen: boolean;
}

export const FloatingButton: React.FC<FloatingButtonProps> = ({ onClick, isOpen }) => {
    return (
        <motion.button
            layoutId="portagent-launcher"
            onClick={onClick}
            className={`fixed bottom-8 right-8 z-50 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center group
        ${isOpen ? 'w-16 h-16 bg-white border border-gray-200' : 'w-20 h-20 bg-white border-4 border-[#0a1d37]/10 hover:border-[#0a1d37]/30 hover:scale-105 active:scale-95'}
      `}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
        >
            {isOpen ? (
                <i className="fa-solid fa-xmark text-2xl text-gray-500"></i>
            ) : (
                <div className="relative">
                    <PortAgentLogo size={48} className="" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
            )}
        </motion.button>
    );
};

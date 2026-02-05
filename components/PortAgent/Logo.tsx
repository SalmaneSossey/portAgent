
import React from 'react';

export const PortAgentLogo = ({ className = "h-10", size = 100 }: { className?: string, size?: number }) => (
    <div className={`relative flex items-center justify-center ${className}`}>
        <svg viewBox="0 0 100 100" height={size} width={size} className="text-[#0a1d37] drop-shadow-sm" fill="currentColor">
            <path d="M50 15 L55 15 L55 25 L45 25 L45 15 Z" />
            <path d="M40 25 H60 V35 H40 Z" />
            <path d="M35 35 H65 V45 H35 Z" />
            <path d="M25 45 L20 65 L50 85 L80 65 L75 45 Z" />
            <rect x="42" y="28" width="16" height="4" fill="white" opacity="0.8" />
        </svg>
        <div className="absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4 w-[30%] h-[30%] bg-[#f59e0b] rounded-full border-2 border-white flex items-center justify-center shadow-sm z-10">
            <span className="text-white font-bold text-[10px]">د</span>
        </div>
    </div>
);

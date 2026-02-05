import React from 'react'

interface FloatingButtonProps {
    onClick: () => void
}

export const FloatingButton: React.FC<FloatingButtonProps> = ({ onClick }) => {
    return (
        <button className="floating-button" onClick={onClick}>
            <img
                src="/assets/portagent-logo.png"
                alt="PortAgent"
                onError={(e) => {
                    // Fallback to text if image fails
                    const btn = (e.target as HTMLImageElement).parentElement
                    if (btn) {
                        btn.innerHTML = '<span style="color: white; font-weight: bold; font-size: 14px;">PA</span>'
                    }
                }}
            />
        </button>
    )
}

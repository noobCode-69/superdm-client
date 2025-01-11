import React from 'react'

interface DownCaretIconProps {
    className?: string
}

const DownCaretIcon: React.FC<DownCaretIconProps> = ({ className = '' }) => {
    return (
        <div
            className={`w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-current inline-block ${className}`}
            aria-hidden="true"
        />
    )
}

export default DownCaretIcon


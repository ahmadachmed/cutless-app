import React from "react";

interface CircularProgressProps {
    value: number;
    size?: number;
    strokeWidth?: number;
    className?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
    value,
    size = 16,
    strokeWidth = 4,
    className = "",
}) => {
    const radius = size / 2;
    // Adjust radius to account for stroke width so it fits within the viewBox
    const normalizedRadius = radius - strokeWidth / 2;
    const circumference = 2 * Math.PI * normalizedRadius;
    const offset = circumference - (value / 100) * circumference;

    return (
        <svg
            height={size}
            width={size}
            className={`transform -rotate-90 ${className}`}
            viewBox={`0 0 ${size} ${size}`}
        >
            <circle
                className="text-gray-300"
                strokeWidth={strokeWidth}
                stroke="currentColor"
                fill="transparent"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
            />
            <circle
                className="text-black transition-all duration-500 ease-out"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference + " " + circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
            />
        </svg>
    );
};

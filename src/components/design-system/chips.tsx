
export const PauseIcon = ({ className = '', size = 24 }) => {
  return (
    <div className={`inline-flex ${className}`} style={{ width: size, height: size }}>
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24"
      width={size}
      height={size}
    >
      <circle cx="12" cy="12" r="10" fill="#E5E7EB"/>
      <rect x="9" y="8" width="2" height="8" rx="1" fill="#6B7280"/>
      <rect x="13" y="8" width="2" height="8" rx="1" fill="#6B7280"/>
    </svg>
    </div>
  );
};






import React from 'react';
import { Check } from 'lucide-react';

export type StatusMode = 'ONLINE' | 'OFFLINE';
export type StatusState = "ACTIVE" | "PUBLISHED";

export interface StatusChipProps {
  mode?: StatusMode;
  status?: StatusState;
  showDot?: boolean;
  className?: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({ 
  mode, 
  status,
  showDot = true,
  className = ''
}) => {
  const getStateStyles = () => {
    if (status === "PUBLISHED" || mode === "OFFLINE") {
      return {
        bg: "bg-gray-50",
        text: "text-gray-600",
        dot: "bg-gray-400",
        border: "border-gray-300",
      };
    }
    
    return {
      bg: 'bg-green-50',
      text: 'text-green-700',
      dot: 'bg-green-500',
      border: 'border-gray-300',
    };
  };

  const styles = getStateStyles();
  const displayText = status || mode;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-sm px-3 py-1 border ${styles.bg} ${styles.border} transition-all duration-200 ${className}`}
    >
      {status === "PUBLISHED" ? (
        <PauseIcon />
      ) : status ? (
        //   <StatusCheck />
        <div className="flex items-center justify-center rounded-full bg-green-500 p-1">
          <Check className="h-2 w-2 text-white" />
        </div>
      ) : (
        showDot && <div className={`h-2 w-2 rounded-full ${styles.dot}`} />
      )}
      <div className="flex items-center gap-1">
        <span className={`text-sm font-medium ${styles.text}`}>
          {displayText}
        </span>
      </div>
    </div>
  );
};



export const StatusCheck = () => (
    <div className="flex items-center justify-center rounded-full bg-green-500 p-1">
      <Check className="h-3 w-3 text-white" />
    </div>
  );
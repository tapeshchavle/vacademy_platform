import { Check } from "lucide-react";

export const StatusCheck = () => (
  <div className="flex items-center justify-center rounded-full bg-green-500 p-1">
    <Check className="h-3 w-3 text-white" />
  </div>
);

export type PlayMode = "EXAM" | "MOCK" | "PRACTICE" | "SURVEY";

export interface StatusChipProps {
  playMode: PlayMode;
  className?: string;
}

const playModeColors: Record<PlayMode, string> = {
  EXAM: "bg-success-400 text-black",
  MOCK: "bg-purple-50 text-black",
  PRACTICE: "bg-blue-50 text-black",
  SURVEY: "bg-red-50 text-black",
};

export const StatusChip = ({ playMode, className }: StatusChipProps) => {
  return (
    <div className={`inline-flex items-center rounded-sm px-2 py-1  border border-gray-200 ${playModeColors[playMode]} ${className}`}>
      <div className="w-2 h-2 rounded-full bg-white opacity-75 mr-1.5" />
      <span className="text-xs font-medium">{playMode}</span>
    </div>
  );
};

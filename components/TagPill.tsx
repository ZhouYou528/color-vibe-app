"use client";

interface TagPillProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

export default function TagPill({ label, selected, onClick }: TagPillProps) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-full text-sm font-medium transition-all
        ${
          selected
            ? "bg-amber-700 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }
      `}
    >
      {label}
    </button>
  );
}

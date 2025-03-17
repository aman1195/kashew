import React from "react";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  className?: string;
}

const predefinedColors = [
  "#f44336", // Red
  "#e91e63", // Pink
  "#9c27b0", // Purple
  "#673ab7", // Deep Purple
  "#3f51b5", // Indigo
  "#2196f3", // Blue
  "#03a9f4", // Light Blue
  "#00bcd4", // Cyan
  "#009688", // Teal
  "#4caf50", // Green
  "#8bc34a", // Light Green
  "#cddc39", // Lime
  "#ffeb3b", // Yellow
  "#ffc107", // Amber
  "#ff9800", // Orange
  "#ff5722", // Deep Orange
  "#795548", // Brown
  "#9e9e9e", // Grey
  "#607d8b", // Blue Grey
  "#000000", // Black
  "#ffffff", // White
];

export function ColorPicker({ color, onChange, className }: ColorPickerProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <div
          className="h-8 w-8 rounded-md border border-input"
          style={{ backgroundColor: color }}
        />
        <input
          type="text"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="flex h-9 w-[180px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-9 cursor-pointer appearance-none rounded-md border border-input bg-background p-0"
        />
      </div>
      <div className="flex flex-wrap gap-1 pt-2">
        {predefinedColors.map((presetColor) => (
          <button
            key={presetColor}
            className={cn(
              "h-6 w-6 rounded-md border border-input",
              color === presetColor && "ring-2 ring-ring",
            )}
            style={{ backgroundColor: presetColor }}
            onClick={() => onChange(presetColor)}
            type="button"
          />
        ))}
      </div>
    </div>
  );
}

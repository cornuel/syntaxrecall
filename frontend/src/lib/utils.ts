import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const LANGUAGE_MAP = {
  py: { 
    name: "Python", 
    icon: "python", 
    color: "text-[#3776AB] drop-shadow-[0_0_8px_rgba(55,118,171,0.5)]", 
    bg: "bg-[#3776AB]/10", 
    border: "border-[#3776AB]/20" 
  },
  js: { 
    name: "JavaScript", 
    icon: "javascript", 
    color: "text-[#F7DF1E] drop-shadow-[0_0_8px_rgba(247,223,30,0.5)]", 
    bg: "bg-[#F7DF1E]/10", 
    border: "border-[#F7DF1E]/20" 
  },
  ts: { 
    name: "TypeScript", 
    icon: "typescript", 
    color: "text-[#3178C6] drop-shadow-[0_0_8px_rgba(49,120,198,0.5)]", 
    bg: "bg-[#3178C6]/10", 
    border: "border-[#3178C6]/20" 
  },
  jsx: { 
    name: "React JS", 
    icon: "react", 
    color: "text-[#61DAFB] drop-shadow-[0_0_8px_rgba(97,218,251,0.5)]", 
    bg: "bg-[#61DAFB]/10", 
    border: "border-[#61DAFB]/20" 
  },
  tsx: { 
    name: "React TS", 
    icon: "react", 
    color: "text-[#61DAFB] drop-shadow-[0_0_8px_rgba(97,218,251,0.5)]", 
    bg: "bg-[#61DAFB]/10", 
    border: "border-[#61DAFB]/20" 
  },
  html: { 
    name: "HTML", 
    icon: "html5", 
    color: "text-[#E34F26] drop-shadow-[0_0_8px_rgba(227,79,38,0.5)]", 
    bg: "bg-[#E34F26]/10", 
    border: "border-[#E34F26]/20" 
  },
  css: { 
    name: "CSS", 
    icon: "css3", 
    color: "text-[#1572B6] drop-shadow-[0_0_8px_rgba(21,114,182,0.5)]", 
    bg: "bg-[#1572B6]/10", 
    border: "border-[#1572B6]/20" 
  },
  sql: { 
    name: "PostgreSQL", 
    icon: "postgresql", 
    color: "text-[#4169E1] drop-shadow-[0_0_8px_rgba(65,105,225,0.5)]", 
    bg: "bg-[#4169E1]/10", 
    border: "border-[#4169E1]/20" 
  },
  sh: { 
    name: "Bash", 
    icon: "bash", 
    color: "text-[#4EAA25] drop-shadow-[0_0_8px_rgba(78,170,37,0.5)]", 
    bg: "bg-[#4EAA25]/10", 
    border: "border-[#4EAA25]/20" 
  },
} as const;

export type SupportedLanguage = keyof typeof LANGUAGE_MAP;

export function getTagStyle(tag: string) {
  const t = tag.toLowerCase();
  
  if (t.startsWith("lang:")) {
    const lang = t.replace("lang:", "") as SupportedLanguage;
    const config = LANGUAGE_MAP[lang];
    if (config) {
      const colorHex = config.color.match(/#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/)?.[0] || "#3178C6";
      return {
        bg: config.bg,
        text: config.color,
        border: config.border,
        glow: `shadow-[0_0_12px_rgba(${hexToRgb(colorHex)},0.25)]`,
        label: t.replace("lang:", "")
      };
    }
  }

  if (t.startsWith("syntax:")) {
    return {
      bg: "bg-[#00FF41]/10",
      text: "text-[#00FF41]",
      border: "border-[#00FF41]/30",
      glow: "shadow-[0_0_12px_rgba(0,255,65,0.2)]",
      label: t.replace("syntax:", "")
    };
  }

  if (t.startsWith("concept:")) {
    return {
      bg: "bg-[#FF00FF]/10",
      text: "text-[#FF00FF]",
      border: "border-[#FF00FF]/30",
      glow: "shadow-[0_0_12px_rgba(255,0,255,0.2)]",
      label: t.replace("concept:", "")
    };
  }

  if (t.startsWith("lib:")) {
    return {
      bg: "bg-[#00F3FF]/10",
      text: "text-[#00F3FF]",
      border: "border-[#00F3FF]/30",
      glow: "shadow-[0_0_12px_rgba(0,243,255,0.25)]",
      label: t.replace("lib:", "")
    };
  }

  // Default
  return {
    bg: "bg-secondary/20",
    text: "text-foreground/80",
    border: "border-border/50",
    glow: "shadow-none",
    label: t
  };
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "255,255,255";
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}

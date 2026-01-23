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
  vue: { 
    name: "Vue.js", 
    icon: "vuejs", 
    color: "text-[#4FC08D] drop-shadow-[0_0_8px_rgba(79,192,141,0.5)]", 
    bg: "bg-[#4FC08D]/10", 
    border: "border-[#4FC08D]/20" 
  },
  go: { 
    name: "Go", 
    icon: "go", 
    color: "text-[#00ADD8] drop-shadow-[0_0_8px_rgba(0,173,216,0.5)]", 
    bg: "bg-[#00ADD8]/10", 
    border: "border-[#00ADD8]/20" 
  },
  rust: { 
    name: "Rust", 
    icon: "rust", 
    color: "text-[#DEA584] drop-shadow-[0_0_8px_rgba(222,165,132,0.5)]", 
    bg: "bg-[#DEA584]/10", 
    border: "border-[#DEA584]/20" 
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
  java: { 
    name: "Java", 
    icon: "java", 
    color: "text-[#007396] drop-shadow-[0_0_8px_rgba(0,115,150,0.5)]", 
    bg: "bg-[#007396]/10", 
    border: "border-[#007396]/20" 
  },
  cpp: { 
    name: "C++", 
    icon: "cplusplus", 
    color: "text-[#00599C] drop-shadow-[0_0_8px_rgba(0,89,156,0.5)]", 
    bg: "bg-[#00599C]/10", 
    border: "border-[#00599C]/20" 
  },
  ruby: { 
    name: "Ruby", 
    icon: "ruby", 
    color: "text-[#CC342D] drop-shadow-[0_0_8px_rgba(204,52,45,0.5)]", 
    bg: "bg-[#CC342D]/10", 
    border: "border-[#CC342D]/20" 
  },
  php: { 
    name: "PHP", 
    icon: "php", 
    color: "text-[#777BB4] drop-shadow-[0_0_8px_rgba(119,123,180,0.5)]", 
    bg: "bg-[#777BB4]/10", 
    border: "border-[#777BB4]/20" 
  },
} as const;

export type SupportedLanguage = keyof typeof LANGUAGE_MAP;

export function getTagStyle(tag: string) {
  const t = tag.toLowerCase();
  
  if (t.startsWith("lang:")) {
    return {
      bg: "bg-sapphire/15",
      text: "text-sapphire",
      border: "border-sapphire/40",
      glow: "shadow-[0_0_15px_rgba(114,135,253,0.25)]",
      label: t.replace("lang:", "")
    };
  }

  if (t.startsWith("syntax:")) {
    return {
      bg: "bg-green/15",
      text: "text-green",
      border: "border-green/40",
      glow: "shadow-[0_0_15px_rgba(166,227,161,0.25)]",
      label: t.replace("syntax:", "")
    };
  }

  if (t.startsWith("concept:")) {
    return {
      bg: "bg-mauve/15",
      text: "text-mauve",
      border: "border-mauve/40",
      glow: "shadow-[0_0_15px_rgba(203,166,247,0.25)]",
      label: t.replace("concept:", "")
    };
  }

  if (t.startsWith("lib:")) {
    return {
      bg: "bg-sky/15",
      text: "text-sky",
      border: "border-sky/40",
      glow: "shadow-[0_0_15px_rgba(137,220,235,0.25)]",
      label: t.replace("lib:", "")
    };
  }

  if (t.startsWith("framework:")) {
    return {
      bg: "bg-pink/15",
      text: "text-pink",
      border: "border-pink/40",
      glow: "shadow-[0_0_15px_rgba(245,194,231,0.25)]",
      label: t.replace("framework:", "")
    };
  }

  if (t.startsWith("pattern:")) {
    return {
      bg: "bg-peach/15",
      text: "text-peach",
      border: "border-peach/40",
      glow: "shadow-[0_0_15px_rgba(250,179,135,0.25)]",
      label: t.replace("pattern:", "")
    };
  }

  // Default
  return {
    bg: "bg-overlay/10",
    text: "text-overlay",
    border: "border-overlay/30",
    glow: "shadow-none",
    label: t
  };
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "255,255,255";
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}

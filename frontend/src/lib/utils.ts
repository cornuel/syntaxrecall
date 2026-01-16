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

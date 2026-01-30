"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

interface TypewriterTextProps {
  text: string;
  delay?: number;
  className?: string;
  cursor?: boolean;
}

export function TypewriterText({
  text,
  delay = 50,
  className,
  cursor = true,
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, delay]);

  return (
    <span className={cn("font-mono", className)}>
      {displayedText}
      {cursor && currentIndex < text.length && (
        <span className="animate-pulse text-primary">|</span>
      )}
    </span>
  );
}

interface GlitchTextProps {
  text: string;
  className?: string;
  trigger?: boolean;
}

export function GlitchText({
  text,
  className,
  trigger = false,
}: GlitchTextProps) {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    if (trigger) {
      const timeout1 = setTimeout(() => setIsGlitching(true), 0);
      const timeout2 = setTimeout(() => setIsGlitching(false), 300);
      return () => {
        clearTimeout(timeout1);
        clearTimeout(timeout2);
      };
    }
  }, [trigger]);

  return (
    <span
      className={cn(isGlitching ? "glitch" : "", className)}
      data-text={text}
    >
      {text}
    </span>
  );
}

interface HolographicTextProps {
  text: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function HolographicText({
  text,
  className,
  size = "md",
}: HolographicTextProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-4xl",
  };

  return (
    <motion.span
      animate={{
        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        ease: "linear",
      }}
      className={cn(
        "font-bold bg-clip-text text-transparent bg-[length:300%_auto] bg-gradient-to-r from-rosewater via-flamingo to-mauve",
        sizeClasses[size],
        className,
      )}
    >
      {text}
    </motion.span>
  );
}

interface NeonTextProps {
  text: string;
  color?: "cyan" | "magenta" | "electric" | "lime" | "red";
  className?: string;
}

export function NeonText({ text, color = "cyan", className }: NeonTextProps) {
  const colorClasses = {
    cyan: "text-[var(--tech-cyan)] drop-shadow-[0_0_8px_rgba(4,165,229,0.4)]",
    magenta:
      "text-[var(--tech-magenta)] drop-shadow-[0_0_8px_rgba(234,118,203,0.4)]",
    electric:
      "text-[var(--tech-electric)] drop-shadow-[0_0_8px_rgba(136,57,239,0.4)]",
    lime: "text-[var(--tech-lime)] drop-shadow-[0_0_8_px_rgba(64,160,43,0.4)]",
    red: "text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]",
  };

  return (
    <span className={cn("font-bold", colorClasses[color], className)}>
      {text}
    </span>
  );
}

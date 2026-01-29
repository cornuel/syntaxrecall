"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  catppuccinDarkTheme,
  catppuccinLightTheme,
} from "@/lib/syntax-themes";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface CodePreviewProps {
  value: string;
  language: string;
  className?: string;
  height?: string;
}

export function CodePreview({
  value,
  language,
  className = "",
  height = "180px",
}: CodePreviewProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return (
      <div className={`bg-muted/20 w-full ${className}`} style={{ height }} />
    );
  }

  const baseStyle =
    resolvedTheme === "dark" ? catppuccinDarkTheme : catppuccinLightTheme;

  // Custom styles to match the Monaco editor look and ensure consistency
  const customStyle = {
    ...baseStyle,
    'pre[class*="language-"]': {
      ...baseStyle['pre[class*="language-"]'],
      margin: 0,
      padding: "1rem",
      backgroundColor: "transparent",
      background: "none",
      textShadow: "none",
      fontFamily: "var(--font-iosevka)",
      fontSize: "16px",
      lineHeight: "1.5",
    },
    'code[class*="language-"]': {
      ...baseStyle['code[class*="language-"]'],
      backgroundColor: "transparent",
      background: "none",
      textShadow: "none",
      fontFamily: "var(--font-iosevka)",
      fontSize: "16px",
    },
  };

  return (
    <div
      className={`relative group  rounded-none border border-border overflow-hidden bg-background/70 ${className}`}
      style={{ height }}
    >
      <SyntaxHighlighter
        language={language.toLowerCase()}
        style={customStyle}
        showLineNumbers={true}
        wrapLines={true}
        customStyle={{
          margin: 0,
          padding: "1rem",
          height: "100%",
        }}
        lineNumberStyle={{
          minWidth: "2em",
          paddingRight: "1em",
          textAlign: "right",
          color: "var(--primary)",
          opacity: 1,
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
}

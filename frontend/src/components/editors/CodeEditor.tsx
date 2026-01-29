"use client";

import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { Loader2, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CodeEditorProps {
  value: string;
  onChange?: (value: string | undefined) => void;
  language: string;
  height?: string;
  className?: string;
  readOnly?: boolean;
  isZoomed?: boolean;
}

const LANGUAGE_MAP: Record<string, string> = {
  js: "javascript",
  javascript: "javascript",
  ts: "typescript",
  typescript: "typescript",
  py: "python",
  python: "python",
  html: "html",
  css: "css",
  react: "typescript",
  tsx: "typescript",
  vue: "html",
  go: "go",
  rust: "rust",
  java: "java",
  cpp: "cpp",
  ruby: "ruby",
  php: "php",
  sql: "sql",
  json: "json",
};

export function CodeEditor({
  value,
  onChange,
  language,
  height = "300px",
  className = "",
  readOnly = false,
  isZoomed = false,
}: CodeEditorProps) {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const monacoLanguage =
    LANGUAGE_MAP[language.toLowerCase()] || language.toLowerCase();

  // Calculate dynamic height if "auto" is requested
  // Base line height is ~21px at 14px font size.
  // When zoomed (16px font), line height is ~24px.
  const lineHeight = isZoomed ? 24 : 21;
  const finalHeight =
    height === "auto"
      ? `${Math.max(60, (value || "").split("\n").length * lineHeight + 32)}px`
      : height;

  return (
    <div
      className={`relative group rounded-none border border-border overflow-hidden bg-primary ${className}`}
    >
      {/* Copy Button - Visible on Hover */}
      <div className="absolute top-3 right-3 z-20 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <Button
          type="button"
          variant="neon"
          size="icon-sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleCopy();
          }}
          className="w-8 h-8 bg-muted backdrop-blur-sm border-border/10 hover:border-border/20"
        >
          {copied ? (
            <Check className="w-4 h-4 text-success" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      </div>

      <Editor
        height={finalHeight}
        language={monacoLanguage}
        value={value}
        theme={theme === "dark" ? "vs-dark" : "light"}
        onChange={onChange}
        loading={
          <div className="flex justify-center items-center h-full bg-muted/20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        }
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: isZoomed ? 16 : 14,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          padding: { top: 16, bottom: 16 },
          fontFamily: "var(--font-iosevka)",
          wordWrap: "on",
          glyphMargin: false,
          folding: false,
          lineDecorationsWidth: 10,
          lineNumbersMinChars: 2,
          scrollbar: {
            vertical: readOnly ? "auto" : "visible",
            horizontal: readOnly ? "auto" : "visible",
          },
          domReadOnly: readOnly,
        }}
      />
    </div>
  );
}

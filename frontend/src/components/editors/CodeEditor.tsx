"use client";

import Editor, { loader } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { Loader2, Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

// Define Catppuccin themes for Monaco
const defineThemes = (monaco: any) => {
  monaco.editor.defineTheme("catppuccin-latte", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "comment", foreground: "9ca0af", fontStyle: "italic" },
      { token: "keyword", foreground: "8839ef" },
      { token: "string", foreground: "40a02b" },
      { token: "number", foreground: "fe640b" },
      { token: "regexp", foreground: "df8e1d" },
      { token: "type", foreground: "df8e1d" },
      { token: "class", foreground: "df8e1d" },
      { token: "function", foreground: "1e66f5" },
      { token: "variable", foreground: "d20f39" },
      { token: "operator", foreground: "04a5e5" },
      { token: "constant", foreground: "fe640b" },
    ],
    colors: {
      "editor.background": "#eff1f5",
      "editor.foreground": "#4c4f69",
      "editorLineNumber.foreground": "#9ca0af",
      "editor.lineHighlightBackground": "#e6e9ef",
      "editorCursor.foreground": "#8839ef",
      "editorIndentGuide.background": "#dce0e8",
      "editorIndentGuide.activeBackground": "#9ca0af",
    },
  });

  monaco.editor.defineTheme("catppuccin-mocha", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "6c7086", fontStyle: "italic" },
      { token: "keyword", foreground: "cba6f7" },
      { token: "string", foreground: "a6e3a1" },
      { token: "number", foreground: "fab387" },
      { token: "regexp", foreground: "f9e2af" },
      { token: "type", foreground: "f9e2af" },
      { token: "class", foreground: "f9e2af" },
      { token: "function", foreground: "89dceb" },
      { token: "variable", foreground: "f38ba8" },
      { token: "operator", foreground: "89dceb" },
      { token: "constant", foreground: "fab387" },
    ],
    colors: {
      "editor.background": "#1e1e2e",
      "editor.foreground": "#cdd6f4",
      "editorLineNumber.foreground": "#6c7086",
      "editor.lineHighlightBackground": "#313244",
      "editorCursor.foreground": "#cba6f7",
      "editorIndentGuide.background": "#45475a",
      "editorIndentGuide.activeBackground": "#6c7086",
    },
  });
};

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
  const { resolvedTheme } = useTheme();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loader.init().then((monaco) => {
      defineThemes(monaco);
    });
  }, []);

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
    <div className={`relative group  overflow-hidden ${className}`}>
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
        theme={
          resolvedTheme === "dark" ? "catppuccin-mocha" : "catppuccin-latte"
        }
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

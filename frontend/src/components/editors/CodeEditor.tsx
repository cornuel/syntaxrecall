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
    sql: "sql",
    json: "json",
};

export function CodeEditor({ 
    value, 
    onChange, 
    language, 
    height = "300px",
    className = "",
    readOnly = false 
}: CodeEditorProps) {
    const { theme } = useTheme();
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const monacoLanguage = LANGUAGE_MAP[language.toLowerCase()] || language.toLowerCase();

    return (
        <div className={`relative group rounded-xl border border-border overflow-hidden bg-[#1e1e2e] ${className}`}>
            {/* Copy Button - Visible on Hover */}
            <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                    variant="tech"
                    size="icon-sm"
                    onClick={handleCopy}
                    className="h-8 w-8 bg-[#1e1e2e]/80 backdrop-blur-sm border-white/10 hover:border-white/20"
                >
                    {copied ? (
                        <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                        <Copy className="h-4 w-4 text-white/70" />
                    )}
                </Button>
            </div>

            <Editor
                height={height}
                language={monacoLanguage}
                value={value}
                theme={theme === "dark" ? "vs-dark" : "light"}
                onChange={onChange}
                loading={<div className="flex items-center justify-center h-full bg-muted/20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}
                options={{
                    readOnly,
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    padding: { top: 16, bottom: 16 },
                    fontFamily: "var(--font-jetbrains-mono)",
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

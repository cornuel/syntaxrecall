"use client";

import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { Loader2 } from "lucide-react";

interface CodeEditorProps {
    value: string;
    onChange: (value: string | undefined) => void;
    language: string;
    height?: string;
    className?: string;
}

export function CodeEditor({ 
    value, 
    onChange, 
    language, 
    height = "300px",
    className = "" 
}: CodeEditorProps) {
    const { theme } = useTheme();

    return (
        <div className={`rounded-xl border border-border overflow-hidden bg-[#1e1e2e] ${className}`}>
            <Editor
                height={height}
                language={language.toLowerCase()}
                value={value}
                theme={theme === "dark" ? "vs-dark" : "light"}
                onChange={onChange}
                loading={<div className="flex items-center justify-center h-full bg-muted/20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    padding: { top: 16, bottom: 16 },
                    fontFamily: "var(--font-mono)",
                    wordWrap: "on",
                }}
            />
        </div>
    );
}

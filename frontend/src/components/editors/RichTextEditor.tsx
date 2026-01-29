"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { RichTextContent } from "./RichTextContent";
import { Eye, Edit3 } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-expand textarea
  useEffect(() => {
    if (isPreview) return;
    const textarea = textareaRef.current;
    if (!textarea) return;

    const adjustHeight = () => {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    };

    adjustHeight();
    textarea.addEventListener("input", adjustHeight);
    return () => textarea.removeEventListener("input", adjustHeight);
  }, [value, isPreview]);

  return (
    <div className={cn("rounded-lg border border-border bg-background flex flex-col overflow-hidden", className)}>
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-muted/30 shrink-0">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          <span>{isPreview ? "Preview Mode" : "Markdown Mode"}</span>
          <div className="w-1 h-1 rounded-full bg-primary/40" />
          <span>Explanation Draft</span>
        </div>
        
        <div className="flex bg-muted rounded-md p-0.5 border border-border/50">
          <button
            type="button"
            onClick={() => setIsPreview(false)}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-sm text-[9px] font-bold transition-all",
              !isPreview ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Edit3 className="w-3 h-3" />
            WRITE
          </button>
          <button
            type="button"
            onClick={() => setIsPreview(true)}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-sm text-[9px] font-bold transition-all",
              isPreview ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Eye className="w-3 h-3" />
            PREVIEW
          </button>
        </div>
      </div>

      <div className="relative min-h-[150px] flex flex-col">
        {isPreview ? (
          <div 
            style={{ height: textareaRef.current?.offsetHeight || "auto" }}
            className="p-4 bg-muted/5 overflow-y-auto"
          >
            {value.trim() ? (
              <RichTextContent content={value} isZoomed={false} />
            ) : (
              <p className="text-sm text-muted-foreground/40 italic">Nothing to preview...</p>
            )}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || "Use markdown for bold, lists, and `inline code`..."}
            className={cn(
              "w-full p-4 bg-transparent outline-none resize-none font-mono text-sm leading-relaxed",
              "placeholder:text-muted-foreground/30 text-foreground selection:bg-primary/20"
            )}
          />
        )}
      </div>

      <div className="px-3 py-1.5 border-t border-border bg-muted/10 text-[9px] font-mono text-muted-foreground/50 text-right">
        {isPreview ? "Rendered Content" : "Auto-expanding Workspace"}
      </div>
    </div>
  );
}

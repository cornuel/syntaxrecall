"use client";

import { cn, formatMarkdown } from "@/lib/utils";
import styles from "./RichTextContent.module.css";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface RichTextContentProps {
  content: string;
  className?: string;
  isZoomed?: boolean;
}

export function RichTextContent({ content, className, isZoomed }: RichTextContentProps) {
  const formattedHtml = formatMarkdown(content);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
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
      <div
        className={cn(styles.container, isZoomed && styles.zoomed, className)}
        dangerouslySetInnerHTML={{ __html: formattedHtml }}
      />
    </div>
  );
}

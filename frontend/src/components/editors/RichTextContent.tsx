"use client";

import { cn } from "@/lib/utils";

interface RichTextContentProps {
    content: string;
    className?: string;
}

export function RichTextContent({ content, className }: RichTextContentProps) {
    return (
        <div 
            className={cn(
                "prose prose-invert prose-sm max-w-none text-foreground leading-relaxed",
                "prose-p:my-1 prose-ul:my-1 prose-li:my-0",
                "prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1 prose-code:rounded prose-code:before:content-none prose-code:after:content-none",
                "prose-strong:text-foreground prose-strong:font-bold",
                "prose-a:text-primary prose-a:underline hover:prose-a:text-primary/80",
                className
            )}
            dangerouslySetInnerHTML={{ __html: content }}
        />
    );
}

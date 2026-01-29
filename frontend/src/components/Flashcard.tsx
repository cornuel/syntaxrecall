"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn, LANGUAGE_MAP, type SupportedLanguage, getTagStyle } from "@/lib/utils";
import { type Card as CardType } from "@/lib/api";
import { Code2, BookOpen, Link as LinkIcon, Map } from "lucide-react";
import { CodeEditor } from "./editors/CodeEditor";
import { RichTextContent } from "./editors/RichTextContent";
import { Devicon } from "./devicon";
import Link from "next/link";

interface FlashcardProps {
  card: CardType;
  onGrade?: (rating: number) => void;
}

export function Flashcard({ card, onGrade }: FlashcardProps) {
    const [isRevealed, setIsRevealed] = useState(false);
    const langKey = card.language.toLowerCase() as SupportedLanguage;
    const langConfig = LANGUAGE_MAP[langKey];

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === " " || e.key === "Spacebar") {
                e.preventDefault();
                if (!isRevealed) {
                    setIsRevealed(true);
                }
            }
            
            if (onGrade && isRevealed) {
                if (e.key === "1") onGrade(1); // Again
                if (e.key === "2") onGrade(3); // Hard
                if (e.key === "3") onGrade(4); // Good
                if (e.key === "4") onGrade(5); // Easy
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isRevealed, onGrade]);

    return (
        <div className="w-full max-w-3xl mx-auto">
            <Card className="overflow-hidden bg-card border-border shadow-2xl transition-colors duration-300 relative py-0">
                {/* Background Logo Watermark - Visible from start */}
                <div className="absolute -top-12 -right-12 opacity-[0.08] pointer-events-none rotate-12 z-0">
                    <Devicon 
                        icon={langConfig?.icon || "javascript"} 
                        size={260} 
                    />
                </div>

                <CardContent className="p-8 flex flex-col gap-6 relative z-10 overflow-hidden">
                    {/* Header Section */}
                    <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                            <h2 className={cn(
                                "font-bold text-foreground transition-all duration-300 tracking-tight leading-tight pr-20",
                                isRevealed ? "text-2xl" : "text-4xl py-2"
                            )}>
                                {card.title}
                            </h2>
                            
                            {isRevealed && (
                                <div className="flex items-center gap-4 mt-2 animate-in fade-in slide-in-from-left-2 duration-300">
                                    {card.roadmap_id ? (
                                        <Link 
                                            href={`/roadmaps/${card.roadmap_id}`}
                                            className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline group"
                                        >
                                            <LinkIcon className="w-3 h-3 transition-transform group-hover:rotate-12" />
                                            {card.roadmap_title}
                                        </Link>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                            <Map className="w-3 h-3" />
                                            Manual Entry
                                        </div>
                                    )}
                                    <div className="w-1 h-1 rounded-full bg-border" />
                                    <div className="flex flex-wrap gap-2">
                                        {card.tags.map((tag) => {
                                            const style = getTagStyle(tag);
                                            return (
                                                <span 
                                                    key={tag} 
                                                    className={cn(
                                                        "text-xs font-mono uppercase tracking-wider px-3 py-1 rounded-md border backdrop-blur-md transition-all duration-300",
                                                        style.bg,
                                                        style.text,
                                                        style.border,
                                                        style.glow
                                                    )}
                                                >
                                                    {style.label}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {!isRevealed ? (
                        <div className="flex flex-col items-center gap-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="p-12 rounded-full bg-primary/5 border border-primary/10 relative">
                                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full opacity-20 animate-pulse" />
                                <Code2 className="w-20 h-20 text-primary/30 relative z-10" />
                            </div>
                            <div className="text-center space-y-1">
                                <p className="text-muted-foreground font-medium italic">Visualize the implementation...</p>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40 font-bold">Mental simulation required</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                            {/* Code Core */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between px-1">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Source Implementation</span>
                                    <span className={cn("text-[10px] font-mono uppercase", langConfig?.color)}>
                                        {card.language}
                                    </span>
                                </div>
                                <CodeEditor 
                                    value={card.code_snippet}
                                    language={card.language}
                                    readOnly={true}
                                    height="auto"
                                    isZoomed={true}
                                    className="border-primary/10"
                                />
                            </div>

                            {/* Theory Section */}
                            <div className="pt-6 border-t border-border/50">
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
                                    <BookOpen className="w-3.5 h-3.5 text-primary" />
                                    Technical Analysis
                                </h3>
                                <RichTextContent
                                    content={card.explanation}
                                    isZoomed={true}
                                    className="text-lg font-light leading-relaxed prose-p:text-foreground/90"
                                />
                            </div>

                            {/* Grading Bar */}
                            {onGrade && (
                                <div className="pt-8 border-t border-border flex flex-col gap-4">
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Recall Quality Assessment</span>
                                        <span className="text-[10px] text-muted-foreground/40 italic">Shortcuts: 1 - 4</span>
                                    </div>
                                    <div className="grid grid-cols-4 gap-3">
                                        {[
                                            { label: "Again", rating: 1, color: "bg-red-500/5 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white", time: "<1m" },
                                            { label: "Hard", rating: 3, color: "bg-orange-500/5 text-orange-500 border-orange-500/20 hover:bg-orange-500 hover:text-white", time: "2d" },
                                            { label: "Good", rating: 4, color: "bg-emerald-500/5 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white", time: "4d" },
                                            { label: "Easy", rating: 5, color: "bg-cyan-500/5 text-cyan-500 border-cyan-500/20 hover:bg-cyan-500 hover:text-white", time: "7d" },
                                        ].map((btn) => (
                                            <Button
                                                key={btn.label}
                                                variant="outline"
                                                className={cn(
                                                    "h-14 font-bold transition-all duration-200 border-2 rounded-xl group/btn",
                                                    btn.color
                                                )}
                                                onClick={() => onGrade(btn.rating)}
                                            >
                                                <div className="flex flex-col items-center">
                                                    <span>{btn.label}</span>
                                                    <span className="text-[10px] opacity-40 group-hover/btn:opacity-80 font-mono transition-opacity">{btn.time}</span>
                                                </div>
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {!isRevealed && (
                        <div 
                            className="absolute inset-0 z-20 cursor-pointer" 
                            onClick={() => setIsRevealed(true)} 
                        />
                    )}
                </CardContent>
            </Card>
            <div className="mt-6 flex justify-center gap-8 text-[10px] font-mono text-muted-foreground/30 uppercase tracking-[0.2em]">
                <div className="flex items-center gap-2"><kbd className="bg-muted px-1.5 py-0.5 rounded border border-border/50 text-muted-foreground/60">SPACE</kbd> Next Phase</div>
                <div className="flex items-center gap-2"><kbd className="bg-muted px-1.5 py-0.5 rounded border border-border/50 text-muted-foreground/60">1-4</kbd> Assessment</div>
            </div>
        </div>
    );
}

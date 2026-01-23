"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type Card as CardType } from "@/lib/api";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { useTheme } from "next-themes";
import { catppuccinLightTheme, catppuccinDarkTheme } from "@/lib/syntax-themes";
import { Eye, Code2, BookOpen } from "lucide-react";

interface FlashcardProps {
  card: CardType;
  onGrade?: (rating: number) => void;
}

export function Flashcard({ card, onGrade }: FlashcardProps) {
    const [isRevealed, setIsRevealed] = useState(false);
    const { theme } = useTheme();
    const isDark = theme === "dark";

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

    const getLanguageGradient = (language: string, isDark: boolean) => {

    const gradients: Record<string, { light: string; dark: string }> = {
      js: {
        light: "from-[#f9e2af] to-[#fe640b]",
        dark: "from-[#f9e2af] to-[#fab387]",
      },
      py: {
        light: "from-[#04a5e5] to-[#1e66f5]",
        dark: "from-[#89dceb] to-[#89b4fa]",
      },
      ts: {
        light: "from-[#04a5e5] to-[#1e66f5]",
        dark: "from-[#89dceb] to-[#89b4fa]",
      },
      tsx: {
        light: "from-[#04a5e5] to-[#1e66f5]",
        dark: "from-[#89dceb] to-[#89b4fa]",
      },
      html: {
        light: "from-[#fe640b] to-[#d20f39]",
        dark: "from-[#fab387] to-[#f38ba8]",
      },
      css: {
        light: "from-[#1e66f5] to-[#8839ef]",
        dark: "from-[#89b4fa] to-[#cba6f7]",
      },
      react: {
        light: "from-[#04a5e5] to-[#8839ef]",
        dark: "from-[#89dceb] to-[#cba6f7]",
      },
    };
    const langGradients = gradients[language.toLowerCase()];
    return langGradients
      ? isDark
        ? langGradients.dark
        : langGradients.light
      : isDark
        ? "from-[#89dceb] to-[#89b4fa]"
        : "from-[#04a5e5] to-[#1e66f5]";
  };

  const codeStyle = isDark ? catppuccinDarkTheme : catppuccinLightTheme;

    return (
        <div className="w-full max-w-3xl mx-auto">
            <Card className="overflow-hidden bg-card border-border shadow-2xl transition-colors duration-300">
                <CardContent className="p-8 flex flex-col gap-6">
                    {/* Header: Lang & Tags */}
                    <div className="flex justify-between items-center">
                        <span className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-mono text-white capitalize bg-gradient-to-r shadow-sm",
                            getLanguageGradient(card.language, isDark)
                        )}>
                            {card.language}
                        </span>
                        <div className="flex gap-2">
                            {card.tags.map((tag) => (
                                <span key={tag} className="text-[11px] text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded border border-border/50">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Stage 1: Title */}
                    <div className="text-center space-y-2">
                        <h2 className={cn(
                            "font-bold text-foreground transition-all duration-300 tracking-tight",
                            isRevealed ? "text-2xl" : "text-4xl py-12"
                        )}>
                            {card.title}
                        </h2>
                        {!isRevealed && (
                            <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="p-8 rounded-full bg-primary/5 border border-primary/10">
                                    <Code2 className="w-16 h-16 text-primary/30" />
                                </div>
                                <p className="text-muted-foreground italic text-sm">Visualize the implementation...</p>
                            </div>
                        )}
                    </div>

                    {/* Stage 2 & 3: Revealed Content */}
                    {isRevealed && (
                        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                            {/* Code */}
                            <div className="rounded-xl border border-border bg-[#1e1e2e]/50 overflow-hidden shadow-inner">
                                <SyntaxHighlighter
                                    language={card.language.toLowerCase()}
                                    style={codeStyle}
                                    customStyle={{
                                        margin: 0,
                                        padding: "1.5rem",
                                        fontSize: "0.9rem",
                                        background: "transparent",
                                        lineHeight: "1.6",
                                    }}
                                >
                                    {card.code_snippet}
                                </SyntaxHighlighter>
                            </div>

                            {/* Explanation */}
                            <div className="pt-6 border-t border-border">
                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <BookOpen className="w-4 h-4" />
                                    Deep Dive
                                </h3>
                                <div className="text-foreground leading-relaxed text-lg font-light whitespace-pre-wrap">
                                    {card.explanation}
                                </div>
                            </div>

                            {/* Buttons */}
                            {onGrade && (
                                <div className="pt-8 border-t border-border flex flex-col gap-4">
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">Rate Recall Quality</span>
                                        <span className="text-[10px] text-muted-foreground/60 italic">Shortcut keys: 1 - 4</span>
                                    </div>
                                    <div className="grid grid-cols-4 gap-3">
                                        {[
                                            { label: "Again", rating: 1, color: "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white" },
                                            { label: "Hard", rating: 3, color: "bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500 hover:text-white" },
                                            { label: "Good", rating: 4, color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white" },
                                            { label: "Easy", rating: 5, color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20 hover:bg-cyan-500 hover:text-white" },
                                        ].map((btn) => (
                                            <Button
                                                key={btn.label}
                                                variant="outline"
                                                className={cn(
                                                    "h-14 font-bold transition-all duration-200 border-2",
                                                    btn.color
                                                )}
                                                onClick={() => onGrade(btn.rating)}
                                            >
                                                <div className="flex flex-col items-center">
                                                    <span>{btn.label}</span>
                                                    <span className="text-[10px] opacity-60 font-mono">{btn.rating === 1 ? "<1m" : btn.rating === 3 ? "2d" : btn.rating === 4 ? "4d" : "7d"}</span>
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
            <div className="mt-6 flex justify-center gap-6 text-[10px] font-mono text-muted-foreground uppercase tracking-widest opacity-50">
                <div className="flex items-center gap-1.5"><kbd className="bg-muted px-1.5 py-0.5 rounded border">SPACE</kbd> Next Stage</div>
                <div className="flex items-center gap-1.5"><kbd className="bg-muted px-1.5 py-0.5 rounded border">1-4</kbd> Grade</div>
            </div>
        </div>
    );
}

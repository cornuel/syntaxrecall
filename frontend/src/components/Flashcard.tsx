"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { type Card as CardType } from "@/lib/api";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { useTheme } from "next-themes";
import { catppuccinLightTheme, catppuccinDarkTheme } from "@/lib/syntax-themes";

interface FlashcardProps {
    card: CardType;
    onGrade?: (rating: number) => void;
}

export function Flashcard({ card, onGrade }: FlashcardProps) {
    const [isFlipped, setIsFlipped] = useState(false);
    const { theme } = useTheme();
    const isDark = theme === "dark";

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === ' ' || e.key === 'Spacebar') {
                e.preventDefault();
                setIsFlipped(!isFlipped);
            }
            if (onGrade && isFlipped && e.key >= '0' && e.key <= '5') {
                const rating = parseInt(e.key);
                onGrade(rating);
                setIsFlipped(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFlipped, onGrade]);

    const getLanguageGradient = (language: string, isDark: boolean) => {
        const gradients: Record<string, { light: string; dark: string }> = {
            js: { light: "from-[#f9e2af] to-[#fe640b]", dark: "from-[#f9e2af] to-[#fab387]" },
            py: { light: "from-[#04a5e5] to-[#1e66f5]", dark: "from-[#89dceb] to-[#89b4fa]" },
            ts: { light: "from-[#04a5e5] to-[#1e66f5]", dark: "from-[#89dceb] to-[#89b4fa]" },
            tsx: { light: "from-[#04a5e5] to-[#1e66f5]", dark: "from-[#89dceb] to-[#89b4fa]" },
            html: { light: "from-[#fe640b] to-[#d20f39]", dark: "from-[#fab387] to-[#f38ba8]" },
            css: { light: "from-[#1e66f5] to-[#8839ef]", dark: "from-[#89b4fa] to-[#cba6f7]" },
            react: { light: "from-[#04a5e5] to-[#8839ef]", dark: "from-[#89dceb] to-[#cba6f7]" }
        };
        const langGradients = gradients[language.toLowerCase()];
        return langGradients ? (isDark ? langGradients.dark : langGradients.light) : (isDark ? "from-[#89dceb] to-[#89b4fa]" : "from-[#04a5e5] to-[#1e66f5]");
    };

    const codeStyle = isDark ? catppuccinDarkTheme : catppuccinLightTheme;

    return (
        <div className="group perspective-1000 w-full max-w-2xl aspect-[16/10] cursor-pointer">
            <div
                className={cn(
                    "relative w-full h-full transition-all duration-500 preserve-3d",
                    isFlipped ? "rotate-y-180" : ""
                )}
                onClick={() => setIsFlipped(!isFlipped)}
            >
                {/* Front */}
                <Card className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-6 bg-card border border-border shadow-lg rounded-2xl overflow-hidden group hover:border-primary/50 hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                    <CardContent className="w-full h-full flex flex-col relative z-10">
                        <div className="flex justify-between items-center mb-4">
                            <span className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-mono text-white capitalize bg-gradient-to-r",
                                getLanguageGradient(card.language, isDark)
                            )}>
                                {card.language}
                            </span>
                            <div className="flex gap-2">
                                {card.tags.map((tag) => (
                                    <span key={tag} className="text-[10px] text-muted-foreground font-mono">#{tag}</span>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 flex items-start justify-start overflow-auto py-2 text-left">
                            <SyntaxHighlighter
                                language={card.language.toLowerCase()}
                                style={codeStyle}
                                customStyle={{
                                    margin: 0,
                                    padding: "1rem",
                                    fontSize: "0.8rem",
                                    borderRadius: "0.5rem",
                                    background: "transparent",
                                    textAlign: "left",
                                }}
                            >
                                {card.code_snippet}
                            </SyntaxHighlighter>
                        </div>
                        <div className="mt-4 text-center text-xs text-muted-foreground animate-pulse flex items-center justify-center gap-2">
                            <span>Click or press SPACEBAR to reveal</span>
                            <kbd className="px-2 py-1 bg-muted rounded text-primary font-mono text-[10px] border border-border">SPACE</kbd>
                        </div>
                    </CardContent>
                </Card>

                {/* Back */}
                <Card className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col p-6 bg-card border border-border shadow-lg rounded-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tl from-secondary/5 to-transparent pointer-events-none" />
                    <CardContent className="w-full h-full flex flex-col relative z-10">
                        <h3 className="text-xl font-bold text-foreground mb-4 bg-gradient-to-r from-foreground via-muted-foreground to-foreground bg-clip-text text-transparent">Explanation</h3>
                        <div className="flex-1 overflow-auto text-muted-foreground leading-relaxed">
                            {card.explanation}
                        </div>
                        {onGrade && (
                            <div className="mt-6 flex justify-between items-center gap-2 pt-4 border-t border-border">
                                <div className="text-xs text-muted-foreground mb-2 w-full text-center">Press 0-5 to rate difficulty</div>
                                {[0, 1, 2, 3, 4, 5].map((rating) => (
                                    <button
                                        key={rating}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onGrade(rating);
                                            setIsFlipped(false);
                                        }}
                                        className={cn(
                                            "flex-1 py-2 rounded-lg text-sm font-bold transition-all duration-300 border border-transparent",
                                            rating >= 3
                                                ? "bg-[var(--success)] text-[var(--success-foreground)] border-[var(--success)] hover:bg-[var(--success)]/90 hover:scale-105"
                                                : "bg-[var(--destructive)] text-[var(--destructive-foreground)] border-[var(--destructive)] hover:bg-[var(--destructive)]/90 hover:scale-105"
                                        )}
                                    >
                                        {rating}
                                    </button>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

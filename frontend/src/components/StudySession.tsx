"use client";

import { useState } from "react";
import { Flashcard } from "./Flashcard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { type Card as CardType, useReviewCard } from "@/lib/api";
import { CheckCircle2, RotateCcw, Target, Timer } from "lucide-react";
import { HolographicText, NeonText } from "@/components/Typography";

interface StudySessionProps {
    cards: CardType[];
    onComplete: () => void;
}

export function StudySession({ cards, onComplete }: StudySessionProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const reviewMutation = useReviewCard();

    const handleGrade = async (rating: number) => {
        const card = cards[currentIndex];
        if (!card) return;
        await reviewMutation.mutateAsync({ cardId: card.id, rating });

        if (currentIndex < cards.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setIsFinished(true);
        }
    };

    if (!cards || cards.length === 0 || currentIndex >= cards.length) {
        return (
            <Card className="w-full max-w-md mx-auto bg-card border border-border">
                <CardContent className="pt-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                        <Target className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <NeonText text="No cards scheduled for review!" color="cyan" className="mb-6" />
                    <Button variant="cyber" onClick={onComplete} size="tech">
                        Back to Deck
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (isFinished) {
        return (
            <Card className="w-full max-w-md mx-auto bg-card border border-primary/20 animate-in fade-in zoom-in duration-500">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                            <CheckCircle2 className="w-10 h-10 text-primary" />
                        </div>
                    </div>
                    <HolographicText text="Session Complete!" size="md" className="text-center" />
                </CardHeader>
                <CardContent className="text-center">
                    <NeonText text={`Great job! You've reviewed ${cards.length} cards.`} color="lime" className="mb-6" />
                    <div className="flex gap-4 justify-center">
                        <Button variant="matrix" onClick={() => {
                            setCurrentIndex(0);
                            setIsFinished(false);
                        }} size="tech">
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Review Again
                        </Button>
                        <Button variant="tech" onClick={onComplete} size="tech">
                            Finish
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="relative">
            <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-4xl mx-auto">
                <div className="w-full flex justify-between items-center text-sm font-bold text-foreground px-4 bg-muted/80 backdrop-blur-sm rounded-lg border border-border">
                    <div className="flex items-center gap-2">
                        <Timer className="w-4 h-4 text-primary" />
                        <NeonText text="Progress" color="cyan" />
                    </div>
                    <NeonText text={`${currentIndex + 1} of ${cards.length}`} color="magenta" />
                </div>

                <div className="w-full bg-muted/80 backdrop-blur-sm h-3 rounded-full overflow-hidden border border-border">
                    <div
                        className="bg-gradient-to-r from-primary to-secondary h-full transition-all duration-500 relative"
                        style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                    </div>
                </div>

                <Flashcard
                    key={cards[currentIndex].id}
                    card={cards[currentIndex]}
                    onGrade={handleGrade}
                />

                <div className="flex gap-4">
                    <Button variant="ghost" onClick={onComplete} className="text-muted-foreground hover:text-foreground">
                        Quit Session
                    </Button>
                </div>
            </div>
        </div>
    );
}

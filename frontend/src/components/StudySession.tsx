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
    const [sessionCards, setSessionCards] = useState<CardType[]>(cards);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const reviewMutation = useReviewCard();

    const handleGrade = async (rating: number) => {
        const card = sessionCards[currentIndex];
        if (!card) return;

        let updatedSessionCards = [...sessionCards];

        // If "Again" is pressed, insert card back into the session at a random future position
        if (rating === 1) {
            const remainingCount = sessionCards.length - (currentIndex + 1);
            
            // Random index between current+1 and end of list
            // If it's the last card, it will just appear again next
            let insertOffset = 1;
            if (remainingCount > 0) {
                // If there are other cards, push it back by at least 2 positions if possible 
                // so the user doesn't see it immediately
                const minOffset = Math.min(2, remainingCount);
                insertOffset = Math.floor(Math.random() * (remainingCount - minOffset + 1)) + minOffset;
            }
            
            const insertIndex = currentIndex + insertOffset;
            updatedSessionCards.splice(insertIndex, 0, card);
            setSessionCards(updatedSessionCards);
        }

        // Send review to backend
        await reviewMutation.mutateAsync({ cardId: card.id, rating });

        // CRITICAL: Use the updated list length to determine if the session should continue
        if (currentIndex < updatedSessionCards.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setIsFinished(true);
        }
    };

    if (!sessionCards || sessionCards.length === 0 || currentIndex >= sessionCards.length) {
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
                    <NeonText text={`Great job! You've reviewed all cards in this session.`} color="lime" className="mb-6" />
                    <div className="flex gap-4 justify-center">
                        <Button variant="matrix" onClick={() => {
                            setSessionCards(cards);
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
                    <NeonText text={`${currentIndex + 1} of ${sessionCards.length}`} color="magenta" />
                </div>

                <div className="w-full bg-muted/80 backdrop-blur-sm h-3 rounded-full overflow-hidden border border-border">
                    <div
                        className="bg-gradient-to-r from-primary to-secondary h-full transition-all duration-500 relative"
                        style={{ width: `${((currentIndex + 1) / sessionCards.length) * 100}%` }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                    </div>
                </div>

                <Flashcard
                    key={`${sessionCards[currentIndex].id}-${currentIndex}`}
                    card={sessionCards[currentIndex]}
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

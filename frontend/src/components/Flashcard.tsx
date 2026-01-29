"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  cn,
  LANGUAGE_MAP,
  type SupportedLanguage,
  getTagStyle,
} from "@/lib/utils";
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
    <div className="mx-auto w-full max-w-3xl">
      <Card className="overflow-hidden relative py-0 shadow-2xl transition-colors duration-300 bg-card border-border">
        {/* Background Logo Watermark - Visible from start */}
        <div className="absolute -top-12 -right-12 z-0 rotate-12 pointer-events-none opacity-[0.08]">
          <Devicon icon={langConfig?.icon || "javascript"} size={260} />
        </div>

        <CardContent className="flex overflow-hidden relative z-10 flex-col gap-6 p-8">
          {/* Header Section */}
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <h2
                className={cn(
                  "font-bold text-foreground transition-all duration-300 tracking-tight leading-tight pr-20",
                  isRevealed ? "text-2xl" : "text-4xl py-2",
                )}
              >
                {card.title}
              </h2>

              {isRevealed && (
                <div className="flex gap-4 items-center mt-2 duration-300 animate-in fade-in slide-in-from-left-2">
                  {card.roadmap_id ? (
                    <Link
                      href={`/roadmaps/${card.roadmap_id}`}
                      className="flex gap-1.5 items-center text-xs font-bold hover:underline text-primary group"
                    >
                      <LinkIcon className="w-3 h-3 transition-transform group-hover:rotate-12" />
                      {card.roadmap_title}
                    </Link>
                  ) : (
                    <div className="flex gap-1.5 items-center text-xs font-medium text-muted-foreground">
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
                            style.glow,
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
            <div className="flex flex-col gap-6 items-center py-12 duration-700 animate-in fade-in slide-in-from-bottom-4">
              <div className="relative p-12 rounded-full border bg-primary/5 border-primary/10">
                <div className="absolute inset-0 rounded-full opacity-20 animate-pulse bg-primary/20 blur-3xl" />
                <Code2 className="relative z-10 w-20 h-20 text-primary/30" />
              </div>
              <div className="space-y-1 text-center">
                <p className="italic font-medium text-muted-foreground">
                  Visualize the implementation...
                </p>
                <p className="font-bold uppercase text-[10px] tracking-[0.2em] text-muted-foreground/40">
                  Mental simulation required
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 duration-300 animate-in fade-in zoom-in-95">
              {/* Code Core */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <span className="font-bold tracking-widest uppercase text-[10px] text-muted-foreground">
                    Source Implementation
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-mono uppercase",
                      langConfig?.color,
                    )}
                  >
                    {card.language}
                  </span>
                </div>
                <CodeEditor
                  value={card.code_snippet}
                  language={card.language}
                  readOnly={true}
                  height="auto"
                  isZoomed={true}
                  className="rounded-lg border-2 border-primary shrink-0"
                />
              </div>

              {/* Theory Section */}
              <div className="pt-6 border-t border-border/50">
                <h3 className="flex gap-2 items-center mb-4 text-xs font-bold uppercase text-muted-foreground tracking-[0.15em]">
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
                <div className="flex flex-col gap-4 pt-8 border-t border-border">
                  <div className="flex justify-between items-center px-1">
                    <span className="font-bold tracking-widest uppercase text-[10px] text-muted-foreground">
                      Recall Quality Assessment
                    </span>
                    <span className="italic text-[10px] text-muted-foreground/40">
                      Shortcuts: 1 - 4
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      {
                        label: "Again",
                        rating: 1,
                        color:
                          "bg-red-500/5 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white",
                        time: "<1m",
                      },
                      {
                        label: "Hard",
                        rating: 3,
                        color:
                          "bg-orange-500/5 text-orange-500 border-orange-500/20 hover:bg-orange-500 hover:text-white",
                        time: "2d",
                      },
                      {
                        label: "Good",
                        rating: 4,
                        color:
                          "bg-emerald-500/5 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white",
                        time: "4d",
                      },
                      {
                        label: "Easy",
                        rating: 5,
                        color:
                          "bg-cyan-500/5 text-cyan-500 border-cyan-500/20 hover:bg-cyan-500 hover:text-white",
                        time: "7d",
                      },
                    ].map((btn) => (
                      <Button
                        key={btn.label}
                        variant="outline"
                        className={cn(
                          "h-14 font-bold transition-all duration-200 border-2 rounded-xl group/btn",
                          btn.color,
                        )}
                        onClick={() => onGrade(btn.rating)}
                      >
                        <div className="flex flex-col items-center">
                          <span>{btn.label}</span>
                          <span className="font-mono opacity-40 transition-opacity text-[10px] group-hover/btn:opacity-80">
                            {btn.time}
                          </span>
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
      <div className="flex gap-8 justify-center mt-6 font-mono uppercase text-[10px] text-muted-foreground/30 tracking-[0.2em]">
        <div className="flex gap-2 items-center">
          <kbd className="py-0.5 px-1.5 rounded border bg-muted border-border/50 text-muted-foreground/60">
            SPACE
          </kbd>{" "}
          Next Phase
        </div>
        <div className="flex gap-2 items-center">
          <kbd className="py-0.5 px-1.5 rounded border bg-muted border-border/50 text-muted-foreground/60">
            1-4
          </kbd>{" "}
          Assessment
        </div>
      </div>
    </div>
  );
}

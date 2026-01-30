"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Node } from "reactflow";
import { Sparkles, Target, Zap } from "lucide-react";
import { useCreateDeck, useGenerateAICard, type Deck, client, type AIPromptRequest } from "@/lib/api";
import { useAISettings } from "@/hooks/use-ai-settings";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface NodeDetailDrawerProps {
  node: Node | null;
  isOpen: boolean;
  onClose: () => void;
  roadmapTitle: string;
}

export function NodeDetailDrawer({
  node,
  isOpen,
  onClose,
  roadmapTitle,
}: NodeDetailDrawerProps) {
  const [userFocus, setUserFocus] = useState("");
  const router = useRouter();
  const createDeck = useCreateDeck();
  const generateAI = useGenerateAICard();
  const { settings, apiKey } = useAISettings();

  if (!node) return null;

  const { label, description, tags } = node.data;
  const mastery = node.data.mastery || {
    mastery_percentage: 0,
    total_cards: 0,
    mastered_cards: 0,
  };

  const handleQuickStudy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const deck = await createDeck.mutateAsync({
        title: `Study: ${label}`,
        description: `Auto-generated deck for ${label} roadmap node.`,
        is_public: false,
      });
      toast.success("Preparing your study session...");
      router.push(`/decks/${deck.id}`);
    } catch {
      toast.error("Failed to create study deck.");
    }
  };

  const handleAIGenerate = async () => {
    if (!apiKey) {
      toast.error("AI Not Configured", {
        description: "Please provide an API key in settings.",
        action: {
          label: "Settings",
          onClick: () => router.push("/settings/ai"),
        },
      });
      return;
    }

    toast.promise(
      (async () => {
        // Optimized Context-Aware Prompt
        const strictPrompt = `
          ACT AS: A Senior Backend Architect.
          TASK: Create a professional study flashcard for a technical roadmap.
          
          CONTEXT:
          - Roadmap: ${roadmapTitle}
          - Specific Topic: ${label}
          - User Specified Focus: ${userFocus || "General overview of this topic"}
          - Background: ${description}
          
          STRICT RULES:
          1. The 'explanation' field MUST provide a clear, concise definition of the topic and explain WHY it exists (its rationale and benefits).
          2. The code snippet MUST be relevant to the Roadmap, Topic, and User Focus provided.
          3. Use modern, professional syntax.
          4. Include exactly these tags in your response using the prefix system (e.g. lang:py, concept:oop, syntax:async): ${tags.join(", ")}.
        `;

        const activeProvider = settings.activeProvider;
        const activeModel = settings.lastUsedModel[activeProvider];

        const aiResponse = await generateAI.mutateAsync({
          prompt: strictPrompt,
          provider: activeProvider,
          api_key: apiKey,
          model: activeModel,
        });

        // Find or create a Mastery deck
        const allDecks = await client.get("/decks");
        let targetDeck = allDecks.data.find(
          (d: Deck) => d.title === "Roadmap Mastery",
        );

        if (!targetDeck) {
          const newDeck = await client.post("/decks", {
            title: "Roadmap Mastery",
            description: "All cards generated through roadmaps.",
            is_public: false,
          });
          targetDeck = newDeck.data;
        }

        await client.post("/cards", {
          deck_id: targetDeck.id,
          code_snippet: aiResponse.code_snippet,
          explanation: aiResponse.explanation,
          language: aiResponse.language,
          tags: aiResponse.tags,
          roadmap_id: node.id,
          roadmap_title: roadmapTitle,
        });

        setUserFocus(""); // Reset after success
      })(),
      {
        loading: "AI is crafting your knowledge asset...",
        success: "New card added to your library!",
        error: "AI took a coffee break. Try again later.",
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card border-border text-foreground sm:max-w-[425px] !rounded-3xl p-0 overflow-hidden">
        <div className="p-6 space-y-6">
          <DialogHeader className="space-y-4 text-left">
            <div className="flex gap-3 items-center">
              <div className="p-3 rounded-2xl border bg-primary/10 border-primary/20">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-extrabold text-foreground">
                  {label}
                </DialogTitle>
                <div className="flex flex-wrap gap-2 mt-1">
                  {tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="py-0.5 px-2 rounded-full border text-[10px] bg-secondary text-secondary-foreground border-border"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <DialogDescription className="text-sm italic leading-relaxed text-muted-foreground">
              {description || "No description available for this node."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-8">
            {/* Mastery Stats */}
            <div className="p-6 space-y-4 rounded-2xl border bg-secondary/10 border-border">
              <div className="flex justify-between items-end">
                <span className="text-sm font-bold tracking-widest uppercase text-muted-foreground">
                  Mastery
                </span>
                <span className="font-mono text-3xl font-black text-primary">
                  {Math.round(mastery.mastery_percentage)}%
                </span>
              </div>
              <div className="overflow-hidden w-full h-2 rounded-full bg-border">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary"
                  style={{ width: `${mastery.mastery_percentage}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3 text-center rounded-xl border bg-background/50 border-border">
                  <div className="text-xl font-bold text-foreground">
                    {mastery.total_cards}
                  </div>
                  <div className="font-bold tracking-tighter uppercase text-[10px] text-muted-foreground">
                    Total Cards
                  </div>
                </div>
                <div className="p-3 text-center rounded-xl border bg-background/50 border-border">
                  <div className="text-xl font-bold text-green-500">
                    {mastery.mastered_cards}
                  </div>
                  <div className="font-bold tracking-tighter uppercase text-[10px] text-muted-foreground">
                    Mastered
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pb-4 space-y-4">
              <h4 className="px-2 text-xs font-bold tracking-widest uppercase text-muted-foreground">
                Growth Actions
              </h4>

              <div className="p-2 space-y-2 rounded-2xl border border-primary/20 bg-primary/5">
                <Input
                  placeholder="Focus (e.g. Mapped Columns)"
                  className="bg-background/50 border-primary/20"
                  value={userFocus}
                  onChange={(e) => setUserFocus(e.target.value)}
                />
                <Button
                  onClick={handleAIGenerate}
                  disabled={generateAI.isPending}
                  className="w-full h-12 bg-gradient-to-r rounded-xl border-none shadow-lg transition-all hover:opacity-90 from-primary to-secondary text-primary-foreground shadow-primary/10 group"
                >
                  <Sparkles className="mr-2 w-4 h-4 transition-transform group-hover:rotate-12" />
                  <div className="text-sm font-bold">AI Generate Card</div>
                </Button>
              </div>

              <Button
                variant="outline"
                onClick={handleQuickStudy}
                className="w-full h-16 rounded-2xl border-border bg-card text-foreground group hover:bg-secondary"
              >
                <Zap className="mr-3 w-5 h-5 text-yellow-500 transition-transform group-hover:scale-125" />
                <div className="text-left">
                  <div className="font-bold">Quick Deck</div>
                  <div className="text-[10px] text-muted-foreground">
                    Create deck from this node
                  </div>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

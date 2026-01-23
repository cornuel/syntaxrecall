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
import { Sparkles, Target, Zap, X } from "lucide-react";
import { useCreateDeck, useGenerateAICard, client } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface NodeDetailDrawerProps {
  node: Node | null;
  isOpen: boolean;
  onClose: () => void;
  roadmapTitle: string;
}

export function NodeDetailDrawer({ node, isOpen, onClose, roadmapTitle }: NodeDetailDrawerProps) {
  const [userFocus, setUserFocus] = useState("");
  const router = useRouter();
  const createDeck = useCreateDeck();
  const generateAI = useGenerateAICard();

  if (!node) return null;

  const { label, description, tags, mastery } = node.data;

  const handleQuickStudy = async () => {
    try {
      const deck = await createDeck.mutateAsync({
        title: `Study: ${label}`,
        description: `Auto-generated deck for ${label} roadmap node.`,
        is_public: false,
      });
      
      toast.success("Preparing your study session...");
      router.push(`/decks/${deck.id}`);
    } catch (error) {
      toast.error("Failed to create study deck.");
    }
  };

  const handleAIGenerate = async () => {
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
          3. Use modern, professional syntax (Python 3.10+, etc).
          4. Include exactly these tags in your response: ${tags.join(", ")}.
        `;

        const aiResponse = await generateAI.mutateAsync({
          prompt: strictPrompt,
        });

        // Find or create a Mastery deck
        const allDecks = await client.get("/decks");
        let targetDeck = allDecks.data.find((d: any) => d.title === "Roadmap Mastery");
        
        if (!targetDeck) {
          const newDeck = await client.post("/decks", {
            title: "Roadmap Mastery",
            description: "All cards generated through roadmaps.",
            is_public: false
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
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card border-border text-foreground sm:max-w-[425px] !rounded-3xl p-0 overflow-hidden">
        <div className="p-6 space-y-6">
          <DialogHeader className="space-y-4 text-left">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-extrabold text-foreground">
                  {label}
                </DialogTitle>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {tags.map((tag: string) => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <DialogDescription className="text-muted-foreground text-sm leading-relaxed italic">
              {description || "No description available for this node."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-8">
            {/* Mastery Stats */}
            <div className="p-6 rounded-2xl bg-secondary/10 border border-border space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Mastery</span>
                <span className="text-3xl font-black text-primary font-mono">
                  {Math.round(mastery.mastery_percentage)}%
                </span>
              </div>
              <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-secondary"
                  style={{ width: `${mastery.mastery_percentage}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="text-center p-3 rounded-xl bg-background/50 border border-border">
                  <div className="text-xl font-bold text-foreground">{mastery.total_cards}</div>
                  <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Total Cards</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-background/50 border border-border">
                  <div className="text-xl font-bold text-green-500">{mastery.mastered_cards}</div>
                  <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Mastered</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4 pb-4">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-2">Growth Actions</h4>
              
              <div className="space-y-2 p-2 rounded-2xl border border-primary/20 bg-primary/5">
                <Input 
                  placeholder="Focus (e.g. Mapped Columns)"
                  className="bg-background/50 border-primary/20"
                  value={userFocus}
                  onChange={(e) => setUserFocus(e.target.value)}
                />
                <Button 
                  onClick={handleAIGenerate}
                  disabled={generateAI.isPending}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground border-none shadow-lg shadow-primary/10 group transition-all"
                >
                  <Sparkles className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                  <div className="font-bold text-sm">AI Generate Card</div>
                </Button>
              </div>

              <Button 
                variant="outline"
                onClick={handleQuickStudy}
                className="w-full h-16 rounded-2xl border-border bg-card hover:bg-secondary text-foreground group"
              >
                <Zap className="w-5 h-5 mr-3 text-yellow-500 group-hover:scale-125 transition-transform" />
                <div className="text-left">
                  <div className="font-bold">Quick Deck</div>
                  <div className="text-[10px] text-muted-foreground">Create deck from this node</div>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

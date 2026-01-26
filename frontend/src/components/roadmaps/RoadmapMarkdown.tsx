"use client";

import React, { useState, useMemo } from "react";
import {
  RoadmapNode,
  NodeMastery,
  useCreateDeck,
  useGenerateAICard,
  useCards,
  useCreateCard,
  useDecks,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  Sparkles,
  Zap,
  Target,
  Plus,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { DetailedCard } from "@/components/DetailedCard";

interface RoadmapMarkdownNodeProps {
  node: RoadmapNode;
  masteryData: NodeMastery[];
  depth: number;
  roadmapTitle: string;
  path?: string[];
}

export function RoadmapMarkdownNode({
  node,
  masteryData,
  depth,
  roadmapTitle,
  path = [],
}: RoadmapMarkdownNodeProps) {
  const [isExpanded, setIsExpanded] = useState(depth === 0);
  const [isPrompting, setIsPrompting] = useState(false);
  const [userFocus, setUserFocus] = useState("");
  const router = useRouter();
  const createDeck = useCreateDeck();
  const generateAI = useGenerateAICard();
  const createCard = useCreateCard();
  const { data: allDecks } = useDecks();
  const { data: allCards, isLoading: loadingCards } = useCards();

  const currentPath = [...path, node.label];

  const mastery = masteryData.find((m) => m.node_id === node.id) || {
    mastery_percentage: 0,
    total_cards: 0,
    mastered_cards: 0,
  };

  const nodeCards = useMemo(() => {
    if (!allCards) return [];
    return allCards.filter((card) =>
      node.tags.every((tag) => card.tags.includes(tag)),
    );
  }, [allCards, node.tags]);

  const isMastered = mastery.mastery_percentage === 100;
  const hasProgress = mastery.mastery_percentage > 0;
  const hasChildren = node.children && node.children.length > 0;

  const handleQuickStudy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const deck = await createDeck.mutateAsync({
        title: `Study: ${node.label}`,
        description: `Auto-generated deck for ${node.label} roadmap node.`,
        is_public: false,
      });
      toast.success("Preparing your study session...");
      router.push(`/decks/${deck.id}`);
    } catch (error) {
      toast.error("Failed to create study deck.");
    }
  };

  const handleAIGenerate = async (e: React.SyntheticEvent) => {
    e.stopPropagation();

    // Reset prompt state
    setIsPrompting(false);

    // 1. Find or create a Mastery deck
    let targetDeck = allDecks?.find((d) => d.title === "Roadmap Mastery");
    if (!targetDeck) {
      try {
        targetDeck = await createDeck.mutateAsync({
          title: "Roadmap Mastery",
          description: "All cards generated through roadmaps.",
          is_public: false,
        });
      } catch (err) {
        toast.error("Could not initialize Mastery deck.");
        return;
      }
    }

    toast.promise(
      (async () => {
        // Dynamic Context-Aware Prompt
        const dynamicPrompt = `
          ACT AS: A Senior Technical Expert.
          TASK: Create a professional study flashcard for the following learning path.
          
          LEARNING PATH CONTEXT:
          - Roadmap: ${roadmapTitle}
          - Category Path: ${currentPath.join(" > ")}
          - Specific Topic: ${node.label}
          - User Specified Focus: ${userFocus || "General overview of this topic"}
          - Context: ${node.description}
          
          STRICT RULES:
          1. The 'explanation' field MUST provide a clear, concise definition of the topic and explain WHY it exists (its rationale and benefits).
          2. The code snippet MUST be relevant to the Roadmap, Category Path, and User Focus provided.
          3. Focus on professional, idiomatic implementations.
          4. Use the latest stable versions of languages and frameworks mentioned in the context.
          5. Include exactly these tags in your response: ${node.tags.join(", ")}.
          6. The response JSON MUST include a 'title' field that is descriptive and relevant.
        `;

        const aiResponse = await generateAI.mutateAsync({
          prompt: dynamicPrompt,
        });

        // 3. Save
        await createCard.mutateAsync({
          deck_id: targetDeck!.id,
          title: aiResponse.title,
          code_snippet: aiResponse.code_snippet,
          explanation: aiResponse.explanation,
          language: aiResponse.language,
          tags: aiResponse.tags,
        });
      })(),
      {
        loading: "AI is crafting your knowledge asset...",
        success: "New card added to your library!",
        error: "AI took a coffee break. Try again later.",
      },
    );
  };

  return (
    <div
      className={cn(
        "w-full border-l-2 ml-2 pl-4 py-2",
        depth === 0 ? "border-primary/40" : "border-border/40",
      )}
    >
      {/* Node Header */}
      <div
        className={cn(
          "group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all hover:bg-secondary/20",
          isExpanded && "bg-secondary/10",
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex flex-1 gap-3 items-center">
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )
          ) : (
            <div className="w-4" />
          )}

          <div className="flex gap-2 items-center">
            {isMastered ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <Target
                className={cn(
                  "w-5 h-5",
                  hasProgress ? "text-primary" : "text-muted-foreground/40",
                )}
              />
            )}
            <h3
              className={cn(
                "font-bold tracking-tight",
                depth === 0 ? "text-xl" : depth === 1 ? "text-lg" : "text-base",
                isMastered ? "text-green-400" : "text-foreground",
              )}
            >
              {node.label}
            </h3>
          </div>

          <div className="flex gap-4 items-center ml-4">
            <span className="py-0.5 px-2 font-mono tracking-widest uppercase rounded text-[10px] text-foreground">
              {nodeCards.length} cards / {mastery.mastered_cards} mastered
            </span>
            {hasProgress && !isMastered && (
              <div className="hidden overflow-hidden w-24 h-1.5 rounded-full sm:block bg-secondary">
                <div
                  className="h-full transition-all duration-500 bg-primary"
                  style={{ width: `${mastery.mastery_percentage}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 items-center opacity-0 group-hover:opacity-100 transition-opacity">
          {isPrompting ? (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-200">
              <Input 
                autoFocus
                placeholder="Specific focus (e.g. Mapped Columns)"
                className="h-8 w-48 text-xs bg-background/50 border-primary/30 focus-visible:ring-primary"
                value={userFocus}
                onChange={(e) => setUserFocus(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAIGenerate(e);
                  if (e.key === 'Escape') setIsPrompting(false);
                }}
              />
              <Button 
                size="sm" 
                className="h-8 px-3 text-xs"
                onClick={handleAIGenerate}
                disabled={generateAI.isPending || createCard.isPending}
              >
                Generate
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPrompting(false);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="p-0 w-8 h-8 rounded-full hover:bg-primary/20 hover:text-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPrompting(true);
                }}
                disabled={generateAI.isPending || createCard.isPending}
                title="Generate AI Cards"
              >
                {generateAI.isPending || createCard.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="p-0 w-8 h-8 rounded-full hover:bg-secondary hover:text-foreground"
                onClick={handleQuickStudy}
                title="Start Session"
              >
                <Zap className="w-4 h-4 text-yellow-500" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Expanded Content / Children */}
      {isExpanded && (
        <div className="mt-2 space-y-2 duration-200 animate-in slide-in-from-top-1">
          {node.description && (
            <p className="px-12 mb-4 text-sm italic text-muted-foreground">
              {node.description}
            </p>
          )}

          {hasChildren ? (
            node.children?.map((child) => (
              <RoadmapMarkdownNode
                key={child.id}
                node={child}
                masteryData={masteryData}
                depth={depth + 1}
                roadmapTitle={roadmapTitle}
                path={currentPath}
              />
            ))
          ) : (
            <div className="px-12 pb-4 space-y-6">
              {loadingCards ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : nodeCards.length === 0 ? (
                <div className="flex flex-col gap-4 items-center p-8 text-center rounded-2xl border-2 border-dashed border-border bg-card/20">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      No cards for this node yet
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Jumpstart your learning with AI generation
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleAIGenerate}
                    className="gap-2"
                    disabled={generateAI.isPending || createCard.isPending}
                  >
                    {generateAI.isPending || createCard.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    Create with AI
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {nodeCards.map((card, idx) => (
                    <DetailedCard key={card.id} card={card} index={idx} />
                  ))}
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleQuickStudy}
                      className="gap-2"
                    >
                      <BookOpen className="w-4 h-4" />
                      Study this segment
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

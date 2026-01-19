"use client";

import React, { useState } from "react";
import { RoadmapNode, NodeMastery, useCreateDeck, useGenerateAICard } from "@/lib/api";
import { cn } from "@/lib/utils";
import { 
  ChevronDown, 
  ChevronRight, 
  BookOpen, 
  CheckCircle2, 
  Sparkles, 
  Zap,
  Target,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface RoadmapMarkdownNodeProps {
  node: RoadmapNode;
  masteryData: NodeMastery[];
  depth: number;
}

export function RoadmapMarkdownNode({ node, masteryData, depth }: RoadmapMarkdownNodeProps) {
  const [isExpanded, setIsExpanded] = useState(depth === 0);
  const router = useRouter();
  const createDeck = useCreateDeck();
  const generateAI = useGenerateAICard();

  const mastery = masteryData.find((m) => m.node_id === node.id) || {
    mastery_percentage: 0,
    total_cards: 0,
    mastered_cards: 0,
  };

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

  const handleAIGenerate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.promise(
      generateAI.mutateAsync({
        prompt: `Create a comprehensive study card for the topic: ${node.label}. Context: ${node.description}. Required tags: ${node.tags.join(", ")}`,
      }),
      {
        loading: "AI is crafting your knowledge asset...",
        success: "New card added to your library!",
        error: "AI took a coffee break. Try again later.",
      }
    );
  };

  return (
    <div className={cn("w-full border-l-2 ml-2 pl-4 py-2", 
      depth === 0 ? "border-primary/40" : "border-border/40"
    )}>
      {/* Node Header */}
      <div 
        className={cn(
          "group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all hover:bg-secondary/20",
          isExpanded && "bg-secondary/10"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3 flex-1">
          {hasChildren ? (
            isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />
          ) : (
            <div className="w-4" />
          )}
          
          <div className="flex items-center gap-2">
            {isMastered ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <Target className={cn("w-5 h-5", hasProgress ? "text-primary" : "text-muted-foreground/40")} />
            )}
            <h3 className={cn(
              "font-bold tracking-tight",
              depth === 0 ? "text-xl" : depth === 1 ? "text-lg" : "text-base",
              isMastered ? "text-green-400" : "text-foreground"
            )}>
              {node.label}
            </h3>
          </div>

          <div className="flex items-center gap-4 ml-4">
             <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest bg-secondary/30 px-2 py-0.5 rounded">
               {mastery.total_cards} cards / {mastery.mastered_cards} mastered
             </span>
             {hasProgress && !isMastered && (
               <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden hidden sm:block">
                 <div 
                  className="h-full bg-primary transition-all duration-500" 
                  style={{ width: `${mastery.mastery_percentage}%` }}
                 />
               </div>
             )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
           <Button 
            size="sm" 
            variant="ghost" 
            className="h-8 w-8 p-0 rounded-full hover:bg-primary/20 hover:text-primary"
            onClick={handleAIGenerate}
            title="Generate AI Cards"
           >
             <Sparkles className="w-4 h-4" />
           </Button>
           <Button 
            size="sm" 
            variant="ghost" 
            className="h-8 w-8 p-0 rounded-full hover:bg-secondary hover:text-foreground"
            onClick={handleQuickStudy}
            title="Start Session"
           >
             <Zap className="w-4 h-4 text-yellow-500" />
           </Button>
        </div>
      </div>

      {/* Expanded Content / Children */}
      {isExpanded && (
        <div className="mt-2 space-y-2 animate-in slide-in-from-top-1 duration-200">
          {node.description && (
            <p className="text-sm text-muted-foreground italic mb-4 px-12">
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
              />
            ))
          ) : (
            <div className="px-12 pb-2">
              {mastery.total_cards === 0 ? (
                <div className="flex flex-col items-center gap-4 p-8 rounded-2xl border-2 border-dashed border-border bg-card/20 text-center">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">No cards for this node yet</p>
                    <p className="text-xs text-muted-foreground">Jumpstart your learning with AI generation</p>
                  </div>
                  <Button size="sm" onClick={handleAIGenerate} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create with AI
                  </Button>
                </div>
              ) : (
                <div className="flex justify-center">
                   <Button variant="outline" size="sm" onClick={handleQuickStudy} className="gap-2">
                      <BookOpen className="w-4 h-4" />
                      View {mastery.total_cards} Cards
                   </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

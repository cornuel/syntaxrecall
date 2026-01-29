import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { cn } from "@/lib/utils";
import { BookOpen, Link as LinkIcon, CheckCircle2 } from "lucide-react";

const RoadmapNode = ({ data, selected }: NodeProps) => {
  const isMastered = data.mastery.mastery_percentage === 100;
  const hasProgress = data.mastery.mastery_percentage > 0;
  const isLinked = !!data.roadmap_ref;

  return (
    <div
      className={cn(
        "px-4 py-3 rounded-xl border-2 transition-all duration-300 w-[240px] bg-card shadow-xl",
        selected ? "border-primary scale-105 shadow-primary/20" : "border-border",
        isMastered && "border-green-500/50 bg-green-950/10",
        isLinked && "border-secondary/50"
      )}
    >
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-border" />
      
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {isLinked ? (
              <LinkIcon className="w-4 h-4 text-secondary" />
            ) : isMastered ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <BookOpen className="w-4 h-4 text-primary" />
            )}
            <span className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
              {isLinked ? "Prerequisite" : "Topic"}
            </span>
          </div>
          {hasProgress && (
            <span className={cn(
              "text-[10px] font-mono font-bold px-1.5 py-0.5 rounded",
              isMastered ? "bg-green-500/20 text-green-400" : "bg-primary/20 text-primary"
            )}>
              {Math.round(data.mastery.mastery_percentage)}%
            </span>
          )}
        </div>

        <h3 className="text-sm font-bold text-foreground line-clamp-1">
          {data.label}
        </h3>

        <div className="space-y-1.5">
          <div className="h-1.5 w-full bg-secondary/20 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all duration-500",
                isMastered ? "bg-green-500" : "bg-primary"
              )}
              style={{ width: `${data.mastery.mastery_percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
            <span>{data.mastery.total_cards} Cards</span>
            <span>{data.mastery.mastered_cards} Mastered</span>
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-border" />
    </div>
  );
};

export default memo(RoadmapNode);

"use client";

import React, { use, useState } from "react";
import { useRoadmap, useRoadmapMastery } from "@/lib/api";
import { RoadmapMarkdownNode } from "@/components/roadmaps/RoadmapMarkdown";
import { Loader2, ChevronLeft, Map as MapIcon, Info, Sparkles, LayoutPanelTop, ListTree } from "lucide-react";
import Link from "next/link";
import { RoadmapGraph } from "@/components/roadmaps/RoadmapGraph";
import { NodeDetailDrawer } from "@/components/roadmaps/NodeDetailDrawer";
import { Node } from "reactflow";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function RoadmapDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: roadmap, isLoading: loadingRoadmap } = useRoadmap(id);
  const { data: mastery } = useRoadmapMastery(id);

  const [viewMode, setViewMode] = useState<"markdown" | "graph">("markdown");
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleNodeClick = (node: Node) => {
    setSelectedNode(node);
    setIsDrawerOpen(true);
  };

  if (loadingRoadmap || !roadmap) {
    return (
      <div className="flex flex-col gap-4 justify-center items-center min-h-[80vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="font-mono animate-pulse text-muted-foreground">
          Decrypting knowledge topology...
        </p>
      </div>
    );
  }

  // Calculate overall mastery for the header
  const overallMastery = mastery
    ? Math.round(
      mastery.reduce((acc, curr) => acc + curr.mastery_percentage, 0) /
      (mastery.length || 1),
    )
    : 0;

  return (
    <main className="container flex flex-col gap-6 p-4 mx-auto min-h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="flex flex-col gap-4 justify-between items-start md:flex-row md:items-center w-full">
        <div className="space-y-1">
          <Link
            href="/roadmaps"
            className="flex items-center mb-2 text-xs font-bold tracking-widest uppercase transition-colors hover:text-primary group text-muted-foreground"
          >
            <ChevronLeft className="mr-1 w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Roadmaps
          </Link>
          <div className="flex gap-3 items-center">
            <div className="p-2 rounded-xl border border-primary/20 bg-primary/5">
              <MapIcon className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              {roadmap.title}
            </h1>
          </div>
        </div>

        <div className="flex gap-6 items-center">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-[200px]">
            <TabsList className="grid w-full grid-cols-2 bg-secondary/20">
              <TabsTrigger value="markdown" className="gap-2">
                <ListTree className="w-4 h-4" />
                List
              </TabsTrigger>
              <TabsTrigger value="graph" className="gap-2">
                <LayoutPanelTop className="w-4 h-4" />
                Graph
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-6 items-center p-4 px-6 rounded-2xl border border-border bg-card">
            <div className="space-y-1">
              <div className="font-bold tracking-widest uppercase text-[10px] text-muted-foreground">
                Aggregate Mastery
              </div>
              <div className="flex gap-3 items-center">
                <div className="font-mono text-2xl font-black text-foreground">
                  {overallMastery}%
                </div>
                <div className="overflow-hidden w-32 h-2 rounded-full bg-secondary">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000"
                    style={{ width: `${overallMastery}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="w-px h-10 bg-border hidden sm:block" />
            <div className="flex-col items-center hidden sm:flex">
              <Sparkles className="mb-1 w-4 h-4 text-secondary" />
              <span className="font-bold uppercase text-[10px] text-muted-foreground">
                Pro Path
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow min-h-0 w-full">
        {viewMode === "markdown" ? (
          <div className="max-w-4xl mx-auto space-y-4 py-8">
            <RoadmapMarkdownNode 
              node={roadmap.content.root} 
              masteryData={mastery || []} 
              depth={0} 
              roadmapTitle={roadmap.title}
            />
          </div>
        ) : (
          <div className="h-[70vh]">
            <RoadmapGraph
              roadmap={roadmap}
              mastery={mastery || []}
              onNodeClick={handleNodeClick}
            />
          </div>
        )}
      </div>

      {viewMode === "graph" && (
        <NodeDetailDrawer
          node={selectedNode}
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          roadmapTitle={roadmap.title}
        />
      )}

      {/* Footer Info */}
      <div className="flex gap-2 justify-center items-center py-2 text-xs text-muted-foreground">
        <Info className="w-3 h-3 text-primary" />
        <span>
          {viewMode === "markdown" 
            ? "Click sections to expand. Use the quick action buttons to generate cards or study."
            : "Click on any node to view details, generate AI cards, or start a focused study session."}
        </span>
      </div>
    </main>
  );
}

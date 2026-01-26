"use client";

import React, { useCallback, useMemo, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Connection,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";

import RoadmapNodeComponent from "./RoadmapNode";
import { Roadmap, NodeMastery } from "@/lib/api";
import { transformRoadmapToFlow } from "@/lib/roadmap-utils";

const nodeTypes = {
  roadmapNode: RoadmapNodeComponent,
};

interface RoadmapGraphProps {
  roadmap: Roadmap;
  mastery: NodeMastery[];
  onNodeClick: (node: Node) => void;
}

function RoadmapGraphInner({
  roadmap,
  mastery,
  onNodeClick,
}: RoadmapGraphProps) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => transformRoadmapToFlow(roadmap.content.root, mastery),
    [roadmap, mastery],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when mastery changes
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = transformRoadmapToFlow(
      roadmap.content.root,
      mastery,
    );
    setNodes(newNodes);
    setEdges(newEdges);
  }, [mastery, roadmap, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <div className="overflow-hidden relative w-full h-full rounded-3xl border shadow-2xl border-border">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => onNodeClick(node)}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        zoomOnScroll={true}
        panOnDrag={true}
        className="bg-background"
      >
        <Background color="#1e1e2e" gap={20} />
        <Controls className="bg-card border-border fill-foreground" />
        <MiniMap 
          style={{ backgroundColor: '#1e1e2e' }} 
          nodeColor={(n) => {
            if (n.data.mastery.mastery_percentage === 100) return '#a6e3a1'; // Green
            if (n.data.mastery.mastery_percentage > 0) return '#89b4fa'; // Blue/Primary
            return '#313244'; // Surface0
          }}
          maskColor="rgba(0, 0, 0, 0.7)"
        />
      </ReactFlow>

      {/* Legend */}
      <div className="flex absolute bottom-6 left-6 z-10 flex-col gap-2 p-4 rounded-xl border pointer-events-none bg-card/80 backdrop-blur-md border-border">
        <div className="flex gap-2 items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full" />
          <span className="font-bold tracking-widest uppercase text-[10px] text-muted-foreground">
            Mastered
          </span>
        </div>
        <div className="flex gap-2 items-center">
          <div className="w-3 h-3 bg-primary rounded-full" />
          <span className="font-bold tracking-widest uppercase text-[10px] text-muted-foreground">
            In Progress
          </span>
        </div>
        <div className="flex gap-2 items-center">
          <div className="w-3 h-3 rounded-full bg-border" />
          <span className="font-bold tracking-widest uppercase text-[10px] text-muted-foreground">
            Not Started
          </span>
        </div>
      </div>
    </div>
  );
}

export function RoadmapGraph(props: RoadmapGraphProps) {
  return (
    <ReactFlowProvider>
      <RoadmapGraphInner {...props} />
    </ReactFlowProvider>
  );
}

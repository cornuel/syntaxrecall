import { RoadmapNode, NodeMastery } from "./api";
import { Node, Edge } from "reactflow";

export function transformRoadmapToFlow(
  root: RoadmapNode,
  masteryData: NodeMastery[] = []
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const NODE_WIDTH = 240;
  const HORIZONTAL_SPACING = 300;
  const VERTICAL_SPACING = 200;

  // First pass: Calculate total horizontal span of each subtree
  function getSubtreeWidth(node: RoadmapNode): number {
    if (!node.children || node.children.length === 0) {
      return HORIZONTAL_SPACING;
    }
    return node.children.reduce((acc, child) => acc + getSubtreeWidth(child), 0);
  }

  // Second pass: Position nodes
  function traverse(
    node: RoadmapNode,
    xOffset: number,
    y: number,
    parentId?: string
  ) {
    const mastery = masteryData.find((m) => m.node_id === node.id);
    const totalWidth = getSubtreeWidth(node);
    
    // Center the parent node over its total subtree width
    const currentX = xOffset + totalWidth / 2 - NODE_WIDTH / 2;

    nodes.push({
      id: node.id,
      type: "roadmapNode",
      data: {
        label: node.label,
        description: node.description,
        tags: node.tags,
        roadmap_ref: node.roadmap_ref,
        mastery: mastery || {
          mastery_percentage: 0,
          total_cards: 0,
          mastered_cards: 0,
        },
      },
      position: { x: currentX, y },
      draggable: false,
    });

    if (parentId) {
      edges.push({
        id: `e-${parentId}-${node.id}`,
        source: parentId,
        target: node.id,
        type: "smoothstep",
        animated: (mastery?.mastery_percentage || 0) > 0,
        style: { stroke: (mastery?.mastery_percentage || 0) === 100 ? "#22c55e" : "#3b82f6", strokeWidth: 2 },
      });
    }

    if (node.children && node.children.length > 0) {
      let childXOffset = xOffset;
      node.children.forEach((child) => {
        traverse(child, childXOffset, y + VERTICAL_SPACING, node.id);
        childXOffset += getSubtreeWidth(child);
      });
    }
  }

  traverse(root, 0, 0);

  return { nodes, edges };
}

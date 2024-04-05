"use client";
import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

interface NodeData extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
}

interface LinkData extends d3.SimulationLinkDatum<NodeData> {
  source: string | NodeData;
  target: string | NodeData;
}

interface MindMapCanvasProps {
  nodes: NodeData[];
  links: LinkData[];
  onEditNode: (node: NodeData) => void;
  updateNodeName: (node: NodeData) => void; 
}

const MindMapCanvas: React.FC<MindMapCanvasProps> = ({
  nodes,
  links,
  onEditNode
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = +svg.attr("width");
    const height = +svg.attr("height");
    
    const processedLinks = links.map(link => {
      const sourceNode = typeof link.source === 'string' 
        ? nodes.find(node => node.id === link.source) 
        : link.source;
    
      const targetNode = typeof link.target === 'string'
        ? nodes.find(node => node.id === link.target) 
        : link.target;
    
      if (!sourceNode || !targetNode) {
        throw new Error("Node not found for link.");
      }
    
      return { ...link, source: sourceNode, target: targetNode };
    });

    const drag = d3.drag<SVGCircleElement, NodeData>()
    .on("start", (event: d3.D3DragEvent<SVGCircleElement, NodeData, NodeData>) => {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    })
    .on("drag", (event: d3.D3DragEvent<SVGCircleElement, NodeData, NodeData>) => {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    });

    const ticked = () => {
      svg.selectAll<SVGLineElement, LinkData>(".link")
      .attr("x1", (d) => ((d.source as NodeData).x ?? 0))
      .attr("y1", (d) => ((d.source as NodeData).y ?? 0))
      .attr("x2", (d) => ((d.target as NodeData).x ?? 0))
      .attr("y2", (d) => ((d.target as NodeData).y ?? 0));
    
      svg.selectAll<SVGCircleElement, NodeData>(".node")
        .attr("cx", d => d.x ?? 0) 
        .attr("cy", d => d.y ?? 0);
    
      svg.selectAll<SVGTextElement, NodeData>(".label")
        .attr("x", d => (d.x ?? 0) + 10)
        .attr("y", d => (d.y ?? 0) + 3);
    };
    

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(processedLinks).id((node: d3.SimulationNodeDatum) => {
        const nodeData = node as NodeData;
        return nodeData.id;
      }))
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(width / 2, height / 2));


    svg.selectAll(".link")
      .data(processedLinks)
      .join("line")
      .classed("link", true)
      .attr("stroke", "#999");

    svg.selectAll<SVGCircleElement, NodeData>(".node") 
      .data(nodes, (d: NodeData) => d.id) 
      .join("circle")
      .classed("node", true)
      .attr("r", 10)
      .attr("fill", d => d.color)
      .call(drag as any);  // NOTE TO SELF... any is antipattern, but complexity with D3/TypeScript/React made me set any for now

      svg.selectAll<SVGTextElement, NodeData>(".label")
      .data(nodes, (d: NodeData) => d.id)
      .join("text")
      .classed("label", true)
      .attr("dx", 10)
      .attr("dy", ".35em")
      .text((d: NodeData) => d.name)
      .style("fill", "white")
      .on("click", (_, d: NodeData) => {
        onEditNode(d);
      });

      simulation.on("tick", ticked);

      const linkForce = simulation.force<d3.ForceLink<NodeData, LinkData>>("link");
      if (linkForce) {
        linkForce.links(processedLinks);
      }  
      simulation.alpha(1).restart();

    return () => {
      simulation.stop();
    }
  }, [nodes, links]); 

  return <svg ref={svgRef} width={1024} height={800} className="border 1px mt-10" />;
};

export default MindMapCanvas;

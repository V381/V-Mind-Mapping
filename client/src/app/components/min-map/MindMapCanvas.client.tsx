"use client";
import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

interface NodeData extends d3.SimulationNodeDatum {
  id: string;
  name: string;
}

interface LinkData extends d3.SimulationLinkDatum<NodeData> {
  source: NodeData;
  target: NodeData;
}

interface MindMapCanvasProps {
  nodes: NodeData[];
  links: LinkData[];
  onEditNode: (node: NodeData) => void;
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

    const processLinks = (links: LinkData[], nodes: NodeData[]): LinkData[] => {
      return links.map(link => {
        return {
          ...link,
          source: typeof link.source === 'object' ? link.source : nodes.find(n => n.id === link.source),
          target: typeof link.target === 'object' ? link.target : nodes.find(n => n.id === link.target)
        };
      });
    };
    const processedLinks = processLinks(links, nodes);

    const ticked = () => {
      svg.selectAll(".link")
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      svg.selectAll(".node")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

      svg.selectAll(".label")
        .attr("x", d => d.x + 10)
        .attr("y", d => d.y + 3);
    };

    const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(processedLinks).id((d: NodeData) => d.id))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

    svg.selectAll(".link")
      .data(processedLinks)
      .join("line")
      .classed("link", true)
      .attr("stroke", "#999");


    svg.selectAll(".node")
      .data(nodes, (d) => d.id)
      .join("circle")
      .classed("node", true)
      .attr("r", 5)
      .attr("fill", "blue")
      .call(d3.drag<SVGCircleElement, NodeData>()
        .on("start", (event) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          event.subject.fx = event.subject.x;
          event.subject.fy = event.subject.y;
        })
        .on("drag", (event) => {
          event.subject.fx = event.x;
          event.subject.fy = event.y;
        }));

    svg.selectAll(".label")
      .data(nodes, d => d.id)
      .join("text")
      .classed("label", true)
      .attr("dx", 10)
      .attr("dy", ".35em")
      .text((d) => d.name)
      .style("fill", "white")
      .on("click", (_, d) => {
        onEditNode(d);
      });

      simulation.on("tick", ticked);

    simulation.nodes(nodes).force("link").links(processedLinks);
    simulation.alpha(1).restart();

    return () => {
      simulation.stop();
    }
  }, [nodes, links]); 

  return <svg ref={svgRef} width={800} height={600} />;
};

export default MindMapCanvas;

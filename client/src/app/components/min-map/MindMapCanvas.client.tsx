"use client"
import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { SimulationNodeDatum, SimulationLinkDatum } from 'd3';

interface NodeData extends SimulationNodeDatum {
  id: string;
  name: string;
}

interface LinkData extends SimulationLinkDatum<NodeData> {
  source: string | NodeData;
  target: string | NodeData;
}

interface MindMapCanvasProps {
  nodes: NodeData[];
  links: LinkData[];
}

const MindMapCanvas: React.FC<MindMapCanvasProps> = ({ nodes, links }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const nodeRefs = useRef(new Map<string, SVGCircleElement>());
  const linkRefs = useRef(new Map<string, SVGLineElement>());
  const [updatedNodes, setUpdatedNodes] = useState(nodes);
  const [updatedLinks, setUpdatedLinks] = useState(links)
  
  useEffect(() => {
    if (!svgRef.current) return;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);
    const width = +svg.attr('width');
    const height = +svg.attr('height');

    const simulation = d3.forceSimulation<NodeData, LinkData>(nodes)
      .force('link', d3.forceLink<NodeData, LinkData>(links).id((d: NodeData) => d.id))
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg.append('g')
      .attr('stroke', '#999')
      .selectAll('line')
      .data(links)
      .join('line');


    const label = svg.append('g')
      .attr('class', 'labels')
      .selectAll('text')
      .data(nodes)
      .enter()
      .append('text')
      .attr('dx', 10)
      .attr('dy', '.35em')
      .text(d => d.name)
      .style('fill', 'white')

      const drag = (simulation: d3.Simulation<NodeData, LinkData>) => {
        function dragstarted(event: d3.D3DragEvent<SVGCircleElement, NodeData, NodeData>) {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          event.subject.fx = event.x;
          event.subject.fy = event.y;
        }
      
        function dragged(event: d3.D3DragEvent<SVGCircleElement, NodeData, NodeData>) {
          event.subject.fx = event.x;
          event.subject.fy = event.y;
        }

        // Note to my self: Do not remove this because it will reset drag
      
        // function dragended(event: d3.D3DragEvent<SVGCircleElement, NodeData, NodeData>) {
        //   if (!event.active) simulation.alphaTarget(0);
        //   event.subject.fx = null;
        //   event.subject.fy = null;
        // }
      
        return d3.drag<SVGCircleElement, NodeData>()
          .on('start', dragstarted)
          .on('drag', dragged);
      };
      

      const node = svg.append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll<SVGCircleElement, NodeData>('circle')
      .data(nodes)
      .join('circle')
      .attr('r', 5)
      .attr('fill', 'blue')
      .call(drag(simulation)); 

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as NodeData).x!)
        .attr('y1', d => (d.source as NodeData).y!)
        .attr('x2', d => (d.target as NodeData).x!)
        .attr('y2', d => (d.target as NodeData).y!);

      node
        .attr('cx', d => d.x!)
        .attr('cy', d => d.y!);

      label
        .attr('x', d => d.x!)
        .attr('y', d => d.y!);
        setUpdatedNodes([...nodes]);
        setUpdatedLinks([...links]);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, links]); 

  return (
   <svg ref={svgRef} width={800} height={600}>
      <g className="links">
        {updatedLinks.map((link, index) => (
          <line
            key={`link-${index}`}
            stroke="#999"
            strokeWidth="2"
            x1={(typeof link.source === 'object' ? link.source.x : 0) || 0}
            y1={(typeof link.source === 'object' ? link.source.y : 0) || 0}
            x2={(typeof link.target === 'object' ? link.target.x : 0) || 0}
            y2={(typeof link.target === 'object' ? link.target.y : 0) || 0}
          />
        ))}
      </g>
      <g className="nodes">
        {updatedNodes.map((node) => (
          <circle
            key={node.id}
            cx={node.x}
            cy={node.y}
            r="5"
            fill="blue"
          >
            <title>{node.name}</title>
          </circle>
        ))}
      </g>
    </svg>
  );
};

export default MindMapCanvas;

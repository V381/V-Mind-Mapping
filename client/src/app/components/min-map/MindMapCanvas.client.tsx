import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface NodeData {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
}

interface LinkData {
  source: string | NodeData;
  target: string | NodeData;
  color: string;
}

interface ZoomData {
  source: { x: number, y: number };
  target: { x: number, y: number };
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
  onEditNode,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const currentZoomTransform = useRef<d3.ZoomTransform>(d3.zoomIdentity);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<Element, unknown> | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('g.zoom-container').remove(); 
    let zoomContainer = svg.select<SVGGElement>('.zoom-container');
    if (zoomContainer.empty()) {
      zoomContainer = svg.append('g').classed('zoom-container', true);
    }

    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        currentZoomTransform.current = event.transform; 
        zoomContainer.attr('transform', event.transform);
      });

    svg.call(zoom as any); // TO-FIX: any needs to be updated.. soon enough

    if (!zoomBehaviorRef.current) {
      zoomBehaviorRef.current = d3.zoom().scaleExtent([0.1, 4]).on('zoom', (event) => {
        currentZoomTransform.current = event.transform;
        zoomContainer.attr('transform', event.transform);
      });
      svg.call(zoomBehaviorRef.current as any);
    }
  
    zoomContainer.attr('transform', currentZoomTransform.current.toString());
    const processedLinks = links.map((link) => ({
      ...link,
      source: typeof link.source === 'string' ? link.source : link.source.id,
      target: typeof link.target === 'string' ? link.target : link.target.id,
    }));

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(processedLinks).id((d: any) => d.id))
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(svgRef.current.clientWidth / 2, svgRef.current.clientHeight / 2));

    const drag = d3.drag<SVGCircleElement, NodeData>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      })
      .on('drag', (event, d) => {
        event.subject.fx = event.x;
        event.subject.fy = event.y
      })

    zoomContainer.selectAll('.link')
      .data(processedLinks)
      .join('line')
      .classed('link', true)
      .attr('stroke', d => d.color)
      .attr('stroke-width', 2);

    const node = zoomContainer.selectAll('.node')
      .data(nodes)
      .join('circle')
      .classed('node', true)
      .attr('r', 10)
      .attr('fill', d => d.color)
      .call(drag as any);

    zoomContainer.selectAll('.label')
      .data(nodes)
      .join('text')
      .classed('label', true)
      .attr('x', 15)
      .attr('y', '.31em')
      .text(d => d.name)
      .style('fill', 'white')
      .style('font-size', '12px');

    simulation.on('tick', () => {
      node.attr('cx', d => d.x).attr('cy', d => d.y);
    
      zoomContainer.selectAll<SVGLineElement, ZoomData>('.link')
        .attr('x1', (d: ZoomData) => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
    
      zoomContainer.selectAll<SVGTextElement, NodeData>('.label')
        .attr('x', d => d.x + 15)
        .attr('y', d => d.y);
    });
    
    const labels = zoomContainer.selectAll<SVGTextElement, NodeData>('.label')
      .data(nodes, d => d.id); 
    
    labels.enter()
      .append('text')
      .classed('label', true)
      .attr('x', d => d.x + 15)
      .attr('y', d => d.y)
      .merge(labels as any)
      .text(d => d.name)
      .style('fill', 'white')
      .style('font-size', '12px')
      .on('click', (event, d) => {
        event.stopPropagation(); 
  onEditNode(d);
      });
    
    labels.exit().remove();

    return () => {
      simulation.stop();
    };
  }, [nodes, links]); 

  return <svg ref={svgRef} width="1024" height="800" className="border"></svg>;
};

export default MindMapCanvas;

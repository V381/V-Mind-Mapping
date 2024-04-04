
import React, { useState } from 'react';

interface NodeProps {
  id: string;
  name: string;
  x: number;
  y: number;
  onDrag: (id: string, dx: number, dy: number) => void; 
}

const Node: React.FC<NodeProps> = ({ id, name, x, y, onDrag }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.MouseEvent<SVGCircleElement, MouseEvent>) => {
    setIsDragging(true);
  };

  const handleDrag = (e: React.MouseEvent<SVGCircleElement, MouseEvent>) => {
    if (!isDragging) return;
    const dx = e.movementX;
    const dy = e.movementY;
    onDrag(id, dx, dy);
  };

  const handleDragEnd = (e: React.MouseEvent<SVGCircleElement, MouseEvent>) => {
    setIsDragging(false);
  };

  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={40} 
        fill="blue"
        onMouseDown={handleDragStart}
        onMouseMove={handleDrag}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
      />
      <text x={x} y={y} dy=".35em" textAnchor="middle" fill="white">
        {name}
      </text>
    </g>
  );
};

export default Node;

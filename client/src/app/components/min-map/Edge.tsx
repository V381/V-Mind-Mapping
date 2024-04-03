
import React from 'react';

interface EdgeProps {
  source: { x: number; y: number };
  target: { x: number; y: number }; 

}

const Edge: React.FC<EdgeProps> = ({ source, target }) => {
  return (
    <line
      x1={source.x}
      y1={source.y}
      x2={target.x}
      y2={target.y}
      stroke="white" 
      strokeWidth={2} 
    />
  );
};

export default Edge;

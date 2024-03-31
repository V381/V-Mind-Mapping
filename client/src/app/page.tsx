import React from 'react';
import MindMapCanvas from '@/app/components/min-map/MindMapCanvas.client'

const nodes = [
  { id: '1', name: 'Node 1', x: 100, y: 150 },
  { id: '2', name: 'Node 2', x: 300, y: 150 },
  { id: '3', name: 'Node 3', x: 500, y: 150 },
];

const links = [
  { source: '1', target: '2' },
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 text-white">
      <MindMapCanvas nodes={nodes} links={links} />
    </main>
  );
}

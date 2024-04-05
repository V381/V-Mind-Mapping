"use client"
import React, { useState } from 'react';
import MindMapCanvas from '@/app/components/min-map/MindMapCanvas.client';
import EditNameModal from './components/min-map/EditNameModal';

interface NodeData {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string; 
}


const initialNodes = [
  { id: '1', name: 'Start', x: 100, y: 150, color: '#3490dc' },
];

const initialLinks = [
  { source: '1', target: '1', color: 'white' },
];

export default function Home() {
  const [nodes, setNodes] = useState(initialNodes);
  const [links, setLinks] = useState(initialLinks);
  const [newNodeName, setNewNodeName] = useState('');
  const [selectedNode, setSelectedNode] = useState(nodes[nodes.length - 1].id);
 
  const [editingNode, setEditingNode] = useState<NodeData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentName, setCurrentName] = useState("");
  const [currentLineColor, setCurrentLineColor] = useState("#000000");

  const updateNodeName = (id: string, newName: string) => {
    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === id ? { ...node, name: newName } : node
      )
    );
  };
  
  const handleCloseModal = () => setIsModalOpen(false);

  const handleEditNode = (node: NodeData): void => {
    setEditingNode(node); 
    setCurrentName(node.name); 
    setIsModalOpen(true); 
  };

  const currentLink = links[0];

  const handleUpdate = (newName: string, newColor: string, newLineColor: string) => {
    if (editingNode) {
      setNodes((prevNodes) =>
        prevNodes.map((node) =>
          node.id === editingNode.id ? { ...node, name: newName, color: newColor } : node
        )
      );
      setLinks((prevLinks) =>
        prevLinks.map((link) =>
          link.source === editingNode.id || link.target === editingNode.id
            ? { ...link, color: newLineColor }
            : link
        )
      );
      setIsModalOpen(false);
    }
  };
    
    
  const addNode = () => {
    if (!newNodeName.trim()) return;
  
    const newNodeId = (Math.max(...nodes.map(n => parseInt(n.id, 10)), 0) + 1).toString();
    const newNode = {
      id: newNodeId,
      name: newNodeName,
      x: Math.random() * 800,
      y: Math.random() * 600,
      color: '#3490dc',
    };

    const defaultLinkColor = '#999999'; 
  
    setNodes(nodes => [...nodes, newNode]);
    setLinks(links => [...links, { source: selectedNode, target: newNodeId, color: defaultLinkColor }]);
    setNewNodeName('');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 text-white">
      <h1 className='text-3xl'>Instructions</h1>
      <ol className='pb-10'>
        <li>Enter the node name.</li>
        <li>Select a node from the dropdown to connect.</li>
        <li>Drag nodes by holding the mouse cursor over the blue dot.</li>
        <li>Click the node text to edit text and color of circle.</li>
      </ol>
      <div className="flex flex-col space-y-2"> 
        <input
          type="text"
          placeholder="Enter new node name"
          value={newNodeName}
          onChange={(e) => setNewNodeName(e.target.value)}
          className="input border text-black border-gray-300 rounded-lg p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        <select
          value={selectedNode}
          onChange={(e) => setSelectedNode(e.target.value)}
          className="button bg-blue-500 text-white rounded-lg p-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
          {nodes.map((node) => (
            <option key={node.id} value={node.id}>
              {node.name}
            </option>
          ))}
        </select>
        <button onClick={addNode} className="py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75">Add Node</button>
      </div>
      <EditNameModal
        isOpen={isModalOpen}
        name={currentName}
        currentColor={editingNode ? editingNode.color : '#ffffff'}
        currentLineColor={currentLink ? currentLink.color : '#000000'} 
        onUpdate={handleUpdate} 
        onClose={handleCloseModal}
      />
      <MindMapCanvas
       nodes={nodes} links={links.map(link => {
        const sourceNode = typeof link.source === 'string' ? nodes.find(n => n.id === link.source) : link.source;
        const targetNode = typeof link.target === 'string' ? nodes.find(n => n.id === link.target) : link.target;
      
        if (!sourceNode || !targetNode) {
          throw new Error("Node not found.");
        }
      
        return {
          ...link,
          source: sourceNode, 
          target: targetNode, 
        };
      })}
      updateNodeName={(node) => updateNodeName(node.id, node.name)} 
      onEditNode={handleEditNode}
/>
    </main>
  );
}

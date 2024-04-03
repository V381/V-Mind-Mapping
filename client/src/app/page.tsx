"use client"
import React, { useState } from 'react';
import MindMapCanvas from '@/app/components/min-map/MindMapCanvas.client';
import EditNameModal from './components/min-map/EditNameModal';

const initialNodes = [
  { id: '1', name: 'Start', x: 100, y: 150 },
];

const initialLinks = [
  { source: '1', target: '1' },
];

export default function Home() {
  const [nodes, setNodes] = useState(initialNodes);
  const [links, setLinks] = useState(initialLinks);
  const [newNodeName, setNewNodeName] = useState('');
  const [selectedNode, setSelectedNode] = useState(nodes[nodes.length - 1].id);
 
  const [editingNode, setEditingNode] = useState<NodeData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentName, setCurrentName] = useState("");

  const updateNodeName = (id, newName) => {
    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === id ? { ...node, name: newName } : node
      )
    );
  };
  

  const handleUpdateNodeName = (newName: string) => {
    if (editingNode) {
      updateNodeName(editingNode.id, newName);
      setEditingNode(null);
      setIsModalOpen(false);
    }
  };  const handleCloseModal = () => setIsModalOpen(false);

  const handleUpdateName = (newName) => {
      setCurrentName(newName);
      handleUpdateNodeName(newName);
      handleCloseModal();
    };

  const handleEditNode = (node: NodeData) => {
    setEditingNode(node); 
    setCurrentName(node.name); 
    setIsModalOpen(true); 
  };

  const addNode = () => {
    if (!newNodeName.trim()) return;

    const newNodeId = (Math.max(...nodes.map(n => parseInt(n.id, 10))) + 1).toString();
    const newNode = {
      id: newNodeId,
      name: newNodeName,
      x: Math.random() * 800,
      y: Math.random() * 600, 
    };

    setNodes(nodes => [...nodes, newNode]);
    setLinks(links => [...links, { source: selectedNode, target: newNodeId, id: newNode.id }]);
    setNewNodeName('');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 text-white">
      <ul className='pb-10'>
        <li>Enter node name</li>
        <li>Select node from drop down to connect to</li>
        <li>Drag nodes by holdin mouse arrow on blue dot</li>
      </ul>
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
        onUpdate={(updatedName) => {
          if (editingNode) {
            setNodes((prevNodes) =>
              prevNodes.map((node) =>
                node.id === editingNode.id ? { ...node, name: updatedName } : node
              )
            );
            setIsModalOpen(false);
        }}}
        onClose={handleCloseModal}
      />
      <MindMapCanvas nodes={nodes} links={links} updateNodeName={(node) => updateNodeName(node.id, node.name)} onEditNode={handleEditNode}
/>
    </main>
  );
}

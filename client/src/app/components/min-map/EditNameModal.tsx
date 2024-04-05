"use client";
import React, { useEffect, useState } from 'react';

interface EditNameModalProps {
  isOpen: boolean; 
  name: string;
  currentColor: string;
  onUpdate: (newName: string, newColor: string, newLineColor: string) => void;
  onClose: () => void;
  currentLineColor: string
}

const EditNameModal: React.FC<EditNameModalProps> = ({ isOpen, name, currentColor, currentLineColor, onUpdate, onClose }) => {
  const [newName, setNewName] = useState(name);
  const [color, setColor] = useState(currentColor);
  const [lineColor, setLineColor] = useState(currentLineColor);


  useEffect(() => {
    setNewName(name);
    setColor(currentColor);
    setLineColor(currentLineColor);
  }, [name, currentColor, currentLineColor]);

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="bg-white p-5 rounded-lg shadow-lg max-w-sm w-full">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="input border-2 border-gray-200 rounded p-2 w-full text-black"
          />
          <p className='text-black'>Change circle color</p>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="mt-4"
          />
          <p className='text-black'>Change line color</p>
           <input
              type="color"
              value={lineColor}
              onChange={(e) => setLineColor(e.target.value)}
              className="mt-4"
            />
          <div className="flex justify-end space-x-2 mt-4">
          <button onClick={() => onUpdate(newName, color, lineColor)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
            Update
          </button>            
          <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors">Cancel</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditNameModal;
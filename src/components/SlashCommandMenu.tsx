import React from 'react';
import { BlockType } from '../types';

interface SlashCommandMenuProps {
  position: { top: number; left: number };
  blockTypes: BlockType[];
  selectedIndex: number;
  onSelect: (blockType: BlockType) => void;
  onClose: () => void;
}

const SlashCommandMenu: React.FC<SlashCommandMenuProps> = ({
  position,
  blockTypes,
  selectedIndex,
  onSelect,
}) => {
  return (
    <div
      className="absolute z-50 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[250px] max-h-80 overflow-y-auto"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <div className="px-3 py-2 text-xs text-muted-foreground border-b border-border">
        BLOCKS
      </div>
      {blockTypes.map((blockType, index) => (
        <button
          key={blockType.type}
          onClick={() => onSelect(blockType)}
          className={`w-full flex items-center px-3 py-2 text-left hover:bg-muted transition-colors ${
            index === selectedIndex ? 'bg-primary/10 text-primary' : 'text-card-foreground'
          }`}
        >
          <span className="mr-3 text-lg shrink-0">{blockType.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm">{blockType.label}</div>
            <div className="text-xs text-muted-foreground truncate">{blockType.description}</div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default SlashCommandMenu;

import { useEffect, useRef } from "react";
import { BlockType } from "../types";

interface SlashCommandMenuProps {
  blockTypes: BlockType[];
  selectedIndex: number;
  onSelect: (blockType: BlockType) => void;
}

const SlashCommandMenu: React.FC<SlashCommandMenuProps> = ({
  blockTypes,
  selectedIndex,
  onSelect,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLButtonElement>(null);

  // Scroll selected item into view when selectedIndex changes
  useEffect(() => {
    if (selectedItemRef.current && menuRef.current) {
      const menuElement = menuRef.current;
      const itemElement = selectedItemRef.current;

      const menuRect = menuElement.getBoundingClientRect();
      const itemRect = itemElement.getBoundingClientRect();

      // Check if item is outside visible area
      const isAboveViewport = itemRect.top < menuRect.top;
      const isBelowViewport = itemRect.bottom > menuRect.bottom;

      if (isAboveViewport) {
        // Scroll up to show the item
        itemElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } else if (isBelowViewport) {
        // Scroll down to show the item
        itemElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [selectedIndex]);

  return (
    <div ref={menuRef} className="py-1 min-w-[250px] max-h-80 overflow-y-auto">
      <div className="px-3 py-2 text-xs text-muted-foreground border-b border-border">
        BLOCKS
      </div>
      {blockTypes.map((blockType, index) => (
        <button
          key={blockType.type}
          ref={index === selectedIndex ? selectedItemRef : null}
          onClick={() => onSelect(blockType)}
          className={`w-full flex items-center px-3 py-2 text-left hover:bg-muted transition-colors ${
            index === selectedIndex
              ? "bg-primary/10 text-primary"
              : "text-card-foreground"
          }`}
        >
          <span className="mr-3 shrink-0 text-muted-foreground">
            {blockType.icon}
          </span>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm">{blockType.label}</div>
            <div className="text-xs text-muted-foreground truncate">
              {blockType.description}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default SlashCommandMenu;

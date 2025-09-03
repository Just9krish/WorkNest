import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Block, BlockType } from "../types";
import EditableBlock from "./EditableBlock";
import SlashCommandMenu from "./SlashCommandMenu";

interface BlockEditorProps {
  pageId: string;
}

const BlockEditor: React.FC<BlockEditorProps> = ({ pageId }) => {
  const { getPageBlocks, addBlock, updateBlock, deleteBlock } = useApp();
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({
    top: 0,
    left: 0,
  });
  const [selectedSlashIndex, setSelectedSlashIndex] = useState(0);
  const editorRef = useRef<HTMLDivElement>(null);

  const blocks = getPageBlocks(pageId);

  const blockTypes: BlockType[] = [
    {
      type: "text",
      label: "Text",
      icon: "📝",
      description: "Simple text block",
    },
    {
      type: "heading",
      label: "Heading",
      icon: "📋",
      description: "Large heading text",
    },
    {
      type: "todo",
      label: "To-do",
      icon: "☑️",
      description: "Checkbox with text",
    },
    {
      type: "image",
      label: "Image",
      icon: "🖼️",
      description: "Upload and display image",
    },
    {
      type: "toggle",
      label: "Toggle",
      icon: "▶️",
      description: "Collapsible content block",
    },
    {
      type: "divider",
      label: "Divider",
      icon: "➖",
      description: "Horizontal divider line",
    },
    {
      type: "code",
      label: "Code",
      icon: "💻",
      description: "Code block with syntax",
    },
  ];

  const handleBlockContentChange = (blockId: string, content: string) => {
    updateBlock(blockId, { content });

    if (content.endsWith("/")) {
      const blockElement = document.getElementById(`block-${blockId}`);
      if (blockElement) {
        const rect = blockElement.getBoundingClientRect();
        setSlashMenuPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
        });
        setShowSlashMenu(true);
        setFocusedBlockId(blockId);
        setSelectedSlashIndex(0);
      }
    } else {
      setShowSlashMenu(false);
    }
  };

  const handleKeyDown = async (
    e: React.KeyboardEvent,
    blockId: string,
    parentBlockId?: string
  ) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    switch (e.key) {
      case "Enter":
        if (showSlashMenu) {
          e.preventDefault();
          handleSlashMenuSelect(blockTypes[selectedSlashIndex]);
        } else {
          e.preventDefault();
          const newBlock = await addBlock(pageId, blockId, parentBlockId);
          setTimeout(() => {
            const newBlockElement = document.getElementById(
              `block-${newBlock.id}`
            );
            const input = newBlockElement?.querySelector(
              "input, textarea, [contenteditable]"
            ) as HTMLElement;
            input?.focus();
          }, 50); // Small delay to ensure element is rendered
        }
        break;

      case "Backspace":
        if (block.content === "") {
          e.preventDefault();
          const allBlocks = parentBlockId
            ? blocks.filter(b => b.parentBlockId === parentBlockId)
            : blocks.filter(b => !b.parentBlockId);

          const blockIndex = allBlocks.findIndex(b => b.id === blockId);
          if (blockIndex > 0) {
            const prevBlock = allBlocks[blockIndex - 1];
            await deleteBlock(blockId);
            setTimeout(() => {
              const prevBlockElement = document.getElementById(
                `block-${prevBlock.id}`
              );
              const input = prevBlockElement?.querySelector(
                "input, textarea, [contenteditable]"
              ) as HTMLElement;
              input?.focus();
            }, 50);
          }
        }
        break;

      case "ArrowUp":
        if (showSlashMenu) {
          e.preventDefault();
          setSelectedSlashIndex(prev =>
            prev > 0 ? prev - 1 : blockTypes.length - 1
          );
        }
        break;

      case "ArrowDown":
        if (showSlashMenu) {
          e.preventDefault();
          setSelectedSlashIndex(prev =>
            prev < blockTypes.length - 1 ? prev + 1 : 0
          );
        }
        break;

      case "Escape":
        if (showSlashMenu) {
          e.preventDefault();
          setShowSlashMenu(false);
          updateBlock(blockId, { content: block.content.slice(0, -1) });
        }
        break;
    }
  };

  const handleSlashMenuSelect = (blockType: BlockType) => {
    if (focusedBlockId) {
      const block = blocks.find(b => b.id === focusedBlockId);
      if (block) {
        const updates: Partial<Block> = {
          type: blockType.type,
          content:
            blockType.type === "divider" ? "" : block.content.slice(0, -1),
        };
        if (blockType.type === "todo") updates.checked = false;
        else if (blockType.type === "toggle") updates.isExpanded = false;
        else if (blockType.type === "code") updates.language = "javascript";
        updateBlock(focusedBlockId, updates);
      }
    }
    setShowSlashMenu(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showSlashMenu && !editorRef.current?.contains(e.target as Node)) {
        setShowSlashMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSlashMenu]);

  useEffect(() => {
    if (blocks.length === 0) {
      addBlock(pageId);
    }
  }, [blocks.length, pageId]);

  return (
    <div ref={editorRef} className="relative">
      <div className="space-y-2">
        {blocks.map(block => (
          <EditableBlock
            key={block.id}
            block={block}
            onContentChange={handleBlockContentChange}
            onKeyDown={handleKeyDown}
            onUpdateBlock={updates => updateBlock(block.id, updates)}
          />
        ))}
      </div>

      {showSlashMenu && (
        <SlashCommandMenu
          position={slashMenuPosition}
          blockTypes={blockTypes}
          selectedIndex={selectedSlashIndex}
          onSelect={handleSlashMenuSelect}
          onClose={() => setShowSlashMenu(false)}
        />
      )}
    </div>
  );
};

export default BlockEditor;

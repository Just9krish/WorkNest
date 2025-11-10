import React, { useState, useRef, useEffect } from "react";
import {
  FileText,
  Heading1,
  CheckSquare,
  Image as ImageIcon,
  ChevronRight,
  Minus,
  Code,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { Block, BlockType } from "../types";
import EditableBlock from "./EditableBlock";
import SlashCommandMenu from "./SlashCommandMenu";
import { Popover, PopoverContent, PopoverAnchor } from "./ui/popover";

interface BlockEditorProps {
  pageId: string;
}

const BlockEditor: React.FC<BlockEditorProps> = ({ pageId }) => {
  const { getPageBlocks, addBlock, updateBlock, deleteBlock } = useApp();
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuAnchor, setSlashMenuAnchor] = useState<
    HTMLInputElement | HTMLTextAreaElement | null
  >(null);
  const [selectedSlashIndex, setSelectedSlashIndex] = useState(0);
  const editorRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);

  const blocks = getPageBlocks(pageId);

  const blockTypes: BlockType[] = [
    {
      type: "text",
      label: "Text",
      icon: <FileText size={18} />,
      description: "Simple text block",
    },
    {
      type: "heading",
      label: "Heading",
      icon: <Heading1 size={18} />,
      description: "Large heading text",
    },
    {
      type: "todo",
      label: "To-do",
      icon: <CheckSquare size={18} />,
      description: "Checkbox with text",
    },
    {
      type: "image",
      label: "Image",
      icon: <ImageIcon size={18} />,
      description: "Upload and display image",
    },
    {
      type: "toggle",
      label: "Toggle",
      icon: <ChevronRight size={18} />,
      description: "Collapsible content block",
    },
    {
      type: "divider",
      label: "Divider",
      icon: <Minus size={18} />,
      description: "Horizontal divider line",
    },
    {
      type: "code",
      label: "Code",
      icon: <Code size={18} />,
      description: "Code block with syntax",
    },
  ];

  const handleBlockContentChange = (blockId: string, content: string) => {
    updateBlock(blockId, { content });

    if (content.endsWith("/")) {
      // Find the actual input/textarea element within the block
      const blockElement = document.getElementById(`block-${blockId}`);
      if (blockElement) {
        const inputElement = blockElement.querySelector("input, textarea") as
          | HTMLInputElement
          | HTMLTextAreaElement
          | null;

        if (inputElement) {
          setSlashMenuAnchor(inputElement);
          setShowSlashMenu(true);
          setFocusedBlockId(blockId);
          setSelectedSlashIndex(0);
        }
      }
    } else {
      setShowSlashMenu(false);
      setSlashMenuAnchor(null);
    }
  };

  // Update anchor position when menu anchor changes
  useEffect(() => {
    if (anchorRef.current && slashMenuAnchor) {
      const inputRect = slashMenuAnchor.getBoundingClientRect();
      const selectionStart =
        slashMenuAnchor.selectionStart || slashMenuAnchor.value.length;
      const textBeforeCursor = slashMenuAnchor.value.substring(
        0,
        selectionStart
      );

      // Create a temporary span to measure text width
      const span = document.createElement("span");
      const style = window.getComputedStyle(slashMenuAnchor);
      span.style.position = "absolute";
      span.style.visibility = "hidden";
      span.style.whiteSpace = "pre-wrap";
      span.style.font = style.font;
      span.style.fontSize = style.fontSize;
      span.style.fontFamily = style.fontFamily;
      span.style.fontWeight = style.fontWeight;
      span.style.letterSpacing = style.letterSpacing;
      document.body.appendChild(span);

      let cursorX = 0;
      let cursorY = 0;

      if (slashMenuAnchor instanceof HTMLTextAreaElement) {
        const lines = textBeforeCursor.split("\n");
        const currentLine = lines.length - 1;
        const lineHeight =
          parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.2;
        const lastLineText = lines[currentLine] || "";
        span.textContent = lastLineText || "\u00A0";
        cursorX = span.offsetWidth;
        cursorY = currentLine * lineHeight;
      } else {
        span.textContent = textBeforeCursor || "\u00A0";
        cursorX = span.offsetWidth;
      }

      document.body.removeChild(span);

      anchorRef.current.style.position = "fixed";
      anchorRef.current.style.top = `${
        inputRect.top + cursorY + inputRect.height
      }px`;
      anchorRef.current.style.left = `${inputRect.left + cursorX}px`;
      anchorRef.current.style.width = "0";
      anchorRef.current.style.height = "0";
      anchorRef.current.style.pointerEvents = "none";
    }
  }, [slashMenuAnchor, showSlashMenu]);

  const handleKeyDown = async (
    e: React.KeyboardEvent,
    blockId: string,
    parentBlockId?: string
  ) => {
    const block = blocks.find(b => b.$id === blockId);
    if (!block) return;

    switch (e.key) {
      case "Enter":
        if (showSlashMenu) {
          e.preventDefault();
          handleSlashMenuSelect(blockTypes[selectedSlashIndex]);
        } else {
          e.preventDefault();
          const newBlock = await addBlock(pageId, blockId, parentBlockId);
          // Use requestAnimationFrame for better timing with React's render cycle
          requestAnimationFrame(() => {
            setTimeout(() => {
              const newBlockElement = document.getElementById(
                `block-${newBlock.$id}`
              );
              const input = newBlockElement?.querySelector(
                "input, textarea, [contenteditable]"
              ) as HTMLElement;
              if (input) {
                input.focus();
                // Ensure cursor is at the end
                if (
                  input instanceof HTMLInputElement ||
                  input instanceof HTMLTextAreaElement
                ) {
                  const length = input.value.length;
                  input.setSelectionRange(length, length);
                }
              }
            }, 10);
          });
        }
        break;

      case "Backspace":
        if (block.content === "") {
          e.preventDefault();
          const allBlocks = parentBlockId
            ? blocks.filter(b => b.parentBlockId === parentBlockId)
            : blocks.filter(b => !b.parentBlockId);

          const blockIndex = allBlocks.findIndex(b => b.$id === blockId);
          if (blockIndex > 0) {
            const prevBlock = allBlocks[blockIndex - 1];
            await deleteBlock(blockId);
            setTimeout(() => {
              const prevBlockElement = document.getElementById(
                `block-${prevBlock.$id}`
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
      const block = blocks.find(b => b.$id === focusedBlockId);
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

  return (
    <div ref={editorRef} className="relative">
      <div className="space-y-2">
        {blocks.length === 0 ? (
          <div className="text-muted-foreground text-sm p-4">
            No blocks found. Creating initial block...
          </div>
        ) : (
          blocks.map(block => {
            return (
              <EditableBlock
                key={block.$id}
                block={block}
                onContentChange={handleBlockContentChange}
                onKeyDown={handleKeyDown}
                onUpdateBlock={updates => updateBlock(block.$id, updates)}
              />
            );
          })
        )}
      </div>

      {slashMenuAnchor && (
        <Popover open={showSlashMenu} onOpenChange={setShowSlashMenu}>
          <PopoverAnchor asChild>
            <div ref={anchorRef} />
          </PopoverAnchor>
          <PopoverContent
            className="w-[250px] p-0"
            align="start"
            side="bottom"
            sideOffset={4}
            onOpenAutoFocus={e => e.preventDefault()}
          >
            <SlashCommandMenu
              blockTypes={blockTypes}
              selectedIndex={selectedSlashIndex}
              onSelect={handleSlashMenuSelect}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default BlockEditor;

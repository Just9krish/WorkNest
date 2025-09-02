import React, { useState, useRef, useEffect } from "react";
import { ChevronRight, ChevronDown, Upload } from "lucide-react";
import { Block } from "../types";
import { useApp } from "../context/AppContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface EditableBlockProps {
  block: Block;
  onContentChange: (blockId: string, content: string) => void;
  onKeyDown: (
    e: React.KeyboardEvent,
    blockId: string,
    parentBlockId?: string
  ) => void;
  onUpdateBlock: (updates: Partial<Block>) => void;
}

const EditableBlock: React.FC<EditableBlockProps> = ({
  block,
  onContentChange,
  onKeyDown,
  onUpdateBlock,
}) => {
  const { getChildBlocks, toggleBlockExpansion, addBlock } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const childBlocks = block.type === "toggle" ? getChildBlocks(block.id) : [];

  const handleClick = () => {
    if (block.type !== "divider") {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    if (e.target.name === "language") {
      onUpdateBlock({ language: e.target.value });
    } else {
      onContentChange(block.id, e.target.value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    onKeyDown(e, block.id, block.parentBlockId || undefined);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateBlock({ checked: e.target.checked });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result as string;
        onUpdateBlock({ src });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleExpansion = () => {
    toggleBlockExpansion(block.id);
  };

  const handleAddChildBlock = async () => {
    const newBlock = await addBlock(block.pageId, undefined, block.id);
    setTimeout(() => {
      const newBlockElement = document.getElementById(`block-${newBlock.id}`);
      const input = newBlockElement?.querySelector(
        "input, textarea, [contenteditable]"
      ) as HTMLElement;
      input?.focus();
    }, 50);
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      const length = inputRef.current.value.length;
      inputRef.current.setSelectionRange(length, length);
    }
  }, [isEditing]);

  const getPlaceholder = () => {
    if (block.content === "") {
      return "Type '/' for commands";
    }
    return "";
  };

  const renderTextBlock = () => {
    if (isEditing || block.content === "") {
      return (
        <Input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          value={block.content}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={getPlaceholder()}
          className="w-full bg-transparent border-none outline-none text-foreground placeholder-muted-foreground text-base leading-relaxed resize-none shadow-none focus-visible:ring-0"
        />
      );
    }

    return (
      <div
        onClick={handleClick}
        className="w-full text-foreground text-base leading-relaxed cursor-text min-h-6 py-1"
      >
        {block.content || (
          <span className="text-muted-foreground">Type '/' for commands</span>
        )}
      </div>
    );
  };

  const renderHeadingBlock = () => {
    if (isEditing || block.content === "") {
      return (
        <Input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          value={block.content}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={getPlaceholder()}
          className="w-full bg-transparent border-none outline-none text-foreground placeholder-muted-foreground text-2xl font-bold leading-tight resize-none shadow-none focus-visible:ring-0"
        />
      );
    }

    return (
      <div
        onClick={handleClick}
        className="w-full text-foreground text-2xl font-bold leading-tight cursor-text min-h-8 py-1"
      >
        {block.content || (
          <span className="text-muted-foreground text-2xl font-bold">
            Type '/' for commands
          </span>
        )}
      </div>
    );
  };

  const renderTodoBlock = () => {
    return (
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          checked={block.checked || false}
          onChange={handleCheckboxChange}
          className="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-ring"
        />
        <div className="flex-1">
          {isEditing || block.content === "" ? (
            <Input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="text"
              value={block.content}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              placeholder={getPlaceholder()}
              className={`w-full bg-transparent border-none outline-none placeholder-muted-foreground text-base leading-relaxed resize-none shadow-none focus-visible:ring-0 ${
                block.checked
                  ? "text-muted-foreground line-through"
                  : "text-foreground"
              }`}
            />
          ) : (
            <div
              onClick={handleClick}
              className={`w-full text-base leading-relaxed cursor-text min-h-6 py-1 ${
                block.checked
                  ? "text-muted-foreground line-through"
                  : "text-foreground"
              }`}
            >
              {block.content || (
                <span className="text-muted-foreground no-underline">
                  Type '/' for commands
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderImageBlock = () => {
    return (
      <div className="space-y-3">
        {block.src ? (
          <div className="relative group">
            <img
              src={block.src}
              alt="Uploaded content"
              className="max-w-full h-auto rounded-lg border border-border"
              style={{ maxWidth: "600px" }}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/50 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              variant="ghost"
            >
              <Upload className="mr-2" size={20} />
              Replace Image
            </Button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground transition-colors"
          >
            <Upload className="mx-auto mb-2 text-muted-foreground" size={32} />
            <p className="text-muted-foreground">Click to upload an image</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>
    );
  };

  const renderToggleBlock = () => {
    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleToggleExpansion}
            variant="ghost"
            size="icon"
            className="p-1 h-auto w-auto"
          >
            {block.isExpanded ? (
              <ChevronDown size={16} className="text-muted-foreground" />
            ) : (
              <ChevronRight size={16} className="text-muted-foreground" />
            )}
          </Button>
          <div className="flex-1">
            {isEditing || block.content === "" ? (
              <Input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type="text"
                value={block.content}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                placeholder={getPlaceholder()}
                className="w-full bg-transparent border-none outline-none text-foreground placeholder-muted-foreground text-base leading-relaxed resize-none shadow-none focus-visible:ring-0"
              />
            ) : (
              <div
                onClick={handleClick}
                className="w-full text-foreground text-base leading-relaxed cursor-text min-h-6 py-1"
              >
                {block.content || (
                  <span className="text-muted-foreground">
                    Type '/' for commands
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {block.isExpanded && (
          <div className="ml-6 space-y-2">
            {childBlocks.map((childBlock) => (
              <EditableBlock
                key={childBlock.id}
                block={childBlock}
                onContentChange={onContentChange}
                onKeyDown={onKeyDown}
                onUpdateBlock={onUpdateBlock}
              />
            ))}
            <Button
              onClick={handleAddChildBlock}
              variant="ghost"
              className="text-muted-foreground hover:text-foreground text-sm p-0 h-auto"
            >
              + Add a block
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderDividerBlock = () => {
    return <hr className="border-border my-4" />;
  };

  const renderCodeBlock = () => {
    const languages = [
      { value: "javascript", label: "JavaScript" },
      { value: "python", label: "Python" },
      { value: "typescript", label: "TypeScript" },
      { value: "html", label: "HTML" },
      { value: "css", label: "CSS" },
      { value: "json", label: "JSON" },
      { value: "plaintext", label: "Plain Text" },
    ];

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">
            Code Block
          </span>
          <select
            name="language"
            value={block.language || "javascript"}
            onChange={handleChange}
            className="text-xs px-2 py-1 border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-muted rounded-lg p-4">
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={block.content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsEditing(true)}
            onBlur={handleBlur}
            placeholder="Enter your code here..."
            className="w-full bg-transparent border-none outline-none text-foreground placeholder-muted-foreground text-sm font-mono leading-relaxed resize-none"
            rows={Math.max(3, block.content.split("\n").length)}
          />
        </div>
      </div>
    );
  };

  const renderBlock = () => {
    switch (block.type) {
      case "heading":
        return renderHeadingBlock();
      case "todo":
        return renderTodoBlock();
      case "image":
        return renderImageBlock();
      case "toggle":
        return renderToggleBlock();
      case "divider":
        return renderDividerBlock();
      case "code":
        return renderCodeBlock();
      default:
        return renderTextBlock();
    }
  };

  return (
    <div
      id={`block-${block.id}`}
      className={`group relative rounded-md transition-colors ${
        block.type === "divider" ? "" : "px-4 py-2 hover:bg-muted/50"
      } ${block.parentBlockId ? "ml-4" : ""}`}
    >
      {renderBlock()}
    </div>
  );
};

export default EditableBlock;

import React, { useState, useRef } from "react";
import { useApp } from "../context/AppContext";
import BlockEditor from "./BlockEditor";
import RoadmapTemplate from "./templates/RoadmapTemplate";
import CalendarTemplate from "./templates/CalendarTemplate";
import IconPicker from "./IconPicker";
import { useOnClickOutside } from "../hooks/useOnClickOutside";
import { SmilePlus } from "lucide-react";
import { Button } from "./ui/button";

const MainContent: React.FC = () => {
  const {
    pages,
    templates,
    selectedPageId,
    selectedTemplateId,
    isSidebarCollapsed,
    updatePage,
  } = useApp();
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const iconPickerRef = useRef<HTMLDivElement>(null);
  const iconButtonRef = useRef<HTMLButtonElement>(null);

  useOnClickOutside(
    iconPickerRef,
    () => setIsIconPickerOpen(false),
    iconButtonRef as React.RefObject<HTMLElement>
  );

  if (selectedTemplateId) {
    const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

    if (selectedTemplate?.type === "roadmap") {
      return <RoadmapTemplate />;
    } else if (selectedTemplate?.type === "calendar") {
      return <CalendarTemplate />;
    }
  }

  const selectedPage = pages.find(page => page.id === selectedPageId);

  if (!selectedPage) {
    return (
      <div
        className={`flex-1 flex items-center justify-center transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? "ml-0" : ""
        }`}
      >
        <div className="text-center text-muted-foreground">
          <p className="text-lg mb-2">No page selected</p>
          <p className="text-sm">
            Select a page from the sidebar or create a new one.
          </p>
        </div>
      </div>
    );
  }

  const handleIconSelect = (icon: string) => {
    updatePage(selectedPage.id, { icon });
    setIsIconPickerOpen(false);
  };

  return (
    <div
      className={`flex-1 bg-background transition-all duration-300 ease-in-out ${
        isSidebarCollapsed ? "ml-0" : ""
      }`}
    >
      <div className="border-b border-border px-8 py-6">
        <div className="relative mb-4">
          <Button
            ref={iconButtonRef}
            onClick={() => setIsIconPickerOpen(prev => !prev)}
            variant="ghost"
            className="hover:bg-muted rounded-lg p-2 transition-colors"
          >
            {selectedPage.icon ? (
              <span className="text-5xl">{selectedPage.icon}</span>
            ) : (
              <div className="flex items-center text-muted-foreground p-2">
                <SmilePlus size={24} className="mr-2" />
                <span className="text-sm font-medium">Add Icon</span>
              </div>
            )}
          </Button>
          {isIconPickerOpen && (
            <div ref={iconPickerRef} className="absolute top-full mt-2 z-50">
              <IconPicker onSelect={handleIconSelect} />
            </div>
          )}
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-2">
          {selectedPage.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          Created on {new Date(selectedPage.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="px-4 py-6 max-w-4xl mx-auto">
        <BlockEditor key={selectedPage.id} pageId={selectedPage.id} />
      </div>
    </div>
  );
};

export default MainContent;

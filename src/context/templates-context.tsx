import React, { createContext, useContext, useMemo, useState } from "react";
import { Template } from "../types";

const initialTemplates: Template[] = [
  {
    id: "template-roadmap",
    name: "Roadmap",
    icon: "🗺️",
    description: "Plan and track project milestones",
    type: "roadmap",
  },
  {
    id: "template-calendar",
    name: "Calendar",
    icon: "📅",
    description: "Organize events and deadlines",
    type: "calendar",
  },
];

interface TemplatesContextValue {
  templates: Template[];
  selectedTemplateId: string | null;
  selectTemplate: (templateId: string | null) => void;
}

const TemplatesContext = createContext<TemplatesContextValue | undefined>(
  undefined
);

export function TemplatesProvider({ children }: { children: React.ReactNode }) {
  const [templates] = useState<Template[]>(initialTemplates);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  );

  const selectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
  };

  const value = useMemo(
    () => ({ templates, selectedTemplateId, selectTemplate }),
    [templates, selectedTemplateId]
  );
  return (
    <TemplatesContext.Provider value={value}>
      {children}
    </TemplatesContext.Provider>
  );
}

export function useTemplates() {
  const ctx = useContext(TemplatesContext);
  if (!ctx)
    throw new Error("useTemplates must be used within TemplatesProvider");
  return ctx;
}

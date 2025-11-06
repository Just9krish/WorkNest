import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTemplates } from "../context/templates-context";

/**
 * Syncs template selection with URL
 * URL is the source of truth - when URL changes, update template selection
 */
export const TemplateNavigationSync: React.FC = () => {
  const location = useLocation();
  const { templates, selectedTemplateId, selectTemplate } = useTemplates();

  // Sync selected template with URL (URL is source of truth)
  useEffect(() => {
    const templateMatch = location.pathname.match(/^\/templates\/([^/]+)$/);
    if (templateMatch) {
      const templateType = templateMatch[1];
      const template = templates.find(t => t.type === templateType);
      if (template && selectedTemplateId !== template.id) {
        selectTemplate(template.id);
      }
    } else {
      // Clear template selection if not on a template route
      if (selectedTemplateId !== null) {
        selectTemplate(null);
      }
    }
  }, [location.pathname, templates, selectedTemplateId, selectTemplate]);

  return null;
};

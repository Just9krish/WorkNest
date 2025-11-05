import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { usePages } from "../context/pages-context";

/**
 * Syncs page selection with URL and vice versa
 */
export const PageNavigationSync: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pages, selectedPageId, selectPage } = usePages();

  // Sync URL with selected page
  useEffect(() => {
    if (selectedPageId) {
      const selectedPage = pages.find(p => p.$id === selectedPageId);
      if (selectedPage && location.pathname !== `/page/${selectedPage.slug}`) {
        navigate(`/page/${selectedPage.slug}`, { replace: true });
      }
    }
  }, [selectedPageId, pages, navigate, location.pathname]);

  // Sync selected page with URL
  useEffect(() => {
    const slugMatch = location.pathname.match(/^\/page\/([^/]+)$/);
    if (slugMatch) {
      const slug = slugMatch[1];
      const page = pages.find(p => p.slug === slug);
      if (page && selectedPageId !== page.$id) {
        selectPage(page.$id);
      }
    }
  }, [location.pathname, pages, selectedPageId, selectPage]);

  return null;
};

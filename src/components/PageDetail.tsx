import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePages } from "../context/pages-context";
import BlockEditor from "./BlockEditor";
import IconPicker from "./IconPicker";
import { useOnClickOutside } from "../hooks/useOnClickOutside";
import { SmilePlus, LoaderCircle } from "lucide-react";
import { Button } from "./ui/button";

const PageDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { pages, getPageBySlug, updatePage } = usePages();
  const [page, setPage] = React.useState(
    pages.find(p => p.slug === slug) || null
  );
  const [isLoading, setIsLoading] = React.useState(!page);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const iconPickerRef = useRef<HTMLDivElement>(null);
  const iconButtonRef = useRef<HTMLButtonElement>(null);

  useOnClickOutside(
    iconPickerRef,
    () => setIsIconPickerOpen(false),
    iconButtonRef as React.RefObject<HTMLElement>
  );

  useEffect(() => {
    const loadPage = async () => {
      if (slug) {
        // First check if page is already loaded
        const existingPage = pages.find(p => p.slug === slug);
        if (existingPage) {
          setPage(existingPage);
          setIsLoading(false);
          return;
        }

        // If not found, fetch from database
        setIsLoading(true);
        const fetchedPage = await getPageBySlug(slug);
        if (fetchedPage) {
          setPage(fetchedPage);
        }
        setIsLoading(false);
      }
    };

    loadPage();
  }, [slug, pages, getPageBySlug]);

  // Update page when pages array changes (in case page was updated)
  useEffect(() => {
    if (slug) {
      const updatedPage = pages.find(p => p.slug === slug);
      if (updatedPage) {
        setPage(updatedPage);
      }
    }
  }, [pages, slug]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <LoaderCircle className="animate-spin text-primary" size={48} />
          <p className="text-muted-foreground">Loading page...</p>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p className="text-lg mb-2">Page not found</p>
          <p className="text-sm mb-4">
            The page you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate("/")} variant="outline">
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  const handleIconSelect = (icon: string) => {
    updatePage(page.$id, { icon });
    setIsIconPickerOpen(false);
  };

  return (
    <div className="flex-1 bg-background">
      <div className="border-b border-border px-8 py-6">
        <div className="relative mb-4">
          <Button
            ref={iconButtonRef}
            onClick={() => setIsIconPickerOpen(prev => !prev)}
            variant="ghost"
            className="hover:bg-muted rounded-lg p-2 transition-colors"
          >
            {page.icon ? (
              <span className="text-5xl">{page.icon}</span>
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
          {page.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          Created on {new Date(page.$createdAt).toLocaleDateString()}
        </p>
      </div>
      <div className="px-4 py-6 max-w-4xl mx-auto">
        <BlockEditor key={page.$id} pageId={page.$id} />
      </div>
    </div>
  );
};

export default PageDetail;

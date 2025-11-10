import React, { useState } from "react";
import {
  Plus,
  FileText,
  LogOut,
  Pencil,
  Link as LinkIcon,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { Page } from "../types";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "./ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useAlertDialog } from "../context/alert-dialog-context";

const AppSidebar: React.FC = () => {
  const {
    workspace,
    pages,
    templates,
    selectedPageId,
    deletePage,
    updatePage,
    addPage,
    selectPage,
    signOut,
  } = useApp();

  const { showAlert } = useAlertDialog();

  const navigate = useNavigate();
  const location = useLocation();
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingPageTitle, setEditingPageTitle] = useState("");
  const { state } = useSidebar();
  const [contextPageId, setContextPageId] = useState<string | null>(null);
  const [hoveredPageId, setHoveredPageId] = useState<string | null>(null);

  const handlePageTitleSubmit = () => {
    if (editingPageId && editingPageTitle.trim()) {
      updatePage(editingPageId, { title: editingPageTitle.trim() });
    }
    setEditingPageId(null);
    setEditingPageTitle("");
  };

  const handlePageTitleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handlePageTitleSubmit();
    } else if (e.key === "Escape") {
      setEditingPageId(null);
      setEditingPageTitle("");
    }
  };

  const handleSignOut = async () => {
    showAlert({
      title: "Sign out",
      description: "Are you sure you want to sign out?",
      onConfirm: async () => {
        await signOut();
        navigate("/login");
      },
      variant: "destructive",
      confirmText: "Sign out",
    });
  };

  const handleDeletePage = async (pageId: string) => {
    showAlert({
      title: "Delete page",
      description: "Are you sure you want to delete this page?",
      onConfirm: async () => {
        setContextPageId(null);
        await deletePage(pageId);
      },
      variant: "destructive",
      confirmText: "Delete",
    });
  };

  const getChildPages = (parentId: string | null): Page[] => {
    return pages.filter(page => page.parentId === parentId);
  };

  const hasChildren = (pageId: string): boolean => {
    return pages.some(page => page.parentId === pageId);
  };

  const renderPage = (page: Page, level: number = 0) => {
    const children = getChildPages(page.$id);
    const hasChildPages = hasChildren(page.$id);
    const isSelected = selectedPageId === page.$id;
    const isExpanded = page.isExpanded;
    const isEditing = editingPageId === page.$id;

    if (state === "collapsed" && level > 0) {
      return null;
    }

    return (
      <SidebarMenuItem
        key={page.$id}
        onMouseEnter={() => setHoveredPageId(page.$id)}
        onMouseLeave={() => setHoveredPageId(null)}
      >
        <DropdownMenu
          open={contextPageId === page.$id}
          onOpenChange={open => setContextPageId(open ? page.$id : null)}
          modal={false}
        >
          {/* Single invisible trigger for positioning only - menu is controlled via open prop */}
          <DropdownMenuTrigger asChild>
            <div
              className="absolute inset-0 pointer-events-none"
              aria-hidden="true"
            />
          </DropdownMenuTrigger>

          <div className="relative flex items-center w-full">
            <SidebarMenuButton
              isActive={isSelected}
              onClick={() => {
                // Left click only selects and navigates, no inline rename
                if (!isEditing) {
                  selectPage(page.$id);
                  navigate(`/page/${page.slug}`);
                }
              }}
              onContextMenu={e => {
                e.preventDefault();
                setContextPageId(page.$id);
              }}
              tooltip={state === "collapsed" ? page.title : undefined}
              className="flex-1"
            >
              <FileText size={14} />
              {state !== "collapsed" && (
                <>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editingPageTitle}
                      onChange={e => setEditingPageTitle(e.target.value)}
                      onBlur={handlePageTitleSubmit}
                      onKeyDown={handlePageTitleKeyPress}
                      className="flex-1 px-1 py-0.5 text-sm bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                      autoFocus
                      onClick={e => e.stopPropagation()}
                    />
                  ) : (
                    <span className="truncate flex-1">{page.title}</span>
                  )}
                </>
              )}
            </SidebarMenuButton>
            {state !== "collapsed" && !isEditing && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  setContextPageId(page.$id);
                }}
                className={`absolute right-1 transition-opacity p-1 rounded flex items-center justify-center shrink-0 ${
                  hoveredPageId === page.$id ? "opacity-100" : "opacity-0"
                }`}
                aria-label="Page options"
              >
                <MoreHorizontal size={16} className="text-muted-foreground" />
              </button>
            )}
          </div>

          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem
              onClick={() => {
                setEditingPageId(page.$id);
                setEditingPageTitle(page.title);
                setContextPageId(null);
              }}
            >
              <Pencil size={16} />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                const origin =
                  typeof window !== "undefined" ? window.location.origin : "";
                const link = `${origin}/page/${page.slug}`;
                navigator.clipboard?.writeText(link);
                setContextPageId(null);
              }}
            >
              <LinkIcon size={16} />
              Copy link
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                handleDeletePage(page.$id);
              }}
            >
              <Trash2 size={16} />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {state !== "collapsed" && hasChildPages && isExpanded && (
          <SidebarMenuSub>
            {children.map(child => (
              <SidebarMenuSubItem key={child.$id}>
                <SidebarMenuSubButton
                  isActive={selectedPageId === child.$id}
                  onClick={() => {
                    selectPage(child.$id);
                    navigate(`/page/${child.slug}`);
                  }}
                >
                  <FileText size={14} />
                  <span className="truncate">{child.title}</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        )}
      </SidebarMenuItem>
    );
  };

  const rootPages = getChildPages(null);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-primary to-primary/80 rounded-md flex items-center justify-center font-bold text-primary-foreground text-lg shrink-0">
            W
          </div>
          {state !== "collapsed" && workspace && (
            <h1 className="text-lg font-bold text-sidebar-foreground">
              {workspace.name || "Worknest"}
            </h1>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Templates</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {templates.map(template => {
                const isActive =
                  location.pathname === `/templates/${template.type}`;
                return (
                  <SidebarMenuItem key={template.name}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => {
                        console.log("clicked", template.type);
                        navigate(`/templates/${template.type}`);
                      }}
                      tooltip={
                        state === "collapsed" ? template.name : undefined
                      }
                    >
                      <span className="text-sm">{template.icon}</span>
                      {state !== "collapsed" && (
                        <span className="truncate">{template.name}</span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Pages</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{rootPages.map(page => renderPage(page))}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={async () => {
                await addPage();
                // Navigation will happen via the page selection in the context
              }}
              tooltip={state === "collapsed" ? "Add Page" : undefined}
            >
              <Plus size={16} />
              {state !== "collapsed" && "Add Page"}
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleSignOut}
              tooltip={state === "collapsed" ? "Sign Out" : undefined}
            >
              <LogOut size={16} />
              {state !== "collapsed" && "Sign Out"}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;

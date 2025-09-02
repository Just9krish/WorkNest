import React, { useState } from 'react';
import { Plus, FileText, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Page } from '../types';
import { useNavigate } from 'react-router-dom';
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
} from './ui/sidebar';

const AppSidebar: React.FC = () => {
  const { 
    workspace, 
    pages, 
    templates, 
    selectedPageId, 
    selectedTemplateId,
    updatePage,
    addPage,
    selectPage, 
    selectTemplate,
    signOut
  } = useApp();
  
  const navigate = useNavigate();
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingPageTitle, setEditingPageTitle] = useState('');
  const { state } = useSidebar();

  const handlePageTitleEdit = (page: Page) => {
    if (state !== 'collapsed') {
      setEditingPageId(page.id);
      setEditingPageTitle(page.title);
    }
  };

  const handlePageTitleSubmit = () => {
    if (editingPageId && editingPageTitle.trim()) {
      updatePage(editingPageId, { title: editingPageTitle.trim() });
    }
    setEditingPageId(null);
    setEditingPageTitle('');
  };

  const handlePageTitleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePageTitleSubmit();
    } else if (e.key === 'Escape') {
      setEditingPageId(null);
      setEditingPageTitle('');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const getChildPages = (parentId: string | null): Page[] => {
    return pages.filter(page => page.parentId === parentId);
  };

  const hasChildren = (pageId: string): boolean => {
    return pages.some(page => page.parentId === pageId);
  };

  const renderPage = (page: Page, level: number = 0) => {
    const children = getChildPages(page.id);
    const hasChildPages = hasChildren(page.id);
    const isSelected = selectedPageId === page.id;
    const isExpanded = page.isExpanded;
    const isEditing = editingPageId === page.id;

    if (state === 'collapsed' && level > 0) {
      return null;
    }

    return (
      <SidebarMenuItem key={page.id}>
        <SidebarMenuButton
          isActive={isSelected}
          onClick={() => !isEditing && selectPage(page.id)}
          tooltip={state === 'collapsed' ? page.title : undefined}
        >
          {page.icon ? (
            <span className="text-sm">{page.icon}</span>
          ) : (
            <FileText size={14} />
          )}
          {state !== 'collapsed' && (
            <>
              {isEditing ? (
                <input
                  type="text"
                  value={editingPageTitle}
                  onChange={(e) => setEditingPageTitle(e.target.value)}
                  onBlur={handlePageTitleSubmit}
                  onKeyDown={handlePageTitleKeyPress}
                  className="flex-1 px-1 py-0.5 text-sm bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span 
                  className="truncate flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePageTitleEdit(page);
                  }}
                >
                  {page.title}
                </span>
              )}
            </>
          )}
        </SidebarMenuButton>
        
        {state !== 'collapsed' && hasChildPages && isExpanded && (
          <SidebarMenuSub>
            {children.map(child => (
              <SidebarMenuSubItem key={child.id}>
                <SidebarMenuSubButton
                  isActive={selectedPageId === child.id}
                  onClick={() => selectPage(child.id)}
                >
                  {child.icon ? (
                    <span className="text-sm">{child.icon}</span>
                  ) : (
                    <FileText size={14} />
                  )}
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
            Q
          </div>
          {state !== 'collapsed' && workspace && (
            <h1 className="text-lg font-bold text-sidebar-foreground">
              {workspace.name}
            </h1>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Templates</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {templates.map(template => (
                <SidebarMenuItem key={template.id}>
                  <SidebarMenuButton
                    isActive={selectedTemplateId === template.id}
                    onClick={() => selectTemplate(template.id)}
                    tooltip={state === 'collapsed' ? template.name : undefined}
                  >
                    <span className="text-sm">{template.icon}</span>
                    {state !== 'collapsed' && (
                      <span className="truncate">{template.name}</span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Pages</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {rootPages.map(page => renderPage(page))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => addPage()}
              tooltip={state === 'collapsed' ? 'Add Page' : undefined}
            >
              <Plus size={16} />
              {state !== 'collapsed' && 'Add Page'}
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleSignOut}
              tooltip={state === 'collapsed' ? 'Sign Out' : undefined}
            >
              <LogOut size={16} />
              {state !== 'collapsed' && 'Sign Out'}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;

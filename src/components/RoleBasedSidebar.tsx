import React from 'react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar';
import { DepartmentNavigation } from '@/components/departments/DepartmentNavigation';

export const RoleBasedSidebar = () => {
  return (
    <Sidebar className="w-64" collapsible="icon">
      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="font-arabic text-primary font-semibold">
            نظام إدارة الشرطة
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <DepartmentNavigation />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
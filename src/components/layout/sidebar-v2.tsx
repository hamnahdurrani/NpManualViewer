import React, { useState } from "react";
import { InfoIcon, MessageCircle, Settings, UserCircle, Moon, Sun, Mail } from "lucide-react";
import SettingsModal from "@/features/setting/SettingsModal";
import { SideBarLogoButton } from "@/components/logo";
import { useThemeContext } from "@/hooks/themeContext";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";

const AppSidebarV2 = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { theme, toggleTheme } = useThemeContext();
  const { state: sidebarState, toggleSidebar, setOpenMobile, openMobile } = useSidebar();
  const isMobile = useIsMobile();
  const isCollapsed = sidebarState === "collapsed";

  // On mobile sheet, always show full logo
  const logoCollapsed = isMobile ? false : isCollapsed;

  // Handler for settings that closes sidebar on mobile
  const handleSettingsClick = () => {
    if (isMobile && openMobile) {
      setOpenMobile(false); // Close mobile sidebar sheet
    }
    setIsSettingsOpen(true);
  };

  return (
    <>
      <Sidebar collapsible="icon" className="border-r border-border bg-secondary!">
        {/* Header with Logo */}
        <SidebarHeader>
          <SideBarLogoButton collapsed={logoCollapsed} onClick={toggleSidebar} />
        </SidebarHeader>

        {/* Main Content */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {/* About */}
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="About" className='[&>svg]:size-6 mx-auto pl-3'>
                    <InfoIcon />
                    <span>About</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Feedback */}
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Feedback" className='[&>svg]:size-6 mx-auto pl-3'>
                    <Mail/>
                    <span>Feedback</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Footer with Settings, Theme, and User */}
        <SidebarFooter>
          {/* <SidebarMenu>
            
            <SidebarMenuItem>
              <SidebarMenuButton onClick={toggleTheme} tooltip="Toggle Theme" className='[&>svg]:size-6 mx-auto pl-3'>
                {theme === "dark" ? <Moon /> : <Sun />}
                <span>Theme</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleSettingsClick} tooltip="Settings" className='[&>svg]:size-6 mx-auto pl-3'>
                <Settings />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="User" className='[&>svg]:size-6 mx-auto pl-3'>
                <UserCircle />
                <span>User</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu> */}
          <NavUser user={{ name: "first_last", email: "first_last@example.com", avatar: "" }} theme={theme} setTheme={toggleTheme} handleSettingsClick={handleSettingsClick}/>
        </SidebarFooter>
      </Sidebar>

      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
    </>
  );
};

export default AppSidebarV2;
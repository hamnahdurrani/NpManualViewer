import ChatComponent from "@/features/chat/chat";
import {MobileTopBar, TopBar} from "@/components/layout/topbar";
import SupplementalContentPanel from "@/components/layout/supplementalContentPanel";
import AppSidebar from "@/components/layout/sidebar";
import { useState, useEffect } from "react";
import { useLayoutContext } from "@/hooks/layoutContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Chat() {
  const { openPanel, isSupplementalContentPanelOpen, togglePanel, mobileTab, setMobileTab } = useLayoutContext();
  const isMobile = useIsMobile();

  // Auto-open panel on mobile if Tools tab is selected initially
  useEffect(() => {
    if (isMobile && mobileTab === "tools" && !isSupplementalContentPanelOpen) {
      openPanel("manual-viewer");
    }
  }, [isMobile, mobileTab, isSupplementalContentPanelOpen, openPanel]);

  return (
    <SidebarProvider>
      <div className="flex flex-row h-[100dvh] overflow-hidden bg-background w-full max-w-full">
        <AppSidebar />
        
        {/* Mobile header offset wrapper */}
        <div className="flex flex-1 min-w-0 overflow-hidden pt-[100px] md:pt-0">
          {/* Mobile top bar */}
          <MobileTopBar mobileTab={mobileTab} setMobileTab={setMobileTab} />
          
          {/* Content area - relative container for mobile sliding */}
          <div className="flex flex-1 md:flex-row overflow-hidden relative">
            {/* Chat wrapper - slides from left on mobile */}
            <div className={cn(
              "flex flex-col flex-1 transition-transform duration-300 ease-in-out",
              // Desktop: normal flex layout
              "md:flex-col md:relative",
              // Mobile: absolute positioning for slide animation
              "absolute md:relative inset-0 md:inset-auto w-full md:w-auto",
              mobileTab === "chat" ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}>
              {/* Desktop top bar: Only visible on desktop, above chat */}
              <TopBar />
              <ChatComponent />
            </div>

            {/* SupplementalContentPanel wrapper - slides from right on mobile */}
            <div className={cn(
              "transition-transform duration-300 ease-in-out w-full",
              // Desktop: normal flex behavior
              "md:relative md:w-[57%]",
              isSupplementalContentPanelOpen ? "md:flex" : "hidden",
              // Mobile: absolute positioning for slide animation
              "absolute md:relative inset-0 md:inset-auto w-full",
              mobileTab === "tools" ? "translate-x-0" : "translate-x-full md:translate-x-0"
            )}>
              <SupplementalContentPanel isActiveTab={mobileTab === "tools"} />
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}

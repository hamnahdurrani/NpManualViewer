import { useLayoutContext } from "@/hooks/layoutContext";
import { useSidebar } from "@/components/ui/sidebar";
import { PanelRightClose, PanelRightOpen, Menu, MessageSquare, BookOpen, Settings, Blocks } from "lucide-react";
import { cn } from "@/lib/utils";
import {Logo} from "@/components/logo";

interface MobileTopBarProps {
  mobileTab?: "chat" | "tools";
  setMobileTab?: (tab: "chat" | "tools") => void;
}

export const TopBar = () => {
  const { togglePanel, isSupplementalContentPanelOpen } = useLayoutContext();
  return (
      <header className="hidden md:flex h-14  bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 items-center justify-between px-4 z-30">
        <div className="flex items-center gap-2 shrink-0 w-[52px]"/>
        <div className="flex-1 min-w-0 flex justify-center px-2 w-32">
          <h1 className="font-semibold text-sm md:text-base truncate max-w-full">
            Netpeople Agent
          </h1>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={togglePanel}
            className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground"
          >
            {isSupplementalContentPanelOpen ? <PanelRightClose className="size-5" /> : <PanelRightOpen className="size-5" />}
          </button>
        </div>
      </header>
  );
};


export const MobileTopBar = ({ mobileTab = "chat", setMobileTab }: MobileTopBarProps) => {
  const { toggleSidebar, state } = useSidebar();
  return (
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-background">
        <div className="flex items-center justify-between h-14 px-4 border-b border-border">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-accent rounded-lg transition-colors text-foreground"
          >
            <Menu className="size-5" />
          </button>
          <div className="flex-1 min-w-0 flex justify-center items-center px-2 w-32 gap-1">
            <Logo collapsed={true} className="h-6"/>
            <h1 className="text md:text-base truncate max-w-full">
              netpeople
            </h1>
          </div>
          <div className="px-4"/>
        </div>
        {/* Tab */}
        <div className="flex h-11 border-b border-border">
          <button
            onClick={() => setMobileTab?.("chat")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 text-[13px] font-medium transition-colors",
              mobileTab === "chat"
                ? "text-foreground border-b-2 border-primary"
                : "text-muted-foreground"
            )}
          >
            <MessageSquare className="w-4 h-4" />
            Chat
          </button>
          <button
            onClick={() => setMobileTab?.("tools")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 text-[13px] font-medium transition-colors",
              mobileTab === "tools"
                ? "text-foreground border-b-2 border-primary"
                : "text-muted-foreground"
            )}
          >
            <Blocks className="w-4 h-4" />
            Tools
          </button>
        </div>
      </header>
  )
}
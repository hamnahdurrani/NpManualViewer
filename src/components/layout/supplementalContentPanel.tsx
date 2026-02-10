import React from "react";
import { cn } from "@/lib/utils";
import {useLayoutContext} from "@/hooks/layoutContext";
import { getPlugin, PLUGINS, type PluginDefinition, type PluginId } from "@/lib/pluginRegistry";
import { useIsMobile } from "@/hooks/use-mobile";

interface SupplementalContentPanelProps {
  isActiveTab?: boolean;
}

// Rename to match the file or specific usage context if needed, keeping generic for now
const SupplementalContentPanel = ({ isActiveTab = false }: SupplementalContentPanelProps) => {
  const {
      isSupplementalContentPanelOpen, 
      activePluginId, 
      openPanel, 
      pluginData, 
  } = useLayoutContext();

  // On mobile, always show when isMobile is true (controlled by tab)
  // On desktop, show when panel is open
  // if (!isActiveTab && !isSupplementalContentPanelOpen) return null;

  const activePlugin = activePluginId ? getPlugin(activePluginId) : null;
  const ActiveComponent = activePlugin?.component;
  const isMobile = useIsMobile();

  const shouldShow = (isMobile && isActiveTab) || isSupplementalContentPanelOpen;

  return (
    <div className={cn(
      !shouldShow && "hidden",
      "flex flex-col h-full border-l border-border bg-background text-foreground flex w-full"
    )}>
      {/* Header Area */}
      <div className="flex flex-col border-b border-border bg-background">
        <div className="flex items-center justify-start gap-3 px-4 pt-2 pb-2">
          <div className="flex items-center gap-2">
             {Object.values(PLUGINS).map((plugin: PluginDefinition) => {
               const isActive = activePluginId === plugin.id;
               return (
               <button
                 key={plugin.id}
                 onClick={() => openPanel(plugin.id as PluginId)}
                 className={cn(
                   "px-4 py-2 rounded-lg text-xs md:text-sm md:border font-medium transition-all flex items-center gap-2 ",
                   isActive
                     ? "bg-accent text-foreground/90 border-border/20"
                     : "text-muted-foreground hover:bg-accent/80 hover:text-foreground hover:shadow-sm border-transparent"
                 )}
               >
                 {React.cloneElement(plugin.icon, { className: "size-4 hidden md:inline" } as any)}
                 <span>{plugin.label}</span>
               </button>
             )})}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto min-h-0 bg-background relative">
        {Object.values(PLUGINS).map((plugin) => {
          const isActive = activePluginId === plugin.id;
          const PluginComponent = plugin.component;

          return (
            <div
              key={plugin.id}
              className={cn("h-full w-full", isActive ? "block" : "hidden")}
            >
              <PluginComponent data={pluginData||{}} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SupplementalContentPanel;
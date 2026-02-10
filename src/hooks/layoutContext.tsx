import React, { createContext, useContext, useEffect, useRef, useMemo, useState } from "react";
import { type PluginId } from "@/lib/pluginRegistry";
interface LayoutContextValue{
  isSupplementalContentPanelOpen: boolean;
  activePluginId: PluginId;
  mobileTab: "chat" | "tools";
  pluginData: any;
  setMobileTab: (tab: "chat" | "tools") => void;
  openPanel: (pluginId: PluginId, data?: any) => void;
  closePanel: () => void;
  togglePanel: () => void;
}

const LayoutContext = createContext<LayoutContextValue | null>(null);
export const LayoutProvider = ({ children }: { children: React.ReactNode }) => {
    const [isSupplementalContentPanelOpen, setIsSupplementalContentPanelOpen] = useState(false);
    const [activePluginId, setActivePluginId] = useState<PluginId>("manual-viewer");
    const [pluginData, setPluginData] = useState<any>(null);
    const [mobileTab, setMobileTab] = useState<"chat" | "tools">("chat");
    // Open the panel with a specific plugin and optional data
    const openPanel = (pluginId: PluginId, data?: any) => {
        setIsSupplementalContentPanelOpen(true);
        setActivePluginId(pluginId);
        setPluginData(data);
        setMobileTab("tools");
    };
    const closePanel = () => setIsSupplementalContentPanelOpen(false);
    const togglePanel = () => setIsSupplementalContentPanelOpen(prev => !prev);
    const layoutContextValue: LayoutContextValue = {
        isSupplementalContentPanelOpen,
        activePluginId,
        pluginData,
        mobileTab,
        openPanel,
        closePanel,
        togglePanel,
        setMobileTab
    };
    
    return (
        <LayoutContext.Provider value={layoutContextValue}>
            {children}
        </LayoutContext.Provider>
    );
};

export const useLayoutContext = () => {
    const context = useContext(LayoutContext);
    if (!context) throw new Error("useLayoutContext must be used within <LayoutProvider />");
    return context;
};

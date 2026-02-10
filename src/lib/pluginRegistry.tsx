import {BookOpen, Bug, SearchCode} from "lucide-react";
import ManualViewer from "@/features/manual-viewer/manualViewer";
import Debugger from "@/features/debugger/debugger";


export interface PluginDefinition {
    id: string;
    label: string;
    icon: React.ReactElement;
    component: React.ComponentType<any>;
}

export const PLUGINS = {
  'manual-viewer': {
    id: 'manual-viewer',
    label: 'Manual Viewer',
    icon: <BookOpen />,
    component: ManualViewer
  },
  'debugger': {
    id: 'debugger',
    label: 'Debug',
    icon: <SearchCode />,
    component: Debugger
  }
};

export type PluginId = keyof typeof PLUGINS;
export const getPlugin = (id: PluginId) => PLUGINS[id];
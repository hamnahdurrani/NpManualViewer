# Project Architecture

This project follows a modified **Bulletproof React** architecture, adapted for better scalability and maintainability.

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Naming Conventions](#-naming-conventions)
- [Architecture Principles](#-architecture-principles)


## 🛠️ Tech Stack

This project is built using modern web technologies focused on performance, modularity, and developer experience.

| Tech | Version | Why? |
| :--- | :--- | :--- |
| **react** | `^19.2.0` | Latest React features (hooks, transition) for building interactive UIs. |
| **vite** | `^7.2.4` | Extremely fast build tool and dev server. Replaces Create React App. |
| **tailwindcss** | `^4.1.17` | Utility-first CSS framework for rapid, consistent styling. |
| **TypeScript** | `~5.9.3` | Static typing for better maintainability and fewer runtime errors. |
| **State Management** | **Context API + Hooks** | Simple, built-in global state management without external bloat (Redux/Zustand) for this complexity level. |

## ⚙️ How it Works

1.  **Entry Point**: `main.tsx` initializes the React app and wraps it in global providers (`ThemeProvider`, `LayoutProvider`).
2.  **Providers**: Contexts provide global state (theme, sidebar visibility, active plugin) to the entire component tree via hooks.
3.  **Layout**: `App.tsx` defines the main layout shell, organizing components into `Sidebar`, `Header`, `ChatArea`, and `SupplementalContentPanel`.
4.  **Routing**: `react-router-dom` handles client-side routing, mapping URLs to page components in `pages/`.
5.  **Feature Modules**: Each feature (e.g., `chat`, `manual-viewer`) is self-contained with its own logic and UI, plugged into the main layout as needed.

## 📁 Project Structure

```
src/
├── components/           # Shared & Global Components
│   ├── ui/               # Generic UI library (e.g., logo.tsx)
│   ├── layout/           # App-wide layout components (sidebar.tsx, chatHeader.tsx)
├── features/             # Feature-based modules
│   ├── chat/             # Chat feature
│   │   ├── components/   # Feature-specific components
│   │   └── chat.tsx      # Main feature entry point
│   ├── manual-viewer/    # Manual Viewer feature
│   └── debugger/         # Debugger feature
├── pages/                # Page / Route Components
│   └── chat.tsx          # Chat Page (Route Wrapper)
├── hooks/                # React Custom Hooks
│   ├── layoutContext.tsx
│   └── themeContext.tsx
├── lib/                  # External library configurations & utilities
│   ├── utils.ts
│   └── pluginRegistry.tsx
├── types/                # Shared TypeScript types
│   └── index.ts
├── App.tsx               # Root Component
├── index.css             # Global theme definitions
└── main.tsx              # Entry Point
└── api/                  # API Client for NPJWI
```

## 📝 Naming Conventions

### Files and Directories
- **Directories**: `kebab-case` (e.g., `features/manual-viewer/`)
- **Files**: `camelCase` (e.g., `chatHeader.tsx`, `apiClient.ts`)

### Code Elements
- **Components**: `camelCase` (e.g., `ChatHeader`, `UserProfile`)
- **Functions**: `camelCase` (e.g., `getUserById`)
- **Variables**: `camelCase` (e.g., `isLoading`)
- **Constants**: `SCREAMING_SNAKE_CASE` (e.g., `API_BASE_URL`)
- **Types/Interfaces**: `PascalCase` (e.g., `User`, `Message`)

## 🏗️ Architecture Principles

### 1. **Feature-Based Organization**
- Features (e.g., `chat`, `manual-viewer`) are self-contained in `src/features/`.
- Each feature directory contains its own components and main entry point.

### 2. **Separation of Concerns**
- **`pages/`**: Handles routing and page-level layout composition.
- **`features/`**: Contains the core business logic and feature-specific UI.
- **`components/`**: generic, reusable UI components and global layout shells.
- **`hooks/`**: Global state management for the browser client.

### 3. **Clean Imports**
- Use the `@/` alias for all internal imports (e.g., `import X from "@/components/..."`).
- Avoid deep relative imports (`../../..`).

## 📦 Key Components

**Chat Interface**:
The central component for user interaction. It manages the message history and provides a familiar chat UI where users can query the assistant. It simulates agent responses and handles complex interactions like citation clicking, which triggers the Supplemental Content Panel to display relevant sources.

**Manual Viewer**:
This dual-purpose tool allows users to explore the documentation. In **Browser Mode**, it parses the Table of Contents (`/toc.json`) to provide full manual navigation. In **Reference Mode**, it acts as a focused reader, displaying specific content references passed from the chat citations, ensuring users see exactly the source material used by the assistant.

**Supplemental Content Panel**:
The dynamic right-hand sidebar that houses all auxiliary tools. It acts as a flexible container for plugins (like the Manual Viewer and Debugger). Managed by the `LayoutContext`, it automatically generates navigation tabs based on the `PluginRegistry`, allowing the interface to scale as more tools are added without cluttering the main view.

## 🧩 Plugin Architecture

The application uses a flexible plugin system to manage the **Supplemental Content Panel** (the right-hand sidebar). This allows features like the Manual Viewer, Debugger, and others to be easily added and managed.

### 1. Plugin Registry (`src/lib/pluginRegistry.tsx`)

The core of the system is the `PluginRegistry`. To add a new tool, you simply add an entry to the `PLUGINS` constant. This automatically:
1.  Registers the plugin ID.
2.  Adds a tab to the `SupplementalContentPanel` navigation.
3.  Maps the ID to the component to render.

**Simplified Example:**

```tsx
// src/lib/pluginRegistry.tsx
import { MyIcon } from "lucide-react";
import MyFeatureComponent from "@/features/my-feature/myFeature";

export const PLUGINS = {
  // ... existing plugins
  'my-feature': {
    id: 'my-feature',
    label: 'My Feature',
    icon: <MyIcon />,
    component: MyFeatureComponent
  }
};

export type PluginId = keyof typeof PLUGINS;
```

### 2. Using Plugins with `useLayoutContext`

The `LayoutContext` manages the state of the panels. You can interact with the plugin system using the `useLayoutContext` hook.

**Opening a Plugin:**

```tsx
import { useLayoutContext } from "@/hooks/layoutContext";

const MyComponent = () => {
    const { openPanel } = useLayoutContext();

    const handleOpenFeature = () => {
        // Opens the panel and switches to the 'my-feature' tab
        openPanel('my-feature'); 
    };
    
    return <button onClick={handleOpenFeature}>Open Feature</button>;
};
```

### 3. Passing Data to Plugins

You can pass data to a plugin when opening it. This data becomes available to the plugin component via props.

**Sender (e.g., Chat Page):**
```tsx
const handleViewDetails = (item) => {
    // Pass 'item' as data to the plugin
    openPanel('manual-viewer', { content: item.content, refs: item.references });
};
```

**Receiver (Plugin Component):**
The plugin component receives the data via the `data` prop.
```tsx
// src/features/manual-viewer/manualViewer.tsx
const ManualViewer = ({ data }: { data: any }) => {
    // data == { content: ..., refs: ... }
    if (!data) return <div>No document selected</div>;
    
    return (
        <div>
            <h1>Viewing: {data.content}</h1>
            {data.refs.map((ref) => (
                <div key={ref.id}>{ref.title}</div>
                <iframe src={ref.url} />
            ))}
        </div>
    );
};
```

### 4. Integration with SupplementalContentPanel

The `SupplementalContentPanel` (`src/components/layout/supplementalContentPanel.tsx`) is the consumer of this system. It:
1.  Subscribes to `LayoutContext` to know if it should be open (`isSupplementalContentPanelOpen`) and which plugin is active (`activePluginId`).
2.  **Automatically generates tabs**: It parses the `PLUGINS` object to render a button/tab for every registered plugin.
3.  **Renders the Component**: It dynamically renders the component associated with the `activePluginId` and passes the current `pluginData` to it.

```tsx
// Simplified logic in SupplementalContentPanel
const { activePluginId, pluginData } = useLayoutContext();
const activePlugin = PLUGINS[activePluginId];
const ActiveComponent = activePlugin.component;

return (
    <div>
       {/* Tabs generated from PLUGINS keys */}
       {Object.values(PLUGINS).map(p => <Tab key={p.id} icon={p.icon} ... />)}
       
       {/* Dynamic Component Rendering */}
       <ActiveComponent data={pluginData} />
    </div>
);
```

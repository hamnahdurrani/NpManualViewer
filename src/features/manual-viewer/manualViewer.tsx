import React, { useEffect, useMemo, useState } from "react";
import { ChevronRight, FileText, FolderOpen } from "lucide-react";

import { xmlToHtml } from "./utilities/xmlToHtml.tsx";
import SourcePanel from "./components/sourcePanel.tsx";
import { useNPClient } from "@/hooks/NPClientContext";

// ---------- Types ----------

type Subgroup = {
  sourceID: string;
  subGroups: Subgroup[];
};

type SubSection = {
  title: string;
  sourceID: string;
  subSections: SubSection[];
  subGroups: Subgroup[];
};

type Section = {
  sourceID: string;
  title: string;
  subSections: SubSection[];
};

type Chapter = {
  title: string;
  number: string;
  sections: Section[];
};

type ManualData = {
  company: string;
  model: string;
  year: string;
  chapters: Chapter[];
  imageBaseURL?: string;
};

type KnowledgeBase = {
  manuals: ManualData[];
};

type NavKind = "root" | "manual" | "chapter" | "section" | "subsection" | "subgroup";

type NavNode = {
  kind: NavKind;
  guid: string;
  title: string;
  manualIndex?: number;
  sourceID?: string;
  children?: NavNode[];
};

type ManualMetadata = {
  url: string;
  checksum: string;
};

type CachedManual = {
  checksum: string;
  xmlText: string;
  parsedKB: ManualData;
  xmlDoc: Document;
  imageBaseURL?: string;
};

// ---------- LRU Cache Implementation ----------
class LRUCache<K, V> {
  private capacity: number;
  private cache: Map<K, V>;
  private accessOrder: K[];

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
    this.accessOrder = [];
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      return undefined;
    }

    this.accessOrder = this.accessOrder.filter((k) => k !== key);
    this.accessOrder.push(key);

    return this.cache.get(key);
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.accessOrder = this.accessOrder.filter((k) => k !== key);
    }

    if (this.cache.size >= this.capacity && !this.cache.has(key)) {
      const lruKey = this.accessOrder.shift();
      if (lruKey !== undefined) {
        this.cache.delete(lruKey);
        console.log(`[LRU Cache] Evicted least recently used item: ${lruKey}`);
      }
    }

    this.cache.set(key, value);
    this.accessOrder.push(key);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
  }

  size(): number {
    return this.cache.size;
  }

  getStats(): { size: number; capacity: number; items: K[] } {
    return {
      size: this.cache.size,
      capacity: this.capacity,
      items: [...this.accessOrder],
    };
  }
}

// ---------- Parser: XML -> KnowledgeBase ----------
export const parseSingleManualXml = (xmlText: string): ManualData => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "application/xml");

  if (doc.getElementsByTagName("parsererror").length > 0) {
    throw new Error("Invalid XML Format");
  }

  const root = doc.documentElement;
  const manualEl = root.tagName.toLowerCase() === "manual" ? root : null;

  if (!manualEl) {
    throw new Error("Root element must be <manual>");
  }

  // Helper to find direct children
  const directChildren = (parent: Element, tag: string) =>
    Array.from(parent.children).filter((c) => c.tagName.toLowerCase() === tag.toLowerCase());

  // Recursive subgroup parsing
  const parseSubGroup = (sgEl: Element): Subgroup => {
    const sourceID = sgEl.getAttribute("sourceID") ?? crypto.randomUUID();
    const nestedGroupEls = directChildren(sgEl, "sub-grouping");
    const subGroups = nestedGroupEls.map(parseSubGroup);
    return { sourceID, subGroups };
  };

  // Recursive subsection parsing
  const parseSubSection = (subSectionEl: Element): SubSection => {
    const sourceID = subSectionEl.getAttribute("sourceID") ?? crypto.randomUUID();
    const title =
      subSectionEl.getElementsByTagName("sub-section-title")[0]?.textContent?.trim() ?? "Subsection";

    const nestedSubSectionEls = directChildren(subSectionEl, "sub-section");
    const subSections: SubSection[] = nestedSubSectionEls.map(parseSubSection);

    const subGroupEls = directChildren(subSectionEl, "sub-grouping");
    const subGroups: Subgroup[] = subGroupEls.map(parseSubGroup);

    return { title, sourceID, subSections, subGroups };
  };

  const company = manualEl.getElementsByTagName("company")[0]?.textContent?.trim() ?? "";
  const model = manualEl.getElementsByTagName("model")[0]?.textContent?.trim() ?? "";
  const year = manualEl.getElementsByTagName("year")[0]?.textContent?.trim() ?? "";
  const imageBaseURL = manualEl.getAttribute("imageBaseURL") ?? undefined;

  const chapterEls = Array.from(manualEl.getElementsByTagName("chapter")).filter(
    (c) => c.parentElement === manualEl
  );

  const chapters: Chapter[] = chapterEls.map((chapterEl) => {
    const number = chapterEl.getElementsByTagName("chapter-number")[0]?.textContent?.trim() ?? "";
    const title = chapterEl.getElementsByTagName("chapter-title")[0]?.textContent?.trim() ?? "";

    const sectionEls = Array.from(chapterEl.getElementsByTagName("section")).filter(
      (s) => s.parentElement === chapterEl
    );

    const sections: Section[] = sectionEls.map((sectionEl) => {
      const sourceID = sectionEl.getAttribute("sourceID") ?? crypto.randomUUID();
      const title = sectionEl.getElementsByTagName("section-title")[0]?.textContent?.trim() ?? "";

      const subSectionEls = Array.from(sectionEl.getElementsByTagName("sub-section")).filter(
        (ss) => ss.parentElement === sectionEl
      );

      const subSections: SubSection[] = subSectionEls.map(parseSubSection);

      return { sourceID, title, subSections };
    });

    return { number, title, sections };
  });

  return { company, model, year, chapters, imageBaseURL };
};

// ---------- KnowledgeBase -> Navigation Tree ----------
const convertKBToNav = (kb: KnowledgeBase): NavNode[] => {
  const subGroupToNav = (sg: Subgroup, manualIndex: number, parentGuid: string): NavNode => {
    const sgGuid = `${parentGuid}-${sg.sourceID}`;

    const children = sg.subGroups.map((child) => subGroupToNav(child, manualIndex, sgGuid));

    const node: NavNode = {
      kind: "subgroup" as NavKind,
      guid: sgGuid,
      title: "Subgroup",
      manualIndex,
      sourceID: sg.sourceID,
    };

    if (children.length > 0) node.children = children;
    return node;
  };

  const subSectionToNav = (ss: SubSection, manualIndex: number, parentGuid: string): NavNode => {
    const ssGuid = `${parentGuid}-${ss.sourceID}`;
    // Merges children from two sources
    const children: NavNode[] = [
      ...ss.subSections.map((child) => subSectionToNav(child, manualIndex, ssGuid)),
      ...ss.subGroups.map((sg) => subGroupToNav(sg, manualIndex, ssGuid)),
    ];

    const baseNode: NavNode = {
      kind: "subsection",
      guid: ssGuid,
      title: ss.title,
      sourceID: ss.sourceID,
      manualIndex,
    };

    if (children.length > 0) {
      baseNode.children = children;
    }

    return baseNode;
  };

  const navNodes: NavNode[] = kb.manuals.map((manual, manualIndex) => {
    const manualTitle =
      `${manual.company} ${manual.model} (${manual.year})`.trim() || `Manual ${manualIndex + 1}`;

    return {
      kind: "manual" as NavKind,
      guid: `manual-${manualIndex}`,
      title: manualTitle,
      manualIndex,
      children: manual.chapters.map((chapter) => ({
        kind: "chapter" as NavKind,
        guid: `manual-${manualIndex}-chapter-${chapter.number}`,
        title: `${chapter.number}. ${chapter.title}`,
        manualIndex,
        children: chapter.sections.map((section) => {
          const sectionGuid = `manual-${manualIndex}-chapter-${chapter.number}-${section.sourceID}`;

          return {
            kind: "section" as NavKind,
            guid: sectionGuid,
            title: section.title,
            sourceID: section.sourceID,
            manualIndex,
            children: section.subSections.map((ss) => subSectionToNav(ss, manualIndex, sectionGuid)),
          };
        }),
      })),
    };
  });

  return navNodes;
};

// ---------- XML Element Finder ----------
const findXMLElementBySourceID = (xmlDocs: (Document | null)[], sourceID: string): { element: Element | null; manualIndex: number } => {
  for (let manualIndex = 0; manualIndex < xmlDocs.length; manualIndex++) {
    const xmlDoc = xmlDocs[manualIndex];
    if (!xmlDoc) continue;
    const elements = xmlDoc.querySelectorAll(`[sourceID="${sourceID}"]`);
    if (elements.length > 0) return { element: elements[0], manualIndex };
  }
  return { element: null, manualIndex: -1 };
};

const HTML_CACHE_SIZE = 50;

// This function fetches a manual from a URL and validates it against the checksum
const fetchAndValidateManual = async (
  url: string,
  checksum: string,
  manualCache: Map<string, CachedManual>
): Promise<CachedManual> => {
  // Check if we have a cached version with matching checksum
  const cached = manualCache.get(url);
  if (cached && cached.checksum === checksum) {
    console.log(`[Manual Cache HIT] Using cached manual from ${url} (checksum: ${checksum})`);
    return cached;
  }

  console.log(`[Manual Cache MISS] Fetching manual from ${url}`);
  // Fetch the manual XML
  const response = await fetch((window as any)?.env_config?.BUILD_ENV === "development"? 
    url.replace("https://inago-assets.s3.us-west-1.amazonaws.com", "/manual-data"): url
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch manual from ${url}: ${response.statusText}`);
  }

  const xmlText = await response.text();

  // Parse the XML into a Document for element lookups
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "application/xml");

  if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
    throw new Error(`Invalid XML from ${url}`);
  }

  // Parse the manual data structure
  const parsedKB = parseSingleManualXml(xmlText);

  const cachedManual: CachedManual = {
    checksum,
    xmlText,
    parsedKB,
    xmlDoc,
    imageBaseURL: parsedKB.imageBaseURL,
  };

  // Update cache
  manualCache.set(url, cachedManual);
  console.log(`[Manual Cache] Stored manual from ${url} (checksum: ${checksum})`);

  return cachedManual;
};

// ---------- Plugin Props ----------
type ManualViewerPluginProps = {
  data?: {
    sourceIDs?: string[];
    openSourcePanel?: boolean;
    timestamp?: number;
  };
};

// ---------- Main Component ----------
function ContentBrowserWeb({ data = {}}: ManualViewerPluginProps) {
  //deconstruct data prop
  const {sourceIDs, openSourcePanel, timestamp} = data;
  // Loaded Manuals
  const [kb, setKb] = useState<KnowledgeBase | null>(null);
  // Derived Navigation Tree
  const [nav, setNav] = useState<NavNode[] | null>(null);
  // Stores DOM Documents for each manual
  const [xmlDocs, setXmlDocs] = useState<(Document | null)[]>([]);
  // Stores imageBaseURLs (indexed by manualIndex)
  const [imageBaseURLs, setImageBaseURLs] = useState<string[]>([]);

  const [error, setError] = useState<string | null>(null);
  // Whether manuals have been fully loaded
  const [ready, setReady] = useState(false);

  // Breadcrumb Path
  const [selectedPath, setSelectedPath] = useState<NavNode[]>([
    { kind: "root", title: "Manuals", guid: "root" },
  ]);
  // Which leaf is active
  const [selectedLeafHtml, setSelectedLeafHtml] = useState<string | null>(null);
  const [selectedLeafTitle, setSelectedLeafTitle] = useState<string>("");
  const [selectedManualIndex, setSelectedManualIndex] = useState<number | null>(null);

  // Source Panel state
  const [showSourcePanel, setShowSourcePanel] = useState(false);
  const [sourcePanelSourceIDs, setSourcePanelSourceIDs] = useState<string[]>([]);


  // automatically open SourcePanel if chat.tsx passes sourceIDs prop  
  useEffect(() => {
    console.log("[ManualViewer] sourceIDs:", sourceIDs);
    console.log("[ManualViewer] openSourcePanel:", openSourcePanel);
    console.log("[ManualViewer] timestamp:", timestamp);
    
    if (!sourceIDs?.length) return;
    // Only open if openSourcePanel is true
    if (!openSourcePanel) return;
    
    // Reset to root view before opening source panel
    setSelectedPath([{ kind: "root", title: "Manuals", guid: "root" }]);
    setSelectedLeafHtml(null);
    setSelectedLeafTitle("");
    setSelectedManualIndex(null);
    
    // Set sourceIDs and open panel
    setSourcePanelSourceIDs(sourceIDs);
    setShowSourcePanel(true);
  }, [sourceIDs, openSourcePanel, timestamp]); 

  // Cached by sourceID
  const htmlCache = useMemo(() => new LRUCache<string, string>(HTML_CACHE_SIZE), []);
  // The cache is keyed by URL and stores the checksum for version validation
  const manualCache = useMemo(() => new Map<string, CachedManual>(), []);

  // Get manual metadata from the NPClient hook
  const npClient = useNPClient();
  const manualData: ManualMetadata[] = npClient.manualData;

  useEffect(() => {
    // Reset state when manualData changes
    if (!manualData || manualData.length === 0) {
      console.log("No manual data available");
      setReady(false);
      return;
    }

    const load = async () => {
      try {
        console.log(`Loading ${manualData.length} manuals...`);

        // Fetch all manuals in parallel with checksum validation
        const fetchPromises = manualData.map(({ url, checksum }) =>
          fetchAndValidateManual(url, checksum, manualCache)
        );

        const cachedManuals = await Promise.all(fetchPromises);

        // Extract parsed manual data and XML documents
        const parsedManuals = cachedManuals.map((cm) => cm.parsedKB);
        const xmlDocuments = cachedManuals.map((cm) => cm.xmlDoc);

        // Combine all manuals into a single knowledge base
        const combinedKB: KnowledgeBase = {
          manuals: parsedManuals,
        };

        console.log("Building navigation tree...");
        const navTree = convertKBToNav(combinedKB);

        setKb(combinedKB);
        setNav(navTree);
        setXmlDocs(xmlDocuments);

        // Array of imageBaseURLs indexed by manualIndex
        const imageURLs = cachedManuals.map((cm) => cm.imageBaseURL || "/assets/manual");
        setImageBaseURLs(imageURLs);
        console.log(`Stored ${imageURLs.length} imageBaseURLs`);

        setReady(true);

        console.log("Manuals Loading complete");
      } catch (e: any) {
        console.error("Error: Loading Manual", e);
        setError(e.message ?? "Error loading manuals");
        setReady(false);
      }
    };

    load();
  }, [manualData, manualCache]);

  // ---------- Breadcrumb Toolbar ----------
  // Trims breadcrumb path to clicked level
  const handleBackUpLevel = (index: number) => {
    if (index < selectedPath.length - 1) {
      const newPath = selectedPath.slice(0, index + 1);
      setSelectedPath(newPath);

      const last = newPath[newPath.length - 1];
      if (last.kind === "root") {
        setSelectedManualIndex(null);
      } else if (
        last.kind === "manual" ||
        last.kind === "chapter" ||
        last.kind === "section" ||
        last.kind === "subsection" ||
        last.kind === "subgroup"
      ) {
        setSelectedManualIndex(last.manualIndex ?? null);
      }

      setSelectedLeafHtml(null);
      setSelectedLeafTitle("");
    }
  };

  // Extracts children according to breadcrumb
  const getCurrentLevelNodes = (): NavNode[] => {
    if (!nav) return [];
    let level: NavNode[] = nav;

    for (let i = 1; i < selectedPath.length; i++) {
      const targetGuid = selectedPath[i].guid;
      const node = level.find((n) => n.guid === targetGuid);
      if (!node) break;
      level = node.children ?? [];
    }
    return level;
  };

  const renderHtmlForLeafNode = (sourceID: string, xmlDocs: (Document | null)[]): string | null => {
    const cached = htmlCache.get(sourceID);
    if (cached !== undefined) {
      console.log(`Retrieved HTML for sourceID: ${sourceID}`);
      const stats = htmlCache.getStats();
      console.log(`Size: ${stats.size}/${stats.capacity}`);
      return cached;
    }

    console.log(`Rendering HTML for sourceID: ${sourceID}`);
    const { element, manualIndex} = findXMLElementBySourceID(xmlDocs, sourceID);

    if (!element) {
      console.warn(`Element not found for sourceID: ${sourceID}`);
      return null;
    }

    const imageBaseURL = imageBaseURLs[manualIndex] || "/assets/manual";
    console.log(`Using imageBaseURL: ${imageBaseURL} for manual ${manualIndex}, sourceID: ${sourceID}`);

    const html = xmlToHtml(element, imageBaseURL);

    htmlCache.set(sourceID, html);
    const stats = htmlCache.getStats();
    console.log(`Stored HTML for sourceID: ${sourceID}`);
    console.log(`Size: ${stats.size}/${stats.capacity}`);

    return html;
  };

  const handleNodeClick = (node: NavNode) => {
    const isLeaf = !node.children || node.children.length === 0;

    if (isLeaf && node.sourceID && node.manualIndex !== undefined && xmlDocs.length > 0) {
      const html = renderHtmlForLeafNode(node.sourceID, xmlDocs);

      if (html) {
        setSelectedLeafHtml(html);
        setSelectedLeafTitle(node.title);
        setSelectedManualIndex(node.manualIndex ?? null);
        setSelectedPath((prev) => [...prev, { ...node, children: undefined }]);
        return;
      }
    }

    setSelectedManualIndex(node.manualIndex ?? null);
    setSelectedLeafHtml(null);
    setSelectedLeafTitle("");
    setSelectedPath((prev) => [...prev, { ...node, children: undefined }]);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        <div>Error: {error}</div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="animate-pulse">Loading manuals...</div>
      </div>
    );
  }

  // ---------- View: Content (Leaf Node) ----------
  if (selectedLeafHtml) {
    return (
      <div className="relative h-full w-full flex flex-col bg-background overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-background shrink-0">
          <div className="flex items-center flex-wrap gap-1 text-sm">
            {selectedPath.map((item, index) => (
              <React.Fragment key={item.guid}>
                {index > 0 && <span className="text-muted-foreground px-1">/</span>}
                <button
                  onClick={() => handleBackUpLevel(index)}
                  className={
                    index === selectedPath.length - 1
                      ? "text-foreground font-medium pointer-events-none"
                      : "text-muted-foreground hover:text-foreground transition-colors"
                  }
                >
                  {item.title}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="flex-1 w-full overflow-y-auto bg-background px-8 py-6">
            <h1 className="text-3xl font-bold mb-6" style={{ color: "var(--foreground)" }}>
              {selectedLeafTitle}
            </h1>
          <div className="manual-viewer mb-6" dangerouslySetInnerHTML={{ __html: selectedLeafHtml }} />
        </div>
      </div>
    );
  }

  // ---------- View: Navigation List ----------
  return (
    <div className="relative h-full w-full flex flex-col bg-background overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-background shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-wrap gap-1 text-sm">
            {selectedPath.map((item, index) => (
              <React.Fragment key={item.guid}>
                {index > 0 && <span className="text-muted-foreground px-1">/</span>}
                <button
                  onClick={() => handleBackUpLevel(index)}
                  className={
                    index === selectedPath.length - 1
                      ? "text-foreground font-medium pointer-events-none"
                      : "text-muted-foreground hover:text-foreground transition-colors"
                  }
                >
                  {item.title}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="divide-y divide-border">
          {getCurrentLevelNodes().map((item) => {
            const isLeaf = !item.children || item.children.length === 0;

            return (
              <button
                key={item.guid}
                onClick={() => handleNodeClick(item)}
                className="w-full text-left px-4 py-4 text-sm hover:bg-accent flex items-center gap-3 group transition-colors"
              >
                {isLeaf ? (
                  <FileText className="w-5 h-5 text-foreground shrink-0" strokeWidth={1.5} />
                ) : (
                  <FolderOpen className="w-5 h-5 text-foreground shrink-0" strokeWidth={1.5} />
                )}

                <div className="flex-1 truncate">
                  <span className="text-foreground">{item.title}</span>
                </div>

                {!isLeaf && (
                  <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Source Panel Overlay */}
      {showSourcePanel && (
        <div className="absolute inset-0 bg-background z-10">
          <SourcePanel
            sourceIDs={sourcePanelSourceIDs}
            xmlDocs={xmlDocs}
            renderHtmlForSourceID={renderHtmlForLeafNode}
            findXMLElementBySourceID={findXMLElementBySourceID}
            onClose={() => {
              console.log("[ManualViewer] onClose called, closing SourcePanel");
              setShowSourcePanel(false);
            }}
          />
        </div>
      )}
    </div>
  );
}

export { convertKBToNav };
export default ContentBrowserWeb;
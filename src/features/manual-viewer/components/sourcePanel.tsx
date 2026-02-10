import { useEffect, useState } from "react";
import { Link as LinkIcon, ChevronRight, ChevronLeft } from "lucide-react";

interface SourcePanelProps {
  sourceIDs?: string[];
  xmlDocs?: (Document | null)[];
  onClose?: () => void;
  renderHtmlForSourceID?: (sourceID: string, xmlDocs: (Document | null)[]) => string | null;
  findXMLElementBySourceID?: (xmlDocs: (Document | null)[], sourceID: string) => { element: Element | null; manualIndex: number };
}

const isLeafSourceID = (sourceID: string): boolean => {
  const s = (sourceID ?? "").toLowerCase();
  return s.includes("sub-section") || s.includes("sub-group") || s.includes("sub-grouping");
};

const SourcePanel = ({
  sourceIDs = [],
  xmlDocs = [],
  onClose,
  renderHtmlForSourceID,
  findXMLElementBySourceID,
}: SourcePanelProps) => {
  const [activeSourceID, setActiveSourceID] = useState<string | null>(null);
  const [activeSourceHtml, setActiveSourceHtml] = useState<string | null>(null);
  const [activeSourceTitle, setActiveSourceTitle] = useState<string>("");
  const filteredSourceIDs: string[] = [];
  const seen = new Set<string>();

  for (const id of sourceIDs) {
    if (!id) continue;
    if (!isLeafSourceID(id)) continue;
    if (seen.has(id)) continue;
    seen.add(id);
    filteredSourceIDs.push(id);
  }

  useEffect(() => {
    setActiveSourceID(null);
    setActiveSourceHtml(null);
    setActiveSourceTitle("");
  }, [sourceIDs]);

  const getTitleForSourceID = (sourceID: string): string => {
    if (xmlDocs.length === 0) return sourceID;
    if (!findXMLElementBySourceID) return sourceID;
    const result = findXMLElementBySourceID(xmlDocs, sourceID);
    if (!result.element) return sourceID;
    const titleElement = result.element.querySelector("sub-section-title");
    return titleElement?.textContent?.trim() || sourceID;
  };

  const renderHtmlFor = (sourceID: string): string | null => {
    if (!renderHtmlForSourceID) return null;
    return renderHtmlForSourceID(sourceID, xmlDocs);
  };

  const handleSourceClick = (sourceID: string) => {
    if (!isLeafSourceID(sourceID)) return;

    const html = renderHtmlFor(sourceID);
    if (!html) return;

    setActiveSourceID(sourceID);
    setActiveSourceHtml(html);
    setActiveSourceTitle(getTitleForSourceID(sourceID));
  };

  const handleBackToList = () => {
    setActiveSourceID(null);
    setActiveSourceHtml(null);
    setActiveSourceTitle("");
  };

  // Document view
  if (activeSourceID && activeSourceHtml) {
    return (
      <div className="flex flex-col h-full animate-in fade-in duration-300">
        <div className="px-4 py-3 border-b border-border bg-background shrink-0">
          <button
            onClick={handleBackToList}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Sources
          </button>
        </div>

        <div className="flex-1 w-full overflow-y-auto bg-background px-8 py-6">
            <h1 className="text-3xl font-bold mb-6" style={{ color: "var(--foreground)" }}>{activeSourceTitle}</h1>
          <div
            className="manual-viewer mb-6"
            dangerouslySetInnerHTML={{ __html: activeSourceHtml }}
          />
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border bg-background shrink-0">
        <button
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose?.();
          }}
        >
          <ChevronLeft className="w-4 h-4 shrink-0" />
          Back to Manual Viewer
        </button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="divide-y divide-border">
          {filteredSourceIDs.length > 0 ? (
            filteredSourceIDs.map((sourceID) => (
              <button
                key={sourceID}
                onClick={() => handleSourceClick(sourceID)}
                className="w-full text-left px-4 py-4 text-sm hover:bg-accent flex items-center gap-3 group transition-colors"
              >
                <LinkIcon className="w-5 h-5 text-muted-foreground shrink-0" absoluteStrokeWidth />
                <div className="flex-1 min-w-0">
                  <div className="text-foreground truncate">{getTitleForSourceID(sourceID)}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors shrink-0" />
              </button>
            ))
          ) : (
            <div className="text-sm text-muted-foreground text-center py-8">
              No references found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SourcePanel;

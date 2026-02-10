import type { MessageContentProps, InfoItemListProps, ClarifyingHintsProps, MessageActionsProps, MessageProps } from "@/features/chat/types/message";
import {
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Link as LinkIcon,
  RefreshCcw,
  ArrowRight,
  Check,
  X,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { toast } from "sonner";
import MessageSeparator from "./MessageSeparator";
import HintSparkle from "@/components/ui/icons/HintSparkle";

const MessageContent = ({ content, isError, role }: MessageContentProps) => {
  return (
    <div
      className={`text-md leading-relaxed rich-response ${
        role === "user" ? "text-primary-foreground" : "text-foreground"
      }`}
    >
      <div className={cn(isError && "flex items-start gap-2 text-destructive")}>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  );
};

const SuggestedQuestions = ({
  questions,
  onShowMore,
  onRejectAll,
  onQuestionClick,
  selectedItem,
  total,
  isInteractionDisabled,
}: InfoItemListProps) => {
  if (!questions || questions.length === 0) return null;

  // Render logic
  return (
    <div className="mt-2 space-y-2">
      <div className="flex flex-col gap-2">
        {questions.map((q, idx) => {
           // Handle both string and infoItem object
           const title = typeof q === "string" ? q : q.titleVisual;
           const isSelected = q.uid === selectedItem?.uid;
           return (
            <button
              key={idx}
              className={cn( isSelected ||  !isInteractionDisabled
                ? "actionable-option"
                : "inactive-actionable-option",
              isSelected ? "bg-accent text-foreground" : "hover:bg-accent",
              !!isInteractionDisabled && "pointer-events-none")}
              onClick={() => !isInteractionDisabled && onQuestionClick?.(q)}
              disabled={isInteractionDisabled}
            >
              {isSelected ? (
              <Check className="size-4 inline shrink-0" />
            ) : (
              <ArrowRight className="size-4 inline shrink-0" />
            )}
              <span>{title}</span>
            </button>
          )
        })}
      </div>

      {(total && questions.length < total) && (
        <button
          onClick={onShowMore}
          className={cn("actionable-option hover:bg-accent hover:text-foreground", isInteractionDisabled && "opacity-50 pointer-events-none cursor-not-allowed")}
          disabled={isInteractionDisabled}
        >
          <ChevronDown className="size-4 inline shrink-0" />
          <span>Show More</span>
        </button>
      )}
      { (total && questions.length === total) &&
        <button
          className={cn("actionable-option hover:bg-accent hover:text-foreground", isInteractionDisabled && "opacity-50 pointer-events-none cursor-not-allowed")}
          onClick={() => !isInteractionDisabled && onRejectAll()}
          disabled={isInteractionDisabled}
        >
          {selectedItem?.uid === "none_of_the_above" ? (
            <Check className="size-4 inline shrink-0" />
          ) : (
            <X className="size-4 inline shrink-0" />
          )}
          <span>None of the above</span>
        </button>  
      }
    </div>
  );
};

const ClarifyingHints = ({
  hints,
  selectedHint,
  isActionSelected,
  onHintClick,
  isInteractionDisabled,
}: ClarifyingHintsProps) => {
  if (!hints || hints.length === 0) return null;

  return (
    <div className="mt-1 flex flex-wrap gap-2 px-3">
      {hints.map((hint, idx) => {
        const isSelected = selectedHint?.id === hint.id;
        return (
          <button
            key={idx}
            className={cn(
              isSelected ||  !isInteractionDisabled
                ? "actionable-option"
                : "inactive-actionable-option",
              isSelected ? "bg-accent text-foreground" : "hover:bg-accent",
              !!isInteractionDisabled && "pointer-events-none"
            )}
            onClick={() => {
              if (!isSelected && !isInteractionDisabled) {
                onHintClick?.(hint);
              }
            }}
            disabled={!!isInteractionDisabled}
          >
            {isSelected ? (
              <Check className="size-4 inline shrink-0" />
            ) : (
              <HintSparkle className="size-4 inline shrink-0" />
            )}
            <span>{hint.label}</span>
          </button>
        );
      })}
    </div>
  );
};



const MessageActions = ({
  content,
  isAgent,
  isError,
  references,
  onViewSources,
  onRetry,
  onThumbsUp,
  onThumbsDown,
  isActionableMessage,
}: MessageActionsProps) => {
  const [_, copyToClipboard] = useCopyToClipboard();
  const handleCopy = async () => {
    if (!content) {
      toast.error("There's no text to copy!");
      return;
    }
    try {
      await copyToClipboard(content);
      toast.success("Copied to clipboard!");
    } catch (error) {
      console.error('Copy failed:', error);
      toast.error("Failed to copy");
    }
  };
  if (isError) {
    return (
      <div>
        <button
          onClick={onRetry}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mt-1 font-medium transition-colors ml-2.5 p-1.5 rounded-lg"
        >
          <RefreshCcw className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (isAgent) {
    return (
      <div className="flex items-center justify-start gap-2 ml-2.5 max-w-[90%] mt-1">
        <div className="flex items-center gap-1">
          <button
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            aria-label="Copy message"
            onClick={handleCopy}
          >
            <Copy className="w-4 h-4" />
          </button>
          {isActionableMessage && <button
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            aria-label="Thumbs up"
            onClick={onThumbsUp}
          >
            <ThumbsUp className="w-4 h-4"  />
          </button>}
          {isActionableMessage && <button
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            aria-label="Thumbs down"
            onClick={onThumbsDown}
          >
            <ThumbsDown className="w-4 h-4" />
          </button>}
        </div>
        {/* View Sources Pill */}
        {references && references.length > 0 ? (
          <button
            onClick={() => onViewSources?.(references)}
            className="flex items-center gap-2 py-1.5 px-3 border border-border bg-background hover:bg-accent transition-colors group"
          >
            <LinkIcon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              sources
            </span>
          </button>
        ) : (
          <div />
        )}
      </div>
    );
  }

  return null;
};

// --- Main Component ---
const Message = ({
  message,
  onViewSources,
  onHintClick,
  onRetry,
  onQuestionClick,
  onShowMore,
  onRejectAll,
  onThumbsUp,
  onThumbsDown,
  isInteractionDisabled,
  isActionableMessage,
}: MessageProps) => {
  if (message.role === "separator") {
    return (
      <MessageSeparator />
    );
  }

  const handleShowMore = () => {
    if (onShowMore) {
        onShowMore();
    }
  };

  // const isInteractionDisabled = message.isInteractionDisabled;

  const isError = message.isError;
  const isActionSelected = !!message.selected;
  const isAgent = message.role === "agent";
  // console.log("message:", message); 
  let references = [];
     if (message.role === "agent" && message.content !== "" && message.hints?.length === 0 && !message?.qList && message?.sourceIds?.length > 0) {
        references = new Array(3).fill(0).map((_, i) => ({
          label: `Source Reference Item ${i + 1}`,
          path: `/sample${i + 1}.html`,
        }))
      }
      // console.log("references:", references);

  return (
    <div className="flex flex-col gap-1">
      <div
        key={message.id}
        className={cn(
          "flex gap-3 min-w-0",
          message.role === "user" ? "justify-end" : "justify-start"
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 break-words min-w-0",
            message.role === "user"
              ? "bg-primary text-primary-foreground max-w-[80%] py-2.5"
              : "bg-transparent text-destructive max-w-[100%]"
          )}
        >
          <MessageContent
            content={message.content}
            isError={isError}
            role={message.role}
          />

          <SuggestedQuestions
            selectedItem={message.selected}
            questions={message.qList}
            onShowMore={handleShowMore}
            onQuestionClick={onQuestionClick}
            onRejectAll={onRejectAll}
            total={message.infoItemsMeta?.available}
            isInteractionDisabled={isInteractionDisabled}
          />
        </div>
      </div>

      <ClarifyingHints
        hints={message.hints}
        selectedHint={message.selected}
        isActionSelected={isActionSelected}
        onHintClick={onHintClick}
        isInteractionDisabled={isInteractionDisabled}
      />

      <MessageActions
        content={message.content}
        isAgent={isAgent}
        isError={isError}
        references={references}
        onViewSources={onViewSources}
        onRetry={onRetry}
        onThumbsUp={onThumbsUp}
        onThumbsDown={onThumbsDown}
        isActionableMessage={isActionableMessage}
      />
    </div>
  );
};

export default Message;

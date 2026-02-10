import { type UIHint, type InfoItem } from "@/api/utils/NPContentParser";
export interface MessageContentProps {
  content: string;
  isError?: boolean;
  role: "user" | "agent";
}

export interface InfoItemListProps {
  selectedItem?: any;
  questions?: any[]; 
  onShowMore: () => void;
  onQuestionClick?: (question: any) => void;
  onRejectAll: () => void;
  total?: number; // Total count from meta
  isInteractionDisabled?: boolean;
}

export interface ClarifyingHintsProps {
  hints?: any[]; // objects or strings
  selectedHint?: any;
  isActionSelected?: boolean;
  onHintClick?: (hint: any) => void;
  isInteractionDisabled?: boolean;
}

export interface MessageActionsProps {
  content: string;
  isAgent: boolean;
  isError?: boolean;
  references?: { label: string; path: string }[];
  onViewSources?: (refs: { label: string; path: string }[]) => void;
  onRetry?: () => void;
  onThumbsUp?: () => void;
  onThumbsDown?: () => void;
  isActionableMessage?: boolean;
}

export interface MessageProps {
  message: Message;
  onViewSources?: (refs: { label: string; path: string }[]) => void;
  onHintClick?: (hint: any) => void;
  onRetry?: () => void;
  onQuestionClick?: (question: any) => void;
  onShowMore?: () => void;
  onRejectAll?: ()=> void;
  onThumbsUp?: () => void;
  onThumbsDown?: () => void;
  isInteractionDisabled?: boolean;
  isActionableMessage?: boolean;
}

export interface Reference {
  label: string;
  path: string;
}

export interface Message {
  id: string;
  role: "user" | "agent" | "separator";
  type: string;
  sourceIds?: string[];
  content: string;
  timestamp: Date;
  references?: Reference[];
  qList?: InfoItem[];
  hints?: UIHint[];
  isError?: boolean;
  selected?: any;
  infoItemsMeta?: {
    total: number;
    available: number;
    startIndex: number;
  };
}


// export interface UIAgentMessage {
//     id: string;
//     role: "agent";
//     type: string;
//     sourceIds?: string[];
//     voice: string;
//     visual: string; 
//     hints: UIHint[];
//     infoItems?: InfoItem[];
//     infoItemsMeta?: {
//         total: number;
//         available: number;
//         startIndex: number;
//     };
//     isActionableMessage: boolean;
// }

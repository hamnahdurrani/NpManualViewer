import { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import Message from "./components/message";
import InputArea from "./components/inputArea";
import { type Message as MessageType } from "@/features/chat/types/message";
import { useNPClient } from "@/hooks/NPClientContext";
import MessageLoader from "./components/messageLoader";
import LoadingModal from "@/components/LoadingModal";
import ErrorModal from "@/components/ErrorModal";
import { AlertCircle, WifiOff, Wifi, XCircle, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { formatError } from "@/api/constants/NPErrorUIMapping";
import SessionExpiredAction from "./components/SessionExpiredAction";
import {logger, LOG_LEVEL } from "@/api/core/logger";
import LandingChatScreen from "./components/landingChatScreen";
import { useLayoutContext } from "@/hooks/layoutContext";



const Chat = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    client,
    conversationStarted,
    connected,
    connecting,
    messages,
    handleSendText,
    setMessages,
    NPClientHandleSelectHint,
    NPClientHandleSelectItem,
    agentMessageLoading,
    isSessionExpired,
    startSession,
    triggerSessionTimeout,
    isOnline,
    serverError,
    sessionConnectionLoading,
    clearServerError,
    handleThumbsUp,
    handleThumbsDown,
  } = useNPClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wasOfflineRef = useRef(false);
  const { openPanel } = useLayoutContext();
  // Handle offline/online toasts
  useEffect(() => {
    if (!isOnline) {
      wasOfflineRef.current = true;
      toast.error("Network disconnected, trying to reconnect...", {
        icon: <WifiOff className="w-4 h-4" />,
        duration: Infinity, // Stay until dismissed or connection restored
        id: "offline-toast"
      });
    } else {
      // Dismiss offline toast when back online
      toast.dismiss("offline-toast");
      
      // Show connection restored only if we were previously offline
      if (wasOfflineRef.current) {
        toast.success("Connection restored", {
          icon: <Wifi className="w-4 h-4" />,
          duration: 3000,
        });
        wasOfflineRef.current = false;
      }
    }
  }, [isOnline]);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: behavior,
      });
    }
  };

  useEffect(() => {
    scrollToBottom("smooth");
  }, [messages]);

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      scrollToBottom("smooth");
    });

    if (messagesEndRef.current) {
      observer.observe(messagesEndRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleSend = (content: string) => {
    const newUserMsg: MessageType = {
      id: Date.now().toString(),
      role: "user",
      type: "UserInput",
      content: content,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, newUserMsg]);
    handleSendText(content);
    logger.Log(LOG_LEVEL.LOG_Debug, "[NPClientProvider] Text sent: " + content);
  };

  const handleShowMore = () => {
      client.SendGUI("ShowMore", "");
  };

  const handleRejectAll = () => {
    client.SendGUI("RejectAll", "");
  }

  const handleInfoItemSelect = (item: any, messageId: string) => {
    // 1. Send the selected item as a user message
    const newUserMsg: MessageType = {
      id: `select-${Date.now()}`,
      role: "user",
      type: "UserInfoItemSelect",
      content: item.titleVisual || "Selected Item",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newUserMsg]);

    // 2. Call API
    NPClientHandleSelectItem(item.uid);

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, selected: item } : msg
      )
    );
  };

  const handleHintSelect = (
    hint: { label: string; value: string; id: string },
    messageId: string
  ) => {
    // 1. Send the selected hint as a user message
    const newUserMsg: MessageType = {
      id: hint.id,
      role: "user",
      type: "UserHintSelect",
      content: hint.label,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newUserMsg]);
    NPClientHandleSelectHint(hint.value);
    

    // 2. Update the message that initiated this interaction
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, selected: hint } : msg
      )
    );
  };

  return (
    <div className="flex flex-1 w-full h-full relative overflow-hidden ">
      <div className="w-full h-full flex flex-col items-center justify-center relative ">
        {sessionConnectionLoading && ReactDOM.createPortal(
          <LoadingModal />,
          document.body
        )}
        
        {!conversationStarted && (
          <LandingChatScreen />
        )}
        
        <div
          ref={containerRef}
          className="w-full h-full px-4 pb-[180px] overflow-y-scroll"
        >
          <div
            ref={messagesEndRef}
            className="w-full max-w-3xl mx-auto flex flex-col gap-4 mt-4"
          >
            {messages.map((message, index) => <Message
                  key={index}
                  message={message}
                  isInteractionDisabled={index !== messages.length - 1 || agentMessageLoading || isSessionExpired || !isOnline}
                  onViewSources={() => {openPanel("manual-viewer", {sourceIDs: message.sourceIds, openSourcePanel: true, timestamp: Date.now()});
                  }}
                  onHintClick={(hint) => handleHintSelect(hint, message.id)}
                  onShowMore={handleShowMore}
                  onRejectAll={handleRejectAll}
                  onQuestionClick={(item) => handleInfoItemSelect(item, message.id)}
                  onRetry={() =>
                    handleSend(
                      message.role === "user" ? message.content : "retry"
                    )
                  }
                  onThumbsUp={handleThumbsUp}
                  onThumbsDown={handleThumbsDown}
                  isActionableMessage={message.isActionableMessage && index === messages.length - 1}
                />
            )}
            {agentMessageLoading && (
              <MessageLoader/>
            )}
            
            {isSessionExpired && (
              <SessionExpiredAction/>
            )}
          </div>
        </div>

        {/* <button 
            onClick={triggerSessionTimeout}
            className="absolute top-4 right-4 z-50 text-xs px-2 py-1 rounded border "
        >
            Timeout
        </button> */}

        
         {ReactDOM.createPortal(
            <ErrorModal
              open={!!serverError}
              name={formatError(serverError).name}
              description={formatError(serverError).message}
              actionLabel="Reload Page"
              onAction={()=>{clearServerError(); window.location.reload();}}
              variant="system"
          />,
          document.body
        )}
        {/* User Input Area */}
        <div className="absolute bottom-0 left-0 w-full z-20 px-4 pb-6 pt-12 bg-gradient-to-t from-background via-background/60 to-transparent pointer-events-none">
          <div className="pointer-events-auto w-full max-w-3xl mx-auto">
            <InputArea onSend={handleSend} disabled={agentMessageLoading || isSessionExpired || !isOnline} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;

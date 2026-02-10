import { MessageSquare } from "lucide-react";
import { useNPClient } from "@/hooks/NPClientContext"
import { Button } from "@/components/ui/button";

export default function LandingChatScreen() {
 const { startSession, setConversationStarted } = useNPClient();
 return (
    <div className="absolute inset-0 flex items-center justify-center bg-background z-30">
        <div className="h-full flex flex-col items-center justify-center px-5 py-8">
            <div className="max-w-md w-full text-center">
                {/* Logo and Welcome */}
                <div className="mb-5">
                    <h2 className="text-2xl font-semibold text-foreground mb-3 text-balance">
                            Welcome to Your Agent
                    </h2>
                    <p className="text-[15px] text-muted-foreground leading-relaxed text-pretty">
                            Your AI agent ready to help with any manual specific questions. Click below to start a conversation.
                    </p>
                </div>

                {/* Start Conversation Button */}
                <Button
                  onClick={() => {startSession(); setConversationStarted(true);}}
                  variant="start-session"
                  className="gap-2.5"
                >
                    <MessageSquare className="w-5 h-5" />
                    Start Conversation
                </Button>
            </div>
        </div>
    </div>
 )   
}
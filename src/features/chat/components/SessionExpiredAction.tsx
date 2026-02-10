import { useNPClient } from "@/hooks/NPClientContext";
import MessageSeparator from "./MessageSeparator";
import { Button } from "@/components/ui/button";

export default function SessionExpiredAction() {
    const { startSession } = useNPClient();
    return (
        <div className="flex flex-col gap-4 mt-6 mb-6">
            <MessageSeparator />
            <div className="flex justify-center">
                <Button 
                    onClick={startSession}
                    variant="start-session"
                >
                    Start New Conversation
                </Button>
            </div>
        </div>
    )
}
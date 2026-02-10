import { useState, useRef, useEffect } from "react";
import { SendIcon, Mic, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface InputAreaProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const InputArea = ({ onSend, disabled }: InputAreaProps) => {
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input);
      setInput("");
      setIsFocused(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    // reset first so shrinking works
    el.style.height = "auto";

    const maxHeight = 150; // must match max-h-[200px]
    const next = Math.min(el.scrollHeight, maxHeight);

    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [input]);

  

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-4 relative z-20">
      {/* Input Row Wrapper */}
      <div className="flex items-center gap-2 md:gap-3 w-full">
        {/* Main Input Container */}
        <div 
            className={cn(
                "flex-1 relative bg-input-bg backdrop-blur-md border transition-all duration-300 rounded-[28px] md:rounded-[32px] shadow-lg flex items-stretch p-1.5 md:p-2",
                isFocused ? "border-foreground/50 shadow-primary/5" : "border-foreground/20 shadow-black/5"
            )}
        >
            {/* Text Area */}
            <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Ask anything..."
            rows={1}
            disabled={disabled}
            className="flex-1 bg-transparent border-none outline-none resize-none py-2 md:py-3 px-3 md:px-4 min-h-[40px] md:min-h-[48px] max-h-[200px] text-sm md:text-base leading-relaxed placeholder:text-muted-foreground/70 scrollbar-hide"
            />

            {/* Send Button - Transforms based on state */}
            <div className="flex items-center gap-1 self-center pb-0.5 md:pb-1 pr-0.5 md:pr-1">
                <button
                    onClick={handleSend}
                    disabled={!input.trim() || disabled}
                    className={cn(
                        "p-2 md:p-3 rounded-full transition-all duration-300 shrink-0 flex items-center justify-center",
                        input.trim() 
                            ? "bg-primary text-primary-foreground shadow-md  hover:scale-105 active:scale-95" 
                            : "bg-transparent text-muted-foreground/30 cursor-not-allowed"
                    )}
                >
                    <ArrowUp className={cn("w-4 h-4 md:w-5 md:h-5", input.trim() ? "stroke-[2.5px]" : "stroke-2")} />
                </button>
            </div>
        </div>

        {/* Mic Button */}
        <button 
            className={cn(
                "p-2.5 md:p-3.5 self-center rounded-full bg-input-bg backdrop-blur-md border border-accent-foreground/20 shadow-md text-muted-foreground transition-all duration-300 shrink-0",
                !disabled && "hover:shadow-lg hover:bg-accent hover:border-accent-foreground/30 hover:text-foreground",
                disabled && "cursor-not-allowed"
            )}
            title="Voice input"
            disabled={disabled}
        >
            <Mic className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>
    </div>
  );
};

export default InputArea;

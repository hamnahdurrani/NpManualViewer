export default function MessageLoader() {
    return (
        <div className="loader flex items-center gap-1.5 ml-12 py-4">
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce"></div>
                <div
                  className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></div>
        </div>
    )
}
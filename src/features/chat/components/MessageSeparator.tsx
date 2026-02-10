export default function MessageSeparator() {
    return (
        <div className="flex items-center gap-3 my-2">
          <div className="h-px flex-1 bg-border"></div>
          <div className="text-xs font-semibold tracking-wide text-muted-foreground/70 uppercase">
              End of conversation
          </div>
          <div className="h-px flex-1 bg-border"></div>
      </div>
    )
}
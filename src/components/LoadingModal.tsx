const LoadingModal = () => {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div
          className="flex flex-col items-center gap-4 rounded-2xl bg-muted px-10 py-8 shadow-xl"
        >
          <div
            className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"
          ></div>
          <p className="text-base font-medium text-foreground">
            Connecting…
          </p>
          <p className="text-sm text-muted-foreground">
            Please wait a moment while we connect.
          </p>
        </div>
      </div>
    );
};

export default LoadingModal;
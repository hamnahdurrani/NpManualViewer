// Used for event-driven communication from NPClient to UI components
export class EventEmitter<Events extends Record<string, any>> {
    private events: Map<keyof Events, Set<Function>> = new Map();

    on<K extends keyof Events>(event: K, listener: (data: Events[K]) => void): () => void {
        if (!this.events.has(event)) {
            this.events.set(event, new Set());
        }
        this.events.get(event)!.add(listener);
        return () => {
            this.off(event, listener);
        };
    }

    emit<K extends keyof Events>(event: K, data: Events[K]) {
        const listeners = this.events.get(event);
        if (listeners) {
            listeners.forEach(listener => listener(data));
        }
    }

    off<K extends keyof Events>(event: K, listener: (data: Events[K]) => void) {
        const listeners = this.events.get(event);
        if (listeners) {
            listeners.delete(listener);
        }
    }

    once<K extends keyof Events>(event: K, listener: (data: Events[K]) => void) {
        const onceListener = (data: Events[K]) => {
            this.off(event, onceListener);
            listener(data);
        };
        this.on(event, onceListener);
    }

    clear(event?: keyof Events) {
        if (event) this.events.delete(event);
        else this.events.clear();
    }
}

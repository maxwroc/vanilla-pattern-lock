
/**
 * Base class for objects emitting events.
 */
export class EventEmitter {
    private listeners: { [eventName: string]: Function[] } = {};

    on(eventName: string, func: Function) {
        this.listeners[eventName] = this.listeners[eventName] || [];
        this.listeners[eventName].push(func);
        return this;
    }

    off(eventName: string, func: Function) {
        this.listeners[eventName] = this.listeners[eventName]?.filter(f => f != func);
        return this;
    }

    protected emit(eventName: string, ...args: any[]) {
        this.listeners[eventName]?.forEach(func => {
            // release the thread
            setTimeout(() => func.apply(this, args));
        });
    }
}
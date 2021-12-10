
/**
 * Base class for objects emitting events.
 */
export class EventEmitter {
    private listeners: { [eventName: string]: Function[] } = {};

    /**
     * Binds given handler to event name
     * @param eventName Name of the event
     * @param func Event handler
     * @returns Self
     */
    on(eventName: string, func: Function) {
        eventName = eventName.toLowerCase();
        this.listeners[eventName] = this.listeners[eventName] || [];
        this.listeners[eventName].push(func);
        return this;
    }

    /**
     * Unbinds given handler to event name
     * @param eventName Name of the event
     * @param func Event handler
     * @returns Self
     */
    off(eventName: string, func: Function) {
        eventName = eventName.toLowerCase();
        this.listeners[eventName] = this.listeners[eventName]?.filter(f => f != func);
        return this;
    }

    /**
     * Passes-through the event to a given other EventEmitter
     * @param eventName Event name
     * @param target Target EventEmitter
     * @returns Self
     */
    passthrough(eventName: string, target: EventEmitter) {
        this.on(eventName, (...args: any[]) => target.emit.apply(target, [eventName, ...args]));
        return this;
    }

    /**
     * Emits/fires event
     * @param eventName Event name
     * @param args Event arguments
     */
    protected emit(eventName: string, ...args: any[]) {
        eventName = eventName.toLowerCase();
        this.listeners[eventName]?.forEach(func => {
            // release the thread
            setTimeout(() => func.apply(this, args));
        });
    }
}
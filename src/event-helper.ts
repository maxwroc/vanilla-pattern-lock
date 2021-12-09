

export class Evt {
    static on(elem: Element | Document, events: string, handler: EventListener) {
        events.split(' ').forEach(evtName => elem.addEventListener(evtName, handler));
    }

    static once(elem: Element | Document, events: string, handler: EventListener) {
        events.split(' ').forEach(evtName => {
            let wrapper = (e: Event) => {
                elem.removeEventListener(evtName, wrapper);
                handler(e);
            }
            elem.addEventListener(evtName, wrapper);
        });
    }

    static off(elem: Element | Document, events: string, handler: EventListener) {
        events.split(' ').forEach(evtName => elem.removeEventListener(evtName, handler));
    }
}

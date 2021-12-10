import { EventEmitter } from "./event-emitter";
import { Evt } from "./event-helper";
import { LineCanvas } from "./line-canvas";

/**
 * PatternLock main class
 */
export class PatternLock extends EventEmitter {

    /**
     * Main SVG element
     */
    private svg: SVGSVGElement;

    /**
     * Manager for dynamic SVG elements
     */
    private lineCanvas: LineCanvas;

    /**
     * Collection of indexes for selected dots
     */
    private selectedDotIndexes: number[] = [];

    /**
     * Settings
     */
    private options: IPatternLockSettings;

    /**
     * Constructor
     * @param options 
     */
    constructor(options?: IPatternLockSettings) {
        super();

        this.options = {
            vibrate: false,
            ...options
        }
    }

    /**
     * Renders PatternLock
     * @param container Target element to render PatternLock
     * @returns Self
     */
    render(container: HTMLElement): PatternLock {
        if (this.lineCanvas) {
            throw new Error("PatternLock rendered already");
        }

        container.innerHTML = html;
        this.svg = container.firstElementChild as SVGSVGElement;

        this.lineCanvas = new LineCanvas(this.svg);
        this.lineCanvas.passthrough("select", this);
        this.on("select", (index: number, dotElem: Element) => {
            this.selectedDotIndexes.push(index);
            if(this.options.vibrate) {
                window.navigator.vibrate(25);
            }
        });

        this.initEvents();

        return this;
    }

    /**
     * Gets current pattern
     * @returns Pattern
     */
    getPattern(): number {
        return parseInt(this.selectedDotIndexes.map((i) => i + 1).join(''))
    }

    /**
     * Resets state
     * @returns Self
     */
    clear(): PatternLock {
        this.selectedDotIndexes = [];
        this.svg.classList.remove("success", "error");
        this.lineCanvas.clear();
        this.emit("clear"); 
        return this;
    }

    /**
     * Show success markers/indicators
     * @returns Self
     */
    success(): PatternLock {
        this.svg.classList.remove("error");
        this.svg.classList.add("success");
        return this;
    }

    /**
     * Show failure markers/indicators
     * @returns Self
     */
    failure(): PatternLock {
        this.svg.classList.add("error");
        this.svg.classList.remove("success");
        return this;
    }

    /**
     * Binds events to SVG
     */
    private initEvents() {
        Evt.on(this.svg, 'touchstart mousedown', (e: Event) => {

            this.emit("trackingStart");

            this.clear();
            e.preventDefault();
            disableScroll();
            
            this.lineCanvas.startTracking();

            let endEvent = e.type == 'touchstart' ? 'touchend' : 'mouseup';
            Evt.once(document, endEvent, (e) => {
                this.emit("trackingEnd");

                enableScroll();
                this.lineCanvas.endTracking();

                if (this.selectedDotIndexes.length) {
                    this.emit("complete", this.getPattern());
                }
            })
        });
    }
}


const html = `
<svg class="pattern-lock" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g class="lock-actives"></g>
    <g class="lock-lines"></g>
    <g class="lock-dots">
        <circle cx="20" cy="20" r="2"/>
        <circle cx="50" cy="20" r="2"/>
        <circle cx="80" cy="20" r="2"/>
        <circle cx="20" cy="50" r="2"/>
        <circle cx="50" cy="50" r="2"/>
        <circle cx="80" cy="50" r="2"/>
        <circle cx="20" cy="80" r="2"/>
        <circle cx="50" cy="80" r="2"/>
        <circle cx="80" cy="80" r="2"/>
    </g>
</svg>
`;

/**
 * PatternLock settings
 */
export interface IPatternLockSettings {
    /**
     * Whether to vibrate on dot select event
     */
    vibrate?: boolean;
}



const preventDefault = (evt:Event) => evt.preventDefault();

const disableScroll = () => {
    window.addEventListener('DOMMouseScroll', preventDefault, false);
    window.onwheel = preventDefault; // modern standard
    window.onmousewheel = preventDefault; // older browsers, IE
    window.ontouchmove = preventDefault; // mobile
}

const enableScroll = () => {
    window.removeEventListener('DOMMouseScroll', preventDefault, false);
    window.onmousewheel = null;
    window.onwheel = null;
    window.ontouchmove = null;
}
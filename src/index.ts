import { EventEmitter } from "./event-emitter";
import { Evt } from "./event-helper";
import { LineCanvas } from "./line-canvas";

export default class PatternLock extends EventEmitter {

    private svg: SVGSVGElement;

    private lineCanvas: LineCanvas;

    private selectedDotIndexes: number[] = [];

    constructor(private options: IPatternLockOptions) {
        super();
    }

    render(container: HTMLElement): PatternLock {
        if (this.lineCanvas) {
            throw new Error("PatternLock rendered already");
        }

        container.innerHTML = html;
        this.svg = container.firstElementChild as SVGSVGElement;

        this.lineCanvas = new LineCanvas(this.svg);
        this.lineCanvas.on("select", (index: number, dotElem: Element) => {
            this.selectedDotIndexes.push(index);
            if(this.options.vibrate) {
                window.navigator.vibrate(25);
            }
        });

        this.initEvents();

        return this;
    }

    getPattern(): number {
        return parseInt(this.selectedDotIndexes.map((i) => i + 1).join(''))
    }

    clear(): void {
        this.selectedDotIndexes = [];
        this.svg.classList.remove("success", "error");
        this.lineCanvas.clear();
    }

    success(): void {
        this.svg.classList.remove("error");
        this.svg.classList.add("success");
    }

    failure() {
        this.svg.classList.add("error");
        this.svg.classList.remove("success");
    }

    private initEvents() {
        Evt.on(this.svg, 'touchstart mousedown', (e: Event) => {
            this.clear();
            e.preventDefault();
            disableScroll();
            
            this.lineCanvas.start();

            let endEvent = e.type == 'touchstart' ? 'touchend' : 'mouseup';
            Evt.once(document, endEvent, (e) => {
                enableScroll();
                this.lineCanvas.end();

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

interface IPatternLockOptions {
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


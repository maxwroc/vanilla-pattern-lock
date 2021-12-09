import { EventEmitter } from "./event-emitter";
import { Evt } from "./event-helper";

var moveEvent = 'touchmove mousemove';
var svgns = 'http://www.w3.org/2000/svg';

export class LineCanvas extends EventEmitter {

    private selectedDots: Element[] = [];

    private availableDots: Element[] = [];

    private currentline: Element | undefined;

    private updateLinePosHandler: EventListener | undefined;

    private markerCanvas: SVGGraphicsElement;

    private lineCanvas: SVGGraphicsElement;

    private pt: DOMPoint;

    private discoverDotHandler: EventListener;

    constructor(private svg: SVGSVGElement) {
        super();
        this.availableDots = Array.from(svg.querySelectorAll('.lock-dots circle'));
        this.lineCanvas = svg.querySelector<SVGGraphicsElement>('.lock-lines')!;
        this.markerCanvas = svg.querySelector<SVGGraphicsElement>('.lock-actives')!;
        this.pt = this.svg.createSVGPoint(); // TODO: createSVGPoint deprecated
    }

    startTracking() {
        this.discoverDotHandler = e => this.discoverDot(e);
        Evt.on(this.svg, moveEvent, this.discoverDotHandler);
    }

    endTracking() {
        this.stopTrack(this.currentline)
        this.currentline && this.currentline.remove();
        Evt.off(this.svg, moveEvent, this.discoverDotHandler);
    }

    clear() {
        this.currentline = undefined;
        this.updateLinePosHandler = undefined;
        this.selectedDots = [];
        this.lineCanvas.innerHTML = '';
        this.markerCanvas.innerHTML = '';
    }

    private isUsed(target: EventTarget | null) {
        return this.selectedDots.some(d => d === target);
    }

    private isAvailable(target: EventTarget | null) {
        return this.availableDots.some(d => d === target)
    }

    private getUpdateLinePosHandler(line: Element): EventListener {
        return (e: Event) => {
            e.preventDefault()

            if (this.currentline !== line) {
                return;
            }

            let pos = this.svgPosition(e.target as SVGGraphicsElement, e);
            line.setAttribute('x2', pos.x.toString())
            line.setAttribute('y2', pos.y.toString())
            return false
        }
    }

    private discoverDot(e: Event) {
        let target = e.target;
        if (e.type == 'touchmove') {
            let {x, y} = getMousePos(e)
            target = document.elementFromPoint(x, y);
        }
        if (this.isAvailable(target) && !this.isUsed(target)) {
            this.stopTrack(this.currentline, target as Element)
            this.currentline = this.beginTrack(target as Element)
        }
    }

    /**
     * Marks the dot and starts tracking the new line from it
     * @param target Dot start point for tracking
     * @returns 
     */
    private beginTrack(target: Element) {
        this.selectedDots.push(target);
        this.emit("select", Array.prototype.indexOf.call(target.parentElement!.children, target), target);

        let x = target.getAttribute('cx')!;
        let y = target.getAttribute('cy')!;
        var line = createNewLine(x, y);
        var marker = createNewMarker(x, y);
        this.markerCanvas.appendChild(marker);

        this.updateLinePosHandler = this.getUpdateLinePosHandler(line);
        Evt.on(this.svg, 'touchmove mousemove', this.updateLinePosHandler);

        this.lineCanvas.appendChild(line);
        return line
    }

    private stopTrack(line?: Element, target?: Element) {
        if (this.updateLinePosHandler) {
            Evt.off(this.svg, 'touchmove mousemove', this.updateLinePosHandler);
            this.updateLinePosHandler = undefined;
        }
        if (line === undefined || target === undefined) {
            return
        }

        let x = target.getAttribute('cx')!;
        let y = target.getAttribute('cy')!;
        line.setAttribute('x2', x)
        line.setAttribute('y2', y)
    }

    private svgPosition(element: SVGGraphicsElement, e: Event) {
        let {x, y} = getMousePos(e);
        this.pt.x = x; 
        this.pt.y = y;
        return this.pt.matrixTransform(element.getScreenCTM()!.inverse());
    }
}


function getMousePos(e: Event) {
    const mouseTouchEvt = <any>e;
    return {
        x: mouseTouchEvt.clientX || mouseTouchEvt.touches[0].clientX,
        y :mouseTouchEvt.clientY || mouseTouchEvt.touches[0].clientY
    }
}

function createNewMarker(x: string, y: string) {
    var marker = document.createElementNS(svgns, "circle");
    marker.setAttribute('cx', x);
    marker.setAttribute('cy', y);
    marker.setAttribute('r', "6");
    return marker;
}

function createNewLine(x1: string, y1: string, x2?: string, y2?: string): Element {
    var line = document.createElementNS(svgns, "line");
    line.setAttribute('x1', x1.toString());
    line.setAttribute('y1', y1);
    if (x2 === undefined || y2 == undefined) {
        line.setAttribute('x2', x1);
        line.setAttribute('y2', y1);
    } else {
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
    }
    return line;
}
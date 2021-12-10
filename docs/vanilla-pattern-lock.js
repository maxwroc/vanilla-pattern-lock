var PatternLock = (function () {
    'use strict';

    /**
     * Base class for objects emitting events.
     */
    class EventEmitter {
        constructor() {
            this.listeners = {};
        }
        on(eventName, func) {
            this.listeners[eventName] = this.listeners[eventName] || [];
            this.listeners[eventName].push(func);
            return this;
        }
        off(eventName, func) {
            var _a;
            this.listeners[eventName] = (_a = this.listeners[eventName]) === null || _a === void 0 ? void 0 : _a.filter(f => f != func);
            return this;
        }
        emit(eventName, ...args) {
            var _a;
            (_a = this.listeners[eventName]) === null || _a === void 0 ? void 0 : _a.forEach(func => {
                // release the thread
                setTimeout(() => func.apply(this, args));
            });
        }
    }

    class Evt {
        static on(elem, events, handler) {
            events.split(' ').forEach(evtName => elem.addEventListener(evtName, handler));
        }
        static once(elem, events, handler) {
            events.split(' ').forEach(evtName => {
                let wrapper = (e) => {
                    elem.removeEventListener(evtName, wrapper);
                    handler(e);
                };
                elem.addEventListener(evtName, wrapper);
            });
        }
        static off(elem, events, handler) {
            events.split(' ').forEach(evtName => elem.removeEventListener(evtName, handler));
        }
    }

    var moveEvent = 'touchmove mousemove';
    var svgns = 'http://www.w3.org/2000/svg';
    class LineCanvas extends EventEmitter {
        constructor(svg) {
            super();
            this.svg = svg;
            this.selectedDots = [];
            this.availableDots = [];
            this.availableDots = Array.from(svg.querySelectorAll('.lock-dots circle'));
            this.lineCanvas = svg.querySelector('.lock-lines');
            this.markerCanvas = svg.querySelector('.lock-actives');
            this.pt = this.svg.createSVGPoint(); // TODO: createSVGPoint deprecated
        }
        startTracking() {
            this.discoverDotHandler = e => this.discoverDot(e);
            Evt.on(this.svg, moveEvent, this.discoverDotHandler);
        }
        endTracking() {
            this.stopTrack(this.currentline);
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
        isUsed(target) {
            return this.selectedDots.some(d => d === target);
        }
        isAvailable(target) {
            return this.availableDots.some(d => d === target);
        }
        getUpdateLinePosHandler(line) {
            return (e) => {
                e.preventDefault();
                if (this.currentline !== line) {
                    return;
                }
                let pos = this.svgPosition(e.target, e);
                line.setAttribute('x2', pos.x.toString());
                line.setAttribute('y2', pos.y.toString());
                return false;
            };
        }
        discoverDot(e) {
            let target = e.target;
            if (e.type == 'touchmove') {
                let { x, y } = getMousePos(e);
                target = document.elementFromPoint(x, y);
            }
            if (this.isAvailable(target) && !this.isUsed(target)) {
                this.stopTrack(this.currentline, target);
                this.currentline = this.beginTrack(target);
            }
        }
        /**
         * Marks the dot and starts tracking the new line from it
         * @param target Dot start point for tracking
         * @returns
         */
        beginTrack(target) {
            this.selectedDots.push(target);
            this.emit("select", Array.prototype.indexOf.call(target.parentElement.children, target), target);
            let x = target.getAttribute('cx');
            let y = target.getAttribute('cy');
            var line = createNewLine(x, y);
            var marker = createNewMarker(x, y);
            this.markerCanvas.appendChild(marker);
            this.updateLinePosHandler = this.getUpdateLinePosHandler(line);
            Evt.on(this.svg, 'touchmove mousemove', this.updateLinePosHandler);
            this.lineCanvas.appendChild(line);
            return line;
        }
        stopTrack(line, target) {
            if (this.updateLinePosHandler) {
                Evt.off(this.svg, 'touchmove mousemove', this.updateLinePosHandler);
                this.updateLinePosHandler = undefined;
            }
            if (line === undefined || target === undefined) {
                return;
            }
            let x = target.getAttribute('cx');
            let y = target.getAttribute('cy');
            line.setAttribute('x2', x);
            line.setAttribute('y2', y);
        }
        svgPosition(element, e) {
            let { x, y } = getMousePos(e);
            this.pt.x = x;
            this.pt.y = y;
            return this.pt.matrixTransform(element.getScreenCTM().inverse());
        }
    }
    function getMousePos(e) {
        const mouseTouchEvt = e;
        return {
            x: mouseTouchEvt.clientX || mouseTouchEvt.touches[0].clientX,
            y: mouseTouchEvt.clientY || mouseTouchEvt.touches[0].clientY
        };
    }
    function createNewMarker(x, y) {
        var marker = document.createElementNS(svgns, "circle");
        marker.setAttribute('cx', x);
        marker.setAttribute('cy', y);
        marker.setAttribute('r', "6");
        return marker;
    }
    function createNewLine(x1, y1, x2, y2) {
        var line = document.createElementNS(svgns, "line");
        line.setAttribute('x1', x1.toString());
        line.setAttribute('y1', y1);
        if (x2 === undefined || y2 == undefined) {
            line.setAttribute('x2', x1);
            line.setAttribute('y2', y1);
        }
        else {
            line.setAttribute('x2', x2);
            line.setAttribute('y2', y2);
        }
        return line;
    }

    class PatternLock extends EventEmitter {
        constructor(options) {
            super();
            this.options = options;
            this.selectedDotIndexes = [];
        }
        render(container) {
            if (this.lineCanvas) {
                throw new Error("PatternLock rendered already");
            }
            container.innerHTML = html;
            this.svg = container.firstElementChild;
            this.lineCanvas = new LineCanvas(this.svg);
            this.lineCanvas.on("select", (index, dotElem) => {
                this.selectedDotIndexes.push(index);
                if (this.options.vibrate) {
                    window.navigator.vibrate(25);
                }
            });
            this.initEvents();
            return this;
        }
        getPattern() {
            return parseInt(this.selectedDotIndexes.map((i) => i + 1).join(''));
        }
        clear() {
            this.selectedDotIndexes = [];
            this.svg.classList.remove("success", "error");
            this.lineCanvas.clear();
            this.emit("clear");
        }
        success() {
            this.svg.classList.remove("error");
            this.svg.classList.add("success");
        }
        failure() {
            this.svg.classList.add("error");
            this.svg.classList.remove("success");
        }
        initEvents() {
            Evt.on(this.svg, 'touchstart mousedown', (e) => {
                this.clear();
                e.preventDefault();
                disableScroll();
                this.lineCanvas.startTracking();
                let endEvent = e.type == 'touchstart' ? 'touchend' : 'mouseup';
                Evt.once(document, endEvent, (e) => {
                    enableScroll();
                    this.lineCanvas.endTracking();
                    if (this.selectedDotIndexes.length) {
                        this.emit("complete", this.getPattern());
                    }
                });
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
    const preventDefault = (evt) => evt.preventDefault();
    const disableScroll = () => {
        window.addEventListener('DOMMouseScroll', preventDefault, false);
        window.onwheel = preventDefault; // modern standard
        window.onmousewheel = preventDefault; // older browsers, IE
        window.ontouchmove = preventDefault; // mobile
    };
    const enableScroll = () => {
        window.removeEventListener('DOMMouseScroll', preventDefault, false);
        window.onmousewheel = null;
        window.onwheel = null;
        window.ontouchmove = null;
    };

    return PatternLock;

}());

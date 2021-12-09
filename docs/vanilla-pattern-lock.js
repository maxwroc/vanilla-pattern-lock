var PatternLock = (function () {
    'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    /**
     * Base class for objects emitting events.
     */
    var EventEmitter = /** @class */ (function () {
        function EventEmitter() {
            this.listeners = {};
        }
        EventEmitter.prototype.on = function (eventName, func) {
            this.listeners[eventName] = this.listeners[eventName] || [];
            this.listeners[eventName].push(func);
            return this;
        };
        EventEmitter.prototype.off = function (eventName, func) {
            var _a;
            this.listeners[eventName] = (_a = this.listeners[eventName]) === null || _a === void 0 ? void 0 : _a.filter(function (f) { return f != func; });
            return this;
        };
        EventEmitter.prototype.emit = function (eventName) {
            var _this = this;
            var _a;
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            (_a = this.listeners[eventName]) === null || _a === void 0 ? void 0 : _a.forEach(function (func) {
                // release the thread
                setTimeout(function () { return func.apply(_this, args); });
            });
        };
        return EventEmitter;
    }());

    var Evt = /** @class */ (function () {
        function Evt() {
        }
        Evt.on = function (elem, events, handler) {
            events.split(' ').forEach(function (evtName) { return elem.addEventListener(evtName, handler); });
        };
        Evt.once = function (elem, events, handler) {
            events.split(' ').forEach(function (evtName) {
                var wrapper = function (e) {
                    elem.removeEventListener(evtName, wrapper);
                    handler(e);
                };
                elem.addEventListener(evtName, wrapper);
            });
        };
        Evt.off = function (elem, events, handler) {
            events.split(' ').forEach(function (evtName) { return elem.removeEventListener(evtName, handler); });
        };
        return Evt;
    }());

    var moveEvent = 'touchmove mousemove';
    var svgns = 'http://www.w3.org/2000/svg';
    var LineCanvas = /** @class */ (function (_super) {
        __extends(LineCanvas, _super);
        function LineCanvas(svg) {
            var _this = _super.call(this) || this;
            _this.svg = svg;
            _this.selectedDots = [];
            _this.availableDots = [];
            _this.availableDots = Array.from(svg.querySelectorAll('.lock-dots circle'));
            _this.lineCanvas = svg.querySelector('.lock-lines');
            _this.markerCanvas = svg.querySelector('.lock-actives');
            _this.pt = _this.svg.createSVGPoint(); // TODO: createSVGPoint deprecated
            return _this;
        }
        LineCanvas.prototype.start = function () {
            var _this = this;
            this.discoverDotHandler = function (e) { return _this.discoverDot(e); };
            Evt.on(this.svg, moveEvent, this.discoverDotHandler);
        };
        LineCanvas.prototype.end = function () {
            this.stopTrack(this.currentline);
            this.currentline && this.currentline.remove();
            Evt.off(this.svg, moveEvent, this.discoverDotHandler);
        };
        LineCanvas.prototype.clear = function () {
            this.currentline = undefined;
            this.updateLinePosHandler = undefined;
            this.selectedDots = [];
            this.lineCanvas.innerHTML = '';
            this.markerCanvas.innerHTML = '';
        };
        LineCanvas.prototype.isUsed = function (target) {
            return this.selectedDots.some(function (d) { return d === target; });
        };
        LineCanvas.prototype.isAvailable = function (target) {
            return this.availableDots.some(function (d) { return d === target; });
        };
        LineCanvas.prototype.getUpdateLinePosHandler = function (line) {
            var _this = this;
            return function (e) {
                e.preventDefault();
                if (_this.currentline !== line) {
                    return;
                }
                var pos = _this.svgPosition(e.target, e);
                line.setAttribute('x2', pos.x.toString());
                line.setAttribute('y2', pos.y.toString());
                return false;
            };
        };
        LineCanvas.prototype.discoverDot = function (e) {
            var target = e.target;
            if (e.type == 'touchmove') {
                var _a = getMousePos(e), x = _a.x, y = _a.y;
                target = document.elementFromPoint(x, y);
            }
            if (this.isAvailable(target) && !this.isUsed(target)) {
                this.stopTrack(this.currentline, target);
                this.currentline = this.beginTrack(target);
            }
        };
        /**
         * Marks the dot and starts tracking the new line from it
         * @param target Dot start point for tracking
         * @returns
         */
        LineCanvas.prototype.beginTrack = function (target) {
            this.selectedDots.push(target);
            this.emit("select", Array.prototype.indexOf.call(target.parentElement.children, target), target);
            var x = target.getAttribute('cx');
            var y = target.getAttribute('cy');
            var line = createNewLine(x, y);
            var marker = createNewMarker(x, y);
            this.markerCanvas.appendChild(marker);
            this.updateLinePosHandler = this.getUpdateLinePosHandler(line);
            Evt.on(this.svg, 'touchmove mousemove', this.updateLinePosHandler);
            this.lineCanvas.appendChild(line);
            return line;
        };
        LineCanvas.prototype.stopTrack = function (line, target) {
            if (this.updateLinePosHandler) {
                Evt.off(this.svg, 'touchmove mousemove', this.updateLinePosHandler);
                this.updateLinePosHandler = undefined;
            }
            if (line === undefined || target === undefined) {
                return;
            }
            var x = target.getAttribute('cx');
            var y = target.getAttribute('cy');
            line.setAttribute('x2', x);
            line.setAttribute('y2', y);
        };
        LineCanvas.prototype.svgPosition = function (element, e) {
            var _a = getMousePos(e), x = _a.x, y = _a.y;
            this.pt.x = x;
            this.pt.y = y;
            return this.pt.matrixTransform(element.getScreenCTM().inverse());
        };
        return LineCanvas;
    }(EventEmitter));
    function getMousePos(e) {
        var mouseTouchEvt = e;
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

    var PatternLock = /** @class */ (function (_super) {
        __extends(PatternLock, _super);
        function PatternLock(options) {
            var _this = _super.call(this) || this;
            _this.options = options;
            _this.selectedDotIndexes = [];
            return _this;
        }
        PatternLock.prototype.render = function (container) {
            var _this = this;
            if (this.lineCanvas) {
                throw new Error("PatternLock rendered already");
            }
            container.innerHTML = html;
            this.svg = container.firstElementChild;
            this.lineCanvas = new LineCanvas(this.svg);
            this.lineCanvas.on("select", function (index, dotElem) {
                _this.selectedDotIndexes.push(index);
                if (_this.options.vibrate) {
                    window.navigator.vibrate(25);
                }
            });
            this.initEvents();
            return this;
        };
        PatternLock.prototype.getPattern = function () {
            return parseInt(this.selectedDotIndexes.map(function (i) { return i + 1; }).join(''));
        };
        PatternLock.prototype.clear = function () {
            this.selectedDotIndexes = [];
            this.svg.classList.remove("success", "error");
            this.lineCanvas.clear();
        };
        PatternLock.prototype.success = function () {
            this.svg.classList.remove("error");
            this.svg.classList.add("success");
        };
        PatternLock.prototype.failure = function () {
            this.svg.classList.add("error");
            this.svg.classList.remove("success");
        };
        PatternLock.prototype.initEvents = function () {
            var _this = this;
            Evt.on(this.svg, 'touchstart mousedown', function (e) {
                _this.clear();
                e.preventDefault();
                disableScroll();
                _this.lineCanvas.start();
                var endEvent = e.type == 'touchstart' ? 'touchend' : 'mouseup';
                Evt.once(document, endEvent, function (e) {
                    enableScroll();
                    _this.lineCanvas.end();
                    if (_this.selectedDotIndexes.length) {
                        _this.emit("complete", _this.getPattern());
                    }
                });
            });
        };
        return PatternLock;
    }(EventEmitter));
    var html = "\n<svg class=\"pattern-lock\" viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\">\n    <g class=\"lock-actives\"></g>\n    <g class=\"lock-lines\"></g>\n    <g class=\"lock-dots\">\n        <circle cx=\"20\" cy=\"20\" r=\"2\"/>\n        <circle cx=\"50\" cy=\"20\" r=\"2\"/>\n        <circle cx=\"80\" cy=\"20\" r=\"2\"/>\n        <circle cx=\"20\" cy=\"50\" r=\"2\"/>\n        <circle cx=\"50\" cy=\"50\" r=\"2\"/>\n        <circle cx=\"80\" cy=\"50\" r=\"2\"/>\n        <circle cx=\"20\" cy=\"80\" r=\"2\"/>\n        <circle cx=\"50\" cy=\"80\" r=\"2\"/>\n        <circle cx=\"80\" cy=\"80\" r=\"2\"/>\n    </g>\n</svg>\n";
    var preventDefault = function (evt) { return evt.preventDefault(); };
    var disableScroll = function () {
        window.addEventListener('DOMMouseScroll', preventDefault, false);
        window.onwheel = preventDefault; // modern standard
        window.onmousewheel = preventDefault; // older browsers, IE
        window.ontouchmove = preventDefault; // mobile
    };
    var enableScroll = function () {
        window.removeEventListener('DOMMouseScroll', preventDefault, false);
        window.onmousewheel = null;
        window.onwheel = null;
        window.ontouchmove = null;
    };

    return PatternLock;

}());
//# sourceMappingURL=vanilla-pattern-lock.js.map

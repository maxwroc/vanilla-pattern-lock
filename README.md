# vanilla-pattern-lock
[![npm](https://img.shields.io/npm/dm/vanilla-pattern-lock?label=npm%20downloads)](https://www.npmjs.com/package/vanilla-pattern-lock)
[![npm version](https://img.shields.io/npm/v/vanilla-pattern-lock?color=blue)](https://www.npmjs.com/package/vanilla-pattern-lock)

Android like pattern unlock.

## Features

* Converts pattern to number
* Vanilla JS - no external libs required
* Support for touch devices
* Small size (less than 10KB)
* TS typings

![pattern-lock2-ffmpg](https://user-images.githubusercontent.com/8268674/145471565-15d1bc26-fb09-4471-9cf7-a699f378762e.gif)

## Demo

https://maxwroc.github.io/vanilla-pattern-lock/

## Usage

```javascript
const lock = new PatternLock({ 
    vibrate: true // whether to vibrate on dot/node selection (mobile devices)
});

lock
  .render(document.getElementById("lockContainer"))
  .on("complete", pattern => { // triggers when user stops swiping
      if (pattern == 12345) {
          lock.success(); // green markers
      }
      else {
          lock.failure(); // red markers
          setTimeout(() => {
              lock.clear();
          }, 2000);
      }
  })
```

## Documentation

### Methods

| Method interface | Return value | Description |
|:-----|:-----|:-----|
| `render(container: Element)` | `PatternLock` | Renders pattern lock SVG element<br>`container` - Element in which SVG will be rendered
| `clear()` | `PatternLock` | Clears existing selection and resets internal state
| `getPattern()` | `number` | Returns current pattern
| `success()` | `PatternLock` | Shows success markers/indicators
| `failure()` | `PatternLock` | Shows failure markers/indicators

Event related methods

| Method interface | Return value | Description |
|:-----|:-----|:-----|
| `on(name: string, func: Function)` | `PatternLock` | Sets handler for an event (for handler interface look below)
| `off(name: string, func: Function)` | `PatternLock` | Removes handler for an event

### Events

| Event name | Handler interface | Description |
|:-----|:-----|:-----|
| `complete` | `(pattern: number): void` | Fired when user finished entering pattern
| `select` | `(index: number, elem: Element): void` | Fired when the dot/node is selected.<br>`index` - Index of the dot/node<br>`elem` - Dot element (SVG image element)
| `selectionStart` | `(): void` | Fired when user starts entering pattern
| `selectionEnd` | `(): void` | Fired when user ends entering pattern
| `clear` | `(): void` | Fired when clear method is called (current pattern is erased)

### Settings

| Name | Type | Description |
|:-----|:-----|:-----|
| vibrate | `boolean` | Whether to vibrate when dot is selected

## Installation / download

* Install via NMP

  ```
  npm install vanilla-pattern-lock
  ```

* Github releases: [vanilla-pattern-lock/releases](https://github.com/maxwroc/vanilla-pattern-lock/releases)

## Like it? Star it!

If you like it please consider leaving star on github.

## Credits

This code is based on [Tympanix/pattern-lock-js](https://github.com/Tympanix/pattern-lock-js). The original library depends on JQuery and it is written in plain JS. I have rewritten the original code in TypeScript and I've added few additional features.
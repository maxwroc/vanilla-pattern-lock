# vanilla-pattern-lock
Android like pattern unlock.

## Features

* Converts pattern to number
* Vanilla JS - no external libs required
* Support for touch devices
* Small size (less than 10KB)
* TS typings

![pattern-lock2-ffmpg](https://user-images.githubusercontent.com/8268674/145471565-15d1bc26-fb09-4471-9cf7-a699f378762e.gif)

## Usage

```javascript
const lock = new PatternLock({ vibrate: true });
lock
  .render(document.getElementById("lockContainer"))
  .on("complete", pattern => {
      if (pattern == 12345) {
          lock.success();
      }
      else {
          lock.failure();
          setTimeout(() => {
              lock.clear();
          }, 2000);
      }
  })
```

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
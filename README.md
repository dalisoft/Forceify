# Forceify

Simple, yet powerful touch-**force** handler

## Features

- Lightweight
- Blazing fast
- No dependecies
- Active [tweening](https://mikebolt.github.io/discuss/examples/active_tweens.html)
- Compatible with any mobile/desktop browser
- Handles everything for you
- Clean code
- Performant
- Easy
- UMD compatible

## Note

When your device doesn't support 3D Touch/Force Touch, this library does not force your device work this feature, instead of library polyfills with `pointer` events + tweening (like Instagram post/Telegram app chat)

## Installing

```bash
$ npm install forceify
# or
$ yarn add forceify
```

## CDN

```bash
# unpkg.com
https://unpkg.com/forceify

# npmcdn
https://npmcdn.com/forceify

# jsDelivr
https://cdn.jsdelivr.net/npm/forceify
```

## Usage

It's browser-only mode, so please use it carefully and don't use with NodeJS server-side apps.
You should load script first for working snippet...

### In React

For React apps, please use [React wrapper for Forceify](https://www.npmjs.com/package/react-forceify)

```javascript
const myElement = document.querySelector("#myElement");
var forceTouchInstance = new Forceify(myElement);
forceTouchInstance.onForce(e => {
  var force = e.force;
  console.log(force);
});
```

## Methods

| Name           | Type       | Description                                 |
| -------------- | ---------- | ------------------------------------------- |
| `on`           | `Function` | `addEventListener` alternative              |
| `isIOS3DTouch` | `Function` | returns support of `real 3D Touch`          |
| `isChrome`     | `Function` | returns `true` if `Chrome` browser/OS       |
| `isIOS`        | `Function` | returns `true` if `iOS` devices             |
| `isMouse`      | `Function` | returns `true` if it's mouse-powered device |

## Compatibility

It's compatible with any ES6 supported browser

## License

MIT

# Forceify

Simple, yet powerful touch-**force** level detector implementation in TS/JS

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

## Note

When device doesn't support native 3D-Touch, it's handles it via `delayed call` which works good, not implements 3D-Touch Dynamic Force level as it's impossible

## Usage

It's browser-only mode, so please use it carefully and don't use with NodeJS server-side apps.
You should load script first for working snippet...

### In React/Preact/Inferno

```javascript
class MyApp extends Component {
    componentDidMount () {
        new Forceify(this.refs.lorem01).onForce(({force}) => {
            console.log(force);
        });
    }
    render () { <Lorem ref="lorem01" {...}    ><Ipsum/><Dolor/></Lorem> }
}

render(<MyApp/>, myMountTarget);
```

```javascript
var forceInstance = new Forceify(yourDOMNodeReference);
    forceInstance.onForce(function(e){
        var force = e.force;
        console.log(force);
    });
```

## Methods

| Name       | Type       | Description                                 |
|----------------|------------|---------------------------------------------|
| `on`           | `Function` | `addEventListener` alternative              |
| `isIOS3DTouch` | `Function` | returns support of `real 3D Touch`          |
| `isChrome`     | `Function` | returns `true` if `Chrome` browser/OS       |
| `isIOS`        | `Function` | returns `true` if `iOS` devices             |
| `isMouse`      | `Function` | returns `true` if it's mouse-powered device |

## Compatibility

It's target is ES3 compatible-browsers, but it works best within following browser:

| Browser    | Supported Version | Recommended Version | Best Version |
|------------|-------------------|---------------------|--------------|
| IE         | >9                | >10                 | >11          |
| Android    | >4.1.2            | >4.4                | >5.1         |
| iOS        | >7                | >9                  | >10          |
| macOS/OS X | >9                | >10                 | >10.12       |
| Firefox    | >15               | > 35                | >47          |

## License

MIT
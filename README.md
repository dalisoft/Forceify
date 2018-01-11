# Forceify

# Installing
```bash
$ npm install forceify
# or
$ yarn add forceify
```

# CDN
```
# unpkg.com
https://unpkg.com/forceify

# npmcdn
https://npmcdn.com/forceify

# jsDelivr
https://cdn.jsdelivr.net/npm/forceify
```

# Note
When device doesn't support native 3D-Touch, it's handles it via `delayed call` which works good, not implements 3D-Touch Dynamic Force level as it's impossible

# Usage
It's browser-only mode, so please use it carefully and don't use with NodeJS server-side apps.
You should load script first for working snippet...

### In React/Preact/Inferno
```javascript
class MyApp extends Component {
	componentDidMount () {
		let node = this.findDOMNode(this);
		Forceify.RegisterNode(node);
	}
	render () { <Lorem {...}><Ipsum/><Dolor/></Lorem> }
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

# Methods
* `forceInstance.on` - `@type Function` - simplified and cross-browser(env) `addEventListener` alternative
* `forceInstance.isTouch` - `@type Function` - returns `true` if it's touch-device and runs on non-Chrome browser
* `forceInstance.isChrome` - `@type Function` - returns `true` if it's Chrome browser
* `forceInstance.isMacOS`, `forceInstance.isIOS` - `@type Function` - returns `true` if it's Apple device's
* `forceInstance.isMouse` - `@type Function` - returns `true` if it's mouse-powered device


# Compatibility
It's target is ES3 compatible-browsers, but it works best within following browser: 
* IE9+
* Android 4+
* iOS9+
* Safari 5.1+ (iOS/OS X)
* Firefox 15+

# License
MIT
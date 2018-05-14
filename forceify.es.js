    let tasks = [];
    let id = {};
    /* Small shim for lighter size */
    let last = Date.now();
    let reqAnimFrame = typeof (requestAnimationFrame) !== 'undefined' ? requestAnimationFrame : (fn) => setTimeout(() => fn(Date.now() - last), 50);
    let cancelAnimFrame = typeof (cancelAnimationFrame) !== 'undefined' ? cancelAnimationFrame : (fn) => clearTimeout(fn);
    if (typeof performance === 'object' && !performance.now) {
    	performance.now = () => Date.now() - last;
    }
    let now = () => {
    	return typeof performance !== 'undefined' && !!performance.now ? performance.now() : Date.now() - last;
    };
	let root = typeof (global) !== 'undefined' ? global : typeof (window) !== 'undefined' ? window : typeof (exports) !== 'undefined' ? exports : this;
    reqAnimFrame(function update(time) {
    	reqAnimFrame(update);
    	let i = 0;
    	while (i < tasks.length) {
    		let task = tasks[i];
    		if (task.update(time)) {
    			i++;
    		} else {
    			tasks.splice(i, 1);
    		}
    	}
	});
	const _default = (value, def) => {
		if (value === null || value === undefined) {
			return def;
		}
		return value;
	}
    let _id = 0;
    class Logic {
    	constructor(queueID, elem, self) {
    		this._queueID = queueID;
    		this._onUpdate = null;
    		this._duration = 200;
    		this._delayTime = 0;
    		this._startTime = null;
    		this._id = _id++;
    		this.startValue = 0;
    		this.currentValue = {
    			force: 0,
    			target: elem
    		};
    		this.__self = self;
    		this.endValue = 1;
    		this.callElem = elem;
    	}
    	duration(amount) {
    		this._duration = amount;
    		return this;
    	}
    	start() {
    		const {
    			_queueID,
    			_delayTime,
    			currentValue
    		} = this;
    		let queue = id[_queueID];
    		if (queue) {
    			let i = 0,
    				queueItem;
    			while (queueItem = queue.shift()) {
    				let idx = tasks.indexOf(queueItem);
    				if (idx > -1) {
    					tasks.splice(i, 1);
    				}
    			}
    		} else {
    			queue = id[_queueID] = [];
    		}
    		this.startValue = currentValue.force;
    		this.endValue = 1;
    		queue.push(this);
    		tasks.push(this);
    		this._startTime = now() + this._delayTime;
    		return this;
    	}
    	delay(amount) {
    		this._delayTime = amount;
    		return this;
    	}
    	onUpdate(callback) {
    		this._onUpdate = callback;
    		return this;
    	}
    	restart(asReverse) {
    		let {
    			_queueID,
    			_delayTime,
    			currentValue
    		} = this;
    		let i = tasks.indexOf(this);
    		if (i === -1) {
    			this.start();
    		} else {
    			this._startTime = now() + _delayTime;
    		}
    		if (asReverse) {
    			this.startValue = currentValue.force;
    			this.endValue = 0;
    		}
    		return this;
    	}
    	update(time) {
    		let {
    			_startTime,
    			_duration,
    			_onUpdate,
    			currentValue,
    			startValue,
    			endValue,
    			callElem,
    			__self
    		} = this;
    		if (time < _startTime) {
    			return true;
    		}
    		let elapsed = (time - _startTime) / _duration;
    		elapsed = elapsed > 1 ? 1 : elapsed;
    		currentValue.force = (__self.__force !== undefined && __self.__force !== 0 && __self.__force !== 1) ? __self.__force : startValue + (endValue - startValue) * elapsed;
    		if (_onUpdate) {
    			_onUpdate.call(callElem, currentValue);
    		}
    		if (elapsed === 1) {
    			return false;
    		}
    		return true;
    	}
    }
    let ua = typeof (navigator) !== 'undefined' ? navigator.userAgent : '';
    let _isIOSDevices = ua.indexOf('; CPU') !== -1 && ua.indexOf(' like Mac') !== -1;
    let _isNonBrowserEnv = 'tabris' in root || 'tezNative' in root;
    let _document = _isNonBrowserEnv || !root.document ? {} : root.document;
    let _isTouchSimulate = 'ontouchend' in _document.body || root.DocumentTouch || navigator.maxTouchPoints > 0 || root.navigator.msMaxTouchPoints > 0;
    let _isReal3DTouch = 'ontouchforcechange' in _document.body && _isIOSDevices;
    const getTouch = (e, targ, changed) => {
    	let touches = changed ? e.touches : e.changedTouches;
    	if (touches) {
    		let i = 0;
    		const maxLen = touches.length;
    		if (maxLen > 1) {
    			if (e.scale && e.scale !== 1) {
    				return null;
    			}
    		}
    		if (e && e.preventDefault) {
    			e.preventDefault();
    		}
    		while (i < maxLen) {
    			if (!!touches[i] && touches[i].target === targ) {
    				return touches[i];
    			}
    			i++;
    		}
    	}
    	return null;
    };
    export default class Forceify {
    	constructor(el, params = {}) {
    		let forceifyID = 0;
    		if (!el.forceifyQueueId) {
    			forceifyID = el.forceifyQueueId = Math.floor(Date.now() + (Math.random() * 1000));
    		} else {
    			forceifyID = el.forceifyQueueId;
    		}
    		this.id = forceifyID;
    		this._callback = null;
    		this.el = el;
    		this._pressDuration = _default(params.pressDuration, 200);
    		this._leaveDurationTolerance = _default(params.leaveDurationTolerance, 0.35);
    		this._leaveDuration = this._pressDuration * this._leaveDurationTolerance;
    		this._delay = _default(params.delay, 0);
    		this._eventPress = null;
    		this._eventLeave = null;
    		this._eventUp = null;
    		this._checkResult = null;
    		this._useSameDurInLeave = _default(params.useSameDurInLeave, false);
    		this._resetOnLeave = _default(params.resetOnLeave, true);
    		this.el = el;
    		return this;
    	}
    	getEnv = () => {
    		return this._checkResult;
    	}
    	resetOnLeave = (state = true) => {
    		this._resetOnLeave = state;
    		return this;
    	}
    	useLongPressEqualDuration = (state = true) => {
    		this._useSameDurInLeave = state;
    		return this;
    	}
    	setLongPressLeaveTolerance = (amount) => {
    		this._leaveDurationTolerance = amount;
    		this._leaveDuration = this._pressDuration * amount;
    		return this;
    	}
    	setLongPressDelay = (amount) => {
    		this._delay = amount;
    		return this;
    	}
    	setLongPressDuration = (amount) => {
    		this._pressDuration = amount;
    		this._leaveDuration = amount * this._leaveDurationTolerance;
    		return this;
    	}
    	onForce = (fn) => {
    		this._callback = fn;
    		return this.init();
    	}
    	on = (eventName, callbackListener, capture) => {
    		if (_isNonBrowserEnv) {
    			this.el.on(eventName, callbackListener);
    		} else if (root.addEventListener) {
    			this.el.addEventListener(eventName, callbackListener, capture);
    		} else if (root.attachEvent) {
    			this.el.attachEvent('on' + eventName, callbackListener);
    		} else {
    			this.el['on' + eventName] = callbackListener;
    		}
    		return this;
    	}
    	off = (eventName, callbackListener, capture) => {
    		if (_isNonBrowserEnv) {
    			this.el.off(eventName, callbackListener);
    		} else if (root.removeEventListener) {
    			this.el.removeEventListener(eventName, callbackListener, capture);
    		} else if (root.detachEvent) {
    			this.el.detachEvent('on' + eventName, callbackListener);
    		} else {
    			this.el['on' + eventName] = null;
    		}
    		return this;
    	}
    	preventTouchCallout = () => {
    		const el = this.el;
    		const touchCallout = ['webkitTouchCallout', 'MozTouchCallout', 'msTouchCallout', 'khtmlUserSelect', 'touchCallout', 'webkitUserSelect', 'MozUserSelect', 'msUserSelect', 'khtmlUserSelect', 'userSelect', 'webkitUserDrag', 'MozUserDrag', 'msUserDrag', 'khtmlUserDrag', 'userDrag'];
    		for (let property of touchCallout) {
    			if (property in el.style) {
    				el.style[property] = 'none';
    			}
    		}
    		const touchActions = ['webkitTouchAction', 'mozTouchAction', 'msTouchAction', 'khtmlTouchAction', 'touchAction'];
    		for (let property of touchActions) {
    			if (property in el.style) {
    				el.style[property] = 'manipulation';
    			}
    		}
    		return this;
    	}
    	handleForceChange = (e) => {
    		if (e.preventDefault) {
    			e.preventDefault();
    		}
    		if (e.stopPropagation) {
    			e.stopPropagation();
    		}
    		this._iterateOfHandleForceChange++;
    		let force = e.webkitForce !== undefined ? e.webkitForce / 3 : e.force !== undefined ? e.force : undefined;
    		if (force === undefined) {
    			let touches = getTouch(e, this.el, true);
    			if (!touches) {
    				force = 0;
    			} else {
    				if (touches.force !== undefined) {
    					force = touches.force;
    				} else if (touches.webkitForce) {
    					force = touches.force;
    				}
    			}
    		}
    		e.force = force;
    		this.__force = force;
    		this._calledTimeout = true;
    		this._callback.call(this, e);
    		return false;
    	}
    	init = () => {
    		const {
    			el
    		} = this;
    		const isPointerSupported = 'onpointerdown' in el;
    		const __self$1 = this;
    		this._iterateOfHandleForceChange = 0;
    		let tickForce;
    		let perfNow;
    		let currentEvent;
    		const renderUntilBecomeZero = time => {
    			const {
    				__force
    			} = this;
    			let force = (1 - Math.min(((time - perfNow) / this._leaveDuration), 1)) * __force;
    			if (force > 0) {
    				tickForce = reqAnimFrame(renderUntilBecomeZero);
    			} else if (force === 0) {
    				cancelAnimFrame(tickForce);
    			}
    			currentEvent.force = force;
    			this.__force = force;
    			this.handleForceChange(currentEvent);
    		};
    		this.preventTouchCallout();
    		if ('onwebkitmouseforcebegin' in el) {
    			let _touchTicks = 0;
    			let tick;
    			this.on('onwebkitmouseforcechange', this.handleForceChange);
    			this.on('onwebkitmouseforcebegin', function checkForceTouch(e) {
    				_touchTicks++;
    				clearTimeout(tick);
    				tick = setTimeout(() => {
    					__self$1.off('onwebkitmouseforcebegin', checkForceTouch);
    				}, 25);
    			});
    			this.on('mousedown', function checkForceTouchVerify(e) {
    				clearTimeout(tick);
    				tick = setTimeout(function checkVerify() {
    					if (_touchTicks === 0 && __self$1._iterateOfHandleForceChange === 0) {
    						_isReal3DTouch = false;
    						__self$1._eventPress = 'mousedown';
    						__self$1._eventLeave = 'mouseleave';
    						__self$1._eventUp = 'mouseup';
    						__self$1._checkResult = root.chrome ? 'macOS Chrome' : 'macOS Safari';
    						__self$1.isPressed = true;
    						__self$1.handleSimulate();
    						__self$1.handlePress();
    					}
    					__self$1.off('mousedown', checkForceTouchVerify);
    				}, 50);
    			});
    			this.on('mouseup', function onMousUp(e) {
    				const {
						__force: force,
						_iterateOfHandleForceChange
    				} = __self$1;
    				currentEvent = e;
    				if (force > 0 && _iterateOfHandleForceChange > 1) {
    					perfNow = performance.now();
    					tickForce = reqAnimFrame(renderUntilBecomeZero);
    				} else {
    					__self$1.off('mouseup', onMousUp);
    				}
    			});
    			this._checkResult = 'macOSForce';
    			return this;
    		} else if (_isReal3DTouch) {
    			let _touchTicks = 0;
    			let tick;
    			this.on('touchforcechange', this.handleForceChange);
    			this.on('touchforcebegin', function check3DTouch(e) {
    				_touchTicks++;
    				clearTimeout(tick);
    				tick = setTimeout(() => {
    					__self$1.off('touchforcebegin', check3DTouch);
    				}, 25);
    			});
    			this.on('touchstart', function check3DTouchVerify(e) {
    				clearTimeout(tick);
    				tick = setTimeout(function checkVerify() {
    					if (_touchTicks === 0 && __self$1._iterateOfHandleForceChange === 0) {
    						_isReal3DTouch = false;
    						__self$1._eventPress = 'touchstart';
    						__self$1._eventLeave = 'touchleave';
    						__self$1._eventUp = 'touchend';
    						__self$1._checkResult = root.chrome ? 'ChromeMobile' : 'Touch';
    						__self$1.isPressed = true;
    						__self$1.handleSimulate();
    						__self$1.handlePress();
    					}
    					__self$1.off('touchstart', check3DTouchVerify);
    				}, 50);
    			});
    			this.on('touchend', function onTouchEnd(e) {
    				const {
						__force: force,
						_iterateOfHandleForceChange
    				} = __self$1;
    				currentEvent = e;
    				if (force > 0 && _iterateOfHandleForceChange > 1) {
    					perfNow = performance.now();
    					tickForce = reqAnimFrame(renderUntilBecomeZero);
    				} else {
    					__self$1.off('touchend', onTouchEnd);
    				}
    			});
    			this._checkResult = 'iOSForce';
    			return this;
    		} else if (isPointerSupported) {
    			this._eventPress = 'pointerdown';
    			this._eventLeave = 'pointerleave';
    			this._eventUp = 'pointerup';
    			this._checkResult = root.chrome ? 'Chrome' : 'Modern';
    		} else if ('onmspointerdown' in el) {
    			this._eventPress = 'mspointerdown';
    			this._eventLeave = 'mspointerleave';
    			this._eventUp = 'mspointerup';
    			this._checkResult = root.chrome ? 'Chrome' : 'Modern';
    		} else if (_isTouchSimulate) {
    			this._eventPress = 'touchstart';
    			this._eventLeave = 'touchleave';
    			this._eventUp = 'touchend';
    			this._checkResult = root.chrome ? 'ChromeMobile' : 'Touch';
    		} else if ('onmousedown' in el) {
    			this._eventPress = 'mousedown';
    			this._eventLeave = 'mouseup';
    			this._eventUp = 'mouseleave';
    			this._checkResult = root.chrome ? 'Chrome' : 'Desktop';
    		}
    		this.isPressed = false;
    		return this.handleSimulate();
    	}
    	handleLeave = () => {
    		let {
    			_simulatedCallback,
    			_useSameDurInLeave,
    			_pressDuration,
    			_leaveDuration,
    			id: forceifyID,
    			el
    		} = this;
    		if (_simulatedCallback) {
    			_simulatedCallback.duration(_useSameDurInLeave ? _pressDuration : _leaveDuration).delay(0).restart(true);
    		}
    		return this;
    	}
    	handlePress = () => {
    		let {
    			_simulatedCallback,
    			_useSameDurInLeave,
    			_pressDuration,
    			_delay,
    			id: forceifyID,
    			el
    		} = this;
    		if (_simulatedCallback) {
    			_simulatedCallback.duration(_pressDuration).delay(_delay).start();
    		}
    		return this;
    	}
    	handleSimulate = () => {
    		let {
    			_simulatedCallback,
    			_eventPress,
    			_eventUp,
    			_eventLeave,
    			isPressed,
    			_callback,
    			id: forceifyID,
    			el
    		} = this;
    		if (!_simulatedCallback) {
    			_simulatedCallback = this._simulatedCallback = new Logic(forceifyID, el, this);
    		}
    		if (_simulatedCallback) {
    			_simulatedCallback.onUpdate(_callback);
    		}
    		// LONG PRESS
    		this.on(_eventPress, e => {
    			if (!isPressed && !_isReal3DTouch) {
    				if (e.type === _eventPress) {
    					if (e.preventDefault) {
    						e.preventDefault();
    					}
    					if (e.stopPropagation) {
    						e.stopPropagation();
    					}
    					this.handlePress();
    					isPressed = this.isPressed = true;
    				}
    			}
    			return false;
    		});
    		// LEAVE
    		const leaveListener = e => {
    			if (isPressed) {
    				if (e.type === _eventUp || (e.type === _eventLeave && this._resetOnLeave)) {
    					if (e.preventDefault) {
    						e.preventDefault();
    					}
    					if (e.stopPropagation) {
    						e.stopPropagation();
    					}
    					this.handleLeave();
    					isPressed = this.isPressed = false;
    				}
    			}
    			return false;
    		};
    		this.on(_eventUp, leaveListener);
    		this.on(_eventLeave, leaveListener);
    		return this;
    	}
    	isChrome() {
    		return this._checkResult === 'Chrome' || this._checkResult === 'ChromeMobile';
    	}
    	isMacOSForceTouch() {
    		return this._checkResult === 'macOSForce';
    	}
    	isIOS3DTouch() {
    		return this._checkResult === 'iOSForce';
    	}
    	isTouch() {
    		return this._checkResult === 'Touch';
    	}
    	isMouse() {
    		return this._checkResult === 'Desktop';
    	}
    }
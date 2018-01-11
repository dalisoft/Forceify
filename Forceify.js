(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], function () { return factory(root); });
    }
    else if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory(root);
    }
    else {
        root.Forceify = factory(root);
    }
}(typeof (window) !== 'undefined' ? window : this, function (root) {
    var tasks = [];
    var id = {};
    /* Small shim for lighter size */
    var last = Date.now();
    var reqAnimFrame = typeof (requestAnimationFrame) !== 'undefined' ? requestAnimationFrame : function (fn) { return setTimeout(function () { return fn(Date.now() - last); }, 17); };
    if (typeof performance === 'object' && !performance.now) {
        performance.now = function () { return Date.now() - last; };
    }
    var now = function () {
        return typeof performance !== 'undefined' && !!performance.now ? performance.now() : Date.now() - last;
    };
    var globalEnv = typeof (global) !== 'undefined' ? global : typeof (window) !== 'undefined' ? window : typeof (exports) !== 'undefined' ? exports : this;
    reqAnimFrame(function update(time) {
        reqAnimFrame(update);
        var i = 0;
        while (i < tasks.length) {
            var task = tasks[i];
            if (task.update(time)) {
                i++;
            }
            else {
                tasks.splice(i, 1);
            }
        }
    });
    var _id = 0;
    var Logic = /** @class */ (function () {
        function Logic(queueID, elem) {
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
            this.endValue = 1;
            this.callElem = elem;
        }
        Logic.prototype.duration = function (amount) {
            this._duration = amount;
            return this;
        };
        Logic.prototype.start = function () {
            var _a = this, _queueID = _a._queueID, _delayTime = _a._delayTime, currentValue = _a.currentValue;
            var queue = id[_queueID];
            if (queue) {
                var i = 0, queueItem = void 0;
                while (queueItem = queue.shift()) {
                    var idx = tasks.indexOf(queueItem);
                    if (idx > -1) {
                        tasks.splice(i, 1);
                    }
                }
            }
            else {
                queue = id[_queueID] = [];
            }
            this.startValue = currentValue.force;
            this.endValue = 1;
            queue.push(this);
            tasks.push(this);
            this._startTime = now() + this._delayTime;
            return this;
        };
        Logic.prototype.delay = function (amount) {
            this._delayTime = amount;
            return this;
        };
        Logic.prototype.onUpdate = function (callback) {
            this._onUpdate = callback;
            return this;
        };
        Logic.prototype.restart = function (asReverse) {
            var _a = this, _queueID = _a._queueID, _delayTime = _a._delayTime, currentValue = _a.currentValue;
            var i = tasks.indexOf(this);
            if (i === -1) {
                this.start();
            }
            else {
                this._startTime = now() + _delayTime;
            }
            if (asReverse) {
                this.startValue = currentValue.force;
                this.endValue = 0;
            }
            return this;
        };
        Logic.prototype.update = function (time) {
            var _a = this, _startTime = _a._startTime, _duration = _a._duration, _onUpdate = _a._onUpdate, currentValue = _a.currentValue, startValue = _a.startValue, endValue = _a.endValue, callElem = _a.callElem;
            if (time < _startTime) {
                return true;
            }
            var elapsed = (time - _startTime) / _duration;
            elapsed = elapsed > 1 ? 1 : elapsed;
            currentValue.force = startValue + (endValue - startValue) * elapsed;
            if (_onUpdate) {
                _onUpdate.call(callElem, currentValue);
            }
            if (elapsed === 1) {
                return false;
            }
            return true;
        };
        return Logic;
    }());
    var _isNonBrowserEnv = 'tabris' in globalEnv || 'tabris' in root || 'tezNative' in globalEnv || 'tezNative' in root;
    var _document = _isNonBrowserEnv || !root.document ? {} : root.document;
    var _isTouchSimulate = 'ontouchend' in _document.body || root.DocumentTouch || navigator.maxTouchPoints > 0 || root.navigator.msMaxTouchPoints > 0;
    var _isReal3DTouch = 'ontouchforcechange' in _document.body || 'onwebkitontouchforcechange' in _document.body;
    var getTouch = function (e, targ, changed) {
        var touches = changed ? e.changedTouches : e.touches;
        if (touches) {
            var i = 0;
            var maxLen = touches.length;
            while (i < maxLen) {
                if (!!touches[i] && touches[i].target === targ) {
                    return touches[i];
                }
                i++;
            }
        }
        return null;
    };
    var Forceify = /** @class */ (function () {
        function Forceify(el) {
            var forceifyID = 0;
            if (!el.forceifyQueueId) {
                forceifyID = el.forceifyQueueId = Math.floor(Date.now() + (Math.random() * 1000));
            }
            else {
                forceifyID = el.forceifyQueueId;
            }
            this.id = forceifyID;
            this._callback = null;
            this.el = el;
            this._pressDuration = 200;
            this._leaveDurationTolerance = 0.35;
            this._leaveDuration = this._pressDuration * this._leaveDurationTolerance;
            this._delay = 400;
            this._eventPress = null;
            this._eventLeave = null;
            this._eventUp = null;
            this._checkResult = null;
            this._useSameDurInLeave = false;
            this._isIOS9RealTouchDevices = false;
            this._resetOnLeave = true;
            this.el = el;
            return this;
        }
        Forceify.prototype.getEnv = function () {
            return this._checkResult;
        };
        Forceify.prototype.resetOnLeave = function (state) {
            if (state === void 0) { state = true; }
            this._resetOnLeave = state;
            return this;
        };
        Forceify.prototype.useLongPressEqualDuration = function (state) {
            if (state === void 0) { state = true; }
            this._useSameDurInLeave = state;
            return this;
        };
        Forceify.prototype.setLongPressLeaveTolerance = function (amount) {
            this._leaveDurationTolerance = amount;
            this._leaveDuration = this._pressDuration * amount;
            return this;
        };
        Forceify.prototype.setLongPressDelay = function (amount) {
            this._delay = amount;
            return this;
        };
        Forceify.prototype.setLongPressDuration = function (amount) {
            this._pressDuration = amount;
            this._leaveDuration = amount * this._leaveDurationTolerance;
            return this;
        };
        Forceify.prototype.onForce = function (fn) {
            this._callback = fn;
            return this.init();
        };
        Forceify.prototype.on = function (eventName, callbackListener, capture) {
            if (_isNonBrowserEnv) {
                this.el.on(eventName, callbackListener);
            }
            else if (root.addEventListener) {
                this.el.addEventListener(eventName, callbackListener, capture);
            }
            else if (root.attachEvent) {
                this.el.attachEvent('on' + eventName, callbackListener);
            }
            else {
                this.el['on' + eventName] = callbackListener;
            }
            return this;
        };
        Forceify.prototype.preventTouchCallout = function () {
            var el = this.el;
            var touchCallout = ['webkitTouchCallout', 'MozTouchCallout', 'msTouchCallout', 'khtmlUserSelect', 'touchCallout', 'webkitUserSelect', 'MozUserSelect', 'msUserSelect', 'khtmlUserSelect', 'userSelect', 'webkitUserDrag', 'MozUserDrag', 'msUserDrag', 'khtmlUserDrag', 'userDrag', 'webkitTouchAction', 'mozTouchAction', 'msTouchAction', 'khtmlTouchAction', 'touchAction'];
            var touchCalloutLen = touchCallout.length;
            var i = 0;
            for (; i < touchCalloutLen; i++) {
                var property = touchCallout[i];
                if (property in el.style) {
                    el.style[property] = 'none';
                }
            }
            return this;
        };
        Forceify.prototype.handleForceChange = function (e) {
            if (e.preventDefault) {
                e.preventDefault();
            }
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            var force = e.webkitForce !== undefined ? e.webkitForce / 3 : e.force !== undefined ? e.force : undefined;
            if (force === undefined) {
                var touches = getTouch(e, this.el, true);
                if (touches.force !== undefined) {
                    force = touches.force;
                }
                else if (touches.webkitForce) {
                    force = touches.force;
                }
            }
            e.force = force;
            this._callback.call(this, e);
            return false;
        };
        Forceify.prototype.init = function () {
            var _this = this;
            var el = this.el;
            var isPointerSupported = 'onpointerdown' in el;
            this.preventTouchCallout();
            if ('onwebkitmouseforcebegin' in el) {
                this.on('webkitmouseforcebegin', function (e) { return _this.handleForceChange(e); });
                this.on('webkitmouseforcechanged', function (e) { return _this.handleForceChange(e); });
                this.on('mouseup', function (e) {
                    e.webkitForce = 0;
                });
                this._checkResult = 'macOSForce';
                return this;
            }
            else if (_isReal3DTouch) {
                this.on('touchforcebegin', function (e) { return _this.handleForceChange(e); });
                this.on('touchforcechange', function (e) { return _this.handleForceChange(e); });
                this.on(isPointerSupported ? 'pointerup' : 'touchend', function (e) {
                    e.force = 0;
                    // bug here
                });
                this._checkResult = 'iOSForce';
                return this;
            }
            else if (isPointerSupported) {
                this._eventPress = 'pointerdown';
                this._eventLeave = 'pointerleave';
                this._eventUp = 'pointerup';
                this._checkResult = root.chrome ? 'Chrome' : 'Modern';
            }
            else if ('onmspointerdown' in el) {
                this._eventPress = 'mspointerdown';
                this._eventLeave = 'mspointerleave';
                this._eventUp = 'mspointerup';
                this._checkResult = root.chrome ? 'Chrome' : 'Modern';
            }
            else if (_isTouchSimulate) {
                this._eventPress = 'touchstart';
                this._eventLeave = 'touchleave';
                this._eventUp = 'touchend';
                this._checkResult = root.chrome ? 'ChromeMobile' : 'Touch';
            }
            else if ('onmousedown' in el) {
                this._eventPress = 'mousedown';
                this._eventLeave = 'mouseup';
                this._eventUp = 'mouseleave';
                this._checkResult = root.chrome ? 'Chrome' : 'Desktop';
            }
            this.isPressed = false;
            return this.handleSimulate();
        };
        Forceify.prototype.isChrome = function () {
            return this._checkResult === 'Chrome' || this._checkResult === 'ChromeMobile';
        };
        Forceify.prototype.isMacOSForceTouch = function () {
            return this._checkResult === 'macOSForce';
        };
        Forceify.prototype.isIOS3DTouch = function () {
            return this._checkResult === 'iOSForce';
        };
        Forceify.prototype.isTouch = function () {
            return this._checkResult === 'Touch';
        };
        Forceify.prototype.isMouse = function () {
            return this._checkResult === 'Desktop';
        };
        Forceify.prototype.handleLeave = function () {
            var _a = this, _simulatedCallback = _a._simulatedCallback, _useSameDurInLeave = _a._useSameDurInLeave, _pressDuration = _a._pressDuration, _leaveDuration = _a._leaveDuration, forceifyID = _a.id, el = _a.el;
            if (_simulatedCallback) {
                _simulatedCallback.duration(_useSameDurInLeave ? _pressDuration : _leaveDuration).delay(0).restart(true);
            }
            return this;
        };
        Forceify.prototype.handlePress = function () {
            var _a = this, _simulatedCallback = _a._simulatedCallback, _useSameDurInLeave = _a._useSameDurInLeave, _pressDuration = _a._pressDuration, _delay = _a._delay, forceifyID = _a.id, el = _a.el;
            if (_simulatedCallback) {
                _simulatedCallback.duration(_pressDuration).delay(_delay).start();
            }
            return this;
        };
        Forceify.prototype.handleIOS9ForceTouch = function (_forceValue) {
            var _this = this;
            var eventType = 'touchmove';
            var _a = this, _simulatedCallback = _a._simulatedCallback, _isIOS9RealTouchDevices = _a._isIOS9RealTouchDevices, _callback = _a._callback, el = _a.el;
            if (!_isIOS9RealTouchDevices || !_simulatedCallback) {
                return this;
            }
            _forceValue.force = 0;
            _simulatedCallback.onUpdate(function () {
                _callback.call(_this, _forceValue);
            });
            this.on(eventType, function (e) {
                e.preventDefault();
                e.stopPropagation();
                var touches = getTouch(e, el);
                if (touches === null) {
                    return false;
                }
                var force = touches.force !== undefined ? touches.force : touches.webkitForce !== undefined ? touches.webkitForce : -1;
                if (force === -1) {
                    return false;
                }
                _forceValue.force = force;
                return false;
            });
            return this;
        };
        Forceify.prototype.handleSimulate = function () {
            var _this = this;
            var _a = this, _simulatedCallback = _a._simulatedCallback, _isIOS9RealTouchDevices = _a._isIOS9RealTouchDevices, _eventPress = _a._eventPress, _eventUp = _a._eventUp, _eventLeave = _a._eventLeave, isPressed = _a.isPressed, _callback = _a._callback, forceifyID = _a.id, el = _a.el;
            if (!_simulatedCallback) {
                _simulatedCallback = this._simulatedCallback = new Logic(forceifyID, el);
            }
            if (_simulatedCallback) {
                _simulatedCallback.onUpdate(_callback);
            }
            // LONG PRESS
            this.on(_eventPress, function (e) {
                if (!isPressed) {
                    if (e.type === _eventPress) {
                        if (e.preventDefault) {
                            e.preventDefault();
                        }
                        if (e.stopPropagation) {
                            e.stopPropagation();
                        }
                        if (_isTouchSimulate && !_isReal3DTouch && !_isIOS9RealTouchDevices) {
                            var touches = getTouch(e, el);
                            if (touches) {
                                if (touches.force !== undefined || touches.webkitForce !== undefined) {
                                    _this._isIOS9RealTouchDevices = _isIOS9RealTouchDevices = true;
                                    _this.handleIOS9ForceTouch(e);
                                }
                            }
                        }
                        _this.handlePress();
                        isPressed = _this.isPressed = true;
                    }
                }
                return false;
            });
            // LEAVE
            var leaveListener = function (e) {
                if (isPressed) {
                    if (e.type === _eventUp || (e.type === _eventLeave && _this._resetOnLeave)) {
                        if (e.preventDefault) {
                            e.preventDefault();
                        }
                        if (e.stopPropagation) {
                            e.stopPropagation();
                        }
                        _this.handleLeave();
                        isPressed = _this.isPressed = false;
                    }
                }
                return false;
            };
            this.on(_eventUp, leaveListener);
            this.on(_eventLeave, leaveListener);
            return this;
        };
        Forceify.__esModule = true;
        return Forceify;
    }());
    return Forceify;
}));

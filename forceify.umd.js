(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Forceify = factory());
}(this, (function () { 'use strict';

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  var tasks = [];
  var id = {};
  /* Small shim for lighter size */

  var last = Date.now();
  var reqAnimFrame = typeof requestAnimationFrame !== 'undefined' ? requestAnimationFrame : function (fn) {
    return setTimeout(function () {
      return fn(Date.now() - last);
    }, 50);
  };
  var cancelAnimFrame = typeof cancelAnimationFrame !== 'undefined' ? cancelAnimationFrame : function (fn) {
    return clearTimeout(fn);
  };

  if ((typeof performance === "undefined" ? "undefined" : _typeof(performance)) === 'object' && !performance.now) {
    performance.now = function () {
      return Date.now() - last;
    };
  }

  var now = function now() {
    return typeof performance !== 'undefined' && !!performance.now ? performance.now() : Date.now() - last;
  };

  var root = typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : typeof exports !== 'undefined' ? exports : this;
  reqAnimFrame(function update(time) {
    reqAnimFrame(update);
    var i = 0;

    while (i < tasks.length) {
      var task = tasks[i];

      if (task.update(time)) {
        i++;
      } else {
        tasks.splice(i, 1);
      }
    }
  });

  var _default = function _default(value, def) {
    if (value === null || value === undefined) {
      return def;
    }

    return value;
  };

  var _id = 0;

  var Logic =
  /*#__PURE__*/
  function () {
    function Logic(queueID, elem, self) {
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

    var _proto = Logic.prototype;

    _proto.duration = function duration(amount) {
      this._duration = amount;
      return this;
    };

    _proto.start = function start() {
      var _queueID = this._queueID,
          _delayTime = this._delayTime,
          currentValue = this.currentValue;
      var queue = id[_queueID];

      if (queue) {
        var i = 0,
            queueItem;

        while (queueItem = queue.shift()) {
          var idx = tasks.indexOf(queueItem);

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
    };

    _proto.delay = function delay(amount) {
      this._delayTime = amount;
      return this;
    };

    _proto.onUpdate = function onUpdate(callback) {
      this._onUpdate = callback;
      return this;
    };

    _proto.restart = function restart(asReverse) {
      var _queueID = this._queueID,
          _delayTime = this._delayTime,
          currentValue = this.currentValue;
      var i = tasks.indexOf(this);

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
    };

    _proto.update = function update(time) {
      var _startTime = this._startTime,
          _duration = this._duration,
          _onUpdate = this._onUpdate,
          currentValue = this.currentValue,
          startValue = this.startValue,
          endValue = this.endValue,
          callElem = this.callElem,
          __self = this.__self;

      if (time < _startTime) {
        return true;
      }

      var elapsed = (time - _startTime) / _duration;
      elapsed = elapsed > 1 ? 1 : elapsed;
      currentValue.force = __self.__force !== undefined && __self.__force !== 0 && __self.__force !== 1 ? __self.__force : startValue + (endValue - startValue) * elapsed;

      if (_onUpdate) {
        _onUpdate.call(callElem, currentValue);
      }

      if (elapsed === 1) {
        return false;
      }

      return true;
    };

    return Logic;
  }();

  var navig = typeof navigator !== 'undefined' ? navigator : {
    userAgent: '',
    maxTouchPoints: 0,
    msMaxTouchPoints: 0
  };
  var ua = navig.userAgent;

  var _isIOSDevices = ua.indexOf('; CPU') !== -1 && ua.indexOf(' like Mac') !== -1;

  var _document = !root.document ? {} : root.document;

  var _isTouchSimulate = _document.body && 'ontouchend' in _document.body || root.DocumentTouch || navig.maxTouchPoints > 0 || navig.msMaxTouchPoints > 0;

  var _isReal3DTouch = _document.body && 'ontouchforcechange' in _document.body && _isIOSDevices;

  var getTouch = function getTouch(e, targ, changed) {
    var touches = changed ? e.touches : e.changedTouches;

    if (touches) {
      var i = 0;
      var maxLen = touches.length;

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

  var Forceify =
  /*#__PURE__*/
  function () {
    function Forceify(_el, params) {
      var _this = this;

      if (params === void 0) {
        params = {};
      }

      _defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(this, "getEnv", function () {
        return _this._checkResult;
      }), "resetOnLeave", function (state) {
        if (state === void 0) {
          state = true;
        }

        _this._resetOnLeave = state;
        return _this;
      }), "useLongPressEqualDuration", function (state) {
        if (state === void 0) {
          state = true;
        }

        _this._useSameDurInLeave = state;
        return _this;
      }), "setLongPressLeaveTolerance", function (amount) {
        _this._leaveDurationTolerance = amount;
        _this._leaveDuration = _this._pressDuration * amount;
        return _this;
      }), "setLongPressDelay", function (amount) {
        _this._delay = amount;
        return _this;
      }), "setLongPressDuration", function (amount) {
        _this._pressDuration = amount;
        _this._leaveDuration = amount * _this._leaveDurationTolerance;
        return _this;
      }), "onForce", function (fn) {
        _this._callback = fn;
        return _this.init();
      }), "on", function (eventName, callbackListener, capture) {
        if (root.addEventListener) {
          _this.el.addEventListener(eventName, callbackListener, capture);
        } else if (root.attachEvent) {
          _this.el.attachEvent('on' + eventName, callbackListener);
        } else {
          _this.el['on' + eventName] = callbackListener;
        }

        return _this;
      }), "off", function (eventName, callbackListener, capture) {
        if (root.removeEventListener) {
          _this.el.removeEventListener(eventName, callbackListener, capture);
        } else if (root.detachEvent) {
          _this.el.detachEvent('on' + eventName, callbackListener);
        } else {
          _this.el['on' + eventName] = null;
        }

        return _this;
      }), "preventTouchCallout", function () {
        var el = _this.el;
        var touchCallout = ['webkitTouchCallout', 'MozTouchCallout', 'msTouchCallout', 'khtmlUserSelect', 'touchCallout', 'webkitUserSelect', 'MozUserSelect', 'msUserSelect', 'khtmlUserSelect', 'userSelect', 'webkitUserDrag', 'MozUserDrag', 'msUserDrag', 'khtmlUserDrag', 'userDrag'];

        for (var _i = 0; _i < touchCallout.length; _i++) {
          var property = touchCallout[_i];

          if (property in el.style) {
            el.style[property] = 'none';
          }
        }

        var touchActions = ['webkitTouchAction', 'mozTouchAction', 'msTouchAction', 'khtmlTouchAction', 'touchAction'];

        for (var _i2 = 0; _i2 < touchActions.length; _i2++) {
          var _property = touchActions[_i2];

          if (_property in el.style) {
            el.style[_property] = 'manipulation';
          }
        }

        return _this;
      }), "handleForceChange", function (e) {
        if (e.preventDefault) {
          e.preventDefault();
        }

        if (e.stopPropagation) {
          e.stopPropagation();
        }

        _this._iterateOfHandleForceChange++;
        var force = e.webkitForce !== undefined ? e.webkitForce / 3 : e.force !== undefined ? e.force : undefined;

        if (force === undefined) {
          var touches = getTouch(e, _this.el, true);

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
        _this.__force = force;
        _this._calledTimeout = true;

        _this._callback.call(_this, e);

        return false;
      }), "init", function () {
        var el = _this.el,
            polyfill = _this.polyfill;
        var isPointerSupported = 'onpointerdown' in el;
        var __self$1 = _this;
        _this._iterateOfHandleForceChange = 0;
        var tickForce;
        var perfNow;
        var currentEvent;

        var renderUntilBecomeZero = function renderUntilBecomeZero(time) {
          var __force = _this.__force;

          var force = (1 - Math.min((time - perfNow) / _this._leaveDuration, 1)) * __force;

          if (force > 0) {
            tickForce = reqAnimFrame(renderUntilBecomeZero);
          } else if (force === 0) {
            cancelAnimFrame(tickForce);
          }

          currentEvent.force = force;
          _this.__force = force;

          _this.handleForceChange(currentEvent);
        };

        _this.preventTouchCallout();

        if ('onwebkitmouseforcebegin' in el) {
          var _touchTicks = 0;
          var tick;

          _this.on('onwebkitmouseforcechange', _this.handleForceChange);

          _this.on('onwebkitmouseforcebegin', function checkForceTouch(e) {
            _touchTicks++;
            clearTimeout(tick);
            tick = setTimeout(function () {
              __self$1.off('onwebkitmouseforcebegin', checkForceTouch);
            }, 25);
          });

          _this.on('mousedown', function checkForceTouchVerify(e) {
            clearTimeout(tick);
            tick = setTimeout(function checkVerify() {
              if (_touchTicks === 0 && __self$1._iterateOfHandleForceChange === 0 && polyfill) {
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

          _this.on('mouseup', function onMousUp(e) {
            var force = __self$1.__force,
                _iterateOfHandleForceChange = __self$1._iterateOfHandleForceChange;
            currentEvent = e;

            if (force > 0 && _iterateOfHandleForceChange > 1) {
              perfNow = performance.now();
              tickForce = reqAnimFrame(renderUntilBecomeZero);
            } else {
              __self$1.off('mouseup', onMousUp);
            }
          });

          _this._checkResult = 'macOSForce';
          return _this;
        } else if (_isReal3DTouch) {
          var _touchTicks2 = 0;

          var _tick;

          _this.on('touchforcechange', _this.handleForceChange);

          _this.on('touchforcebegin', function check3DTouch(e) {
            _touchTicks2++;
            clearTimeout(_tick);
            _tick = setTimeout(function () {
              __self$1.off('touchforcebegin', check3DTouch);
            }, 25);
          });

          _this.on('touchstart', function check3DTouchVerify(e) {
            clearTimeout(_tick);
            _tick = setTimeout(function checkVerify() {
              if (_touchTicks2 === 0 && __self$1._iterateOfHandleForceChange === 0 && polyfill) {
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

          _this.on('touchend', function onTouchEnd(e) {
            var force = __self$1.__force,
                _iterateOfHandleForceChange = __self$1._iterateOfHandleForceChange;
            currentEvent = e;

            if (force > 0 && _iterateOfHandleForceChange > 1) {
              perfNow = performance.now();
              tickForce = reqAnimFrame(renderUntilBecomeZero);
            } else {
              __self$1.off('touchend', onTouchEnd);
            }
          });

          _this._checkResult = 'iOSForce';
          return _this;
        } else if (polyfill && isPointerSupported) {
          _this._eventPress = 'pointerdown';
          _this._eventLeave = 'pointerleave';
          _this._eventUp = 'pointerup';
          _this._checkResult = root.chrome ? 'Chrome' : 'Modern';
        } else if (polyfill && 'onmspointerdown' in el) {
          _this._eventPress = 'mspointerdown';
          _this._eventLeave = 'mspointerleave';
          _this._eventUp = 'mspointerup';
          _this._checkResult = root.chrome ? 'Chrome' : 'Modern';
        } else if (polyfill && _isTouchSimulate) {
          _this._eventPress = 'touchstart';
          _this._eventLeave = 'touchleave';
          _this._eventUp = 'touchend';
          _this._checkResult = root.chrome ? 'ChromeMobile' : 'Touch';
        } else if (polyfill && 'onmousedown' in el) {
          _this._eventPress = 'mousedown';
          _this._eventLeave = 'mouseup';
          _this._eventUp = 'mouseleave';
          _this._checkResult = root.chrome ? 'Chrome' : 'Desktop';
        }

        _this.isPressed = false;
        return _this.handleSimulate();
      }), "handleLeave", function () {
        var _simulatedCallback = _this._simulatedCallback,
            _useSameDurInLeave = _this._useSameDurInLeave,
            _pressDuration = _this._pressDuration,
            _leaveDuration = _this._leaveDuration,
            forceifyID = _this.id,
            el = _this.el;

        if (_simulatedCallback) {
          _simulatedCallback.duration(_useSameDurInLeave ? _pressDuration : _leaveDuration).delay(0).restart(true);
        }

        return _this;
      }), "handlePress", function () {
        var _simulatedCallback = _this._simulatedCallback,
            _useSameDurInLeave = _this._useSameDurInLeave,
            _pressDuration = _this._pressDuration,
            _delay = _this._delay,
            forceifyID = _this.id,
            el = _this.el;

        if (_simulatedCallback) {
          _simulatedCallback.duration(_pressDuration).delay(_delay).start();
        }

        return _this;
      }), "handleSimulate", function () {
        var _simulatedCallback = _this._simulatedCallback,
            _eventPress = _this._eventPress,
            _eventUp = _this._eventUp,
            _eventLeave = _this._eventLeave,
            isPressed = _this.isPressed,
            _callback = _this._callback,
            forceifyID = _this.id,
            el = _this.el;

        if (!_simulatedCallback) {
          _simulatedCallback = _this._simulatedCallback = new Logic(forceifyID, el, _this);
        }

        if (_simulatedCallback) {
          _simulatedCallback.onUpdate(_callback);
        } // LONG PRESS


        _this.on(_eventPress, function (e) {
          if (!isPressed && !_isReal3DTouch) {
            if (e.type === _eventPress) {
              if (e.preventDefault) {
                e.preventDefault();
              }

              if (e.stopPropagation) {
                e.stopPropagation();
              }

              _this.handlePress();

              isPressed = _this.isPressed = true;
            }
          }

          return false;
        }); // LEAVE


        var leaveListener = function leaveListener(e) {
          if (isPressed) {
            if (e.type === _eventUp || e.type === _eventLeave && _this._resetOnLeave) {
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

        _this.on(_eventUp, leaveListener);

        _this.on(_eventLeave, leaveListener);

        return _this;
      });

      var _forceifyID = 0;

      if (!_el.forceifyQueueId) {
        _forceifyID = _el.forceifyQueueId = Math.floor(Date.now() + Math.random() * 1000);
      } else {
        _forceifyID = _el.forceifyQueueId;
      }

      this.id = _forceifyID;
      this._callback = null;
      this.el = _el;
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
      this.el = _el;
      this.polyfill = _default(params.polyfill, true);
      return this;
    }

    var _proto2 = Forceify.prototype;

    _proto2.isChrome = function isChrome() {
      return this._checkResult === 'Chrome' || this._checkResult === 'ChromeMobile';
    };

    _proto2.isMacOSForceTouch = function isMacOSForceTouch() {
      return this._checkResult === 'macOSForce';
    };

    _proto2.isIOS3DTouch = function isIOS3DTouch() {
      return this._checkResult === 'iOSForce';
    };

    _proto2.isTouch = function isTouch() {
      return this._checkResult === 'Touch';
    };

    _proto2.isMouse = function isMouse() {
      return this._checkResult === 'Desktop';
    };

    return Forceify;
  }();

  return Forceify;

})));

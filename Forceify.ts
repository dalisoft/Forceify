declare let define: any
declare let module: any
declare let global: any
declare let exports: any

(function (root: any, factory: Function) {
    if (typeof define === 'function' && define.amd) {
        define([], () => factory(root))
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory(root)
    } else {
        root.Forceify = factory(root)
    }
}
    (typeof (window) !== 'undefined' ? window : this, function (root) {

        let tasks = []
        let id = {}

        /* Small shim for lighter size */
        let last: number = Date.now()
        let reqAnimFrame = typeof (requestAnimationFrame) !== 'undefined' ? requestAnimationFrame : (fn) => setTimeout(() => fn(Date.now() - last), 17)
        if (typeof performance === 'object' && !performance.now) {
            performance.now = () => Date.now() - last
        }
        let now: Function = () => {
            return typeof performance !== 'undefined' && !!performance.now ? performance.now() : Date.now() - last
        }

        let globalEnv = typeof (global) !== 'undefined' ? global : typeof (window) !== 'undefined' ? window : typeof (exports) !== 'undefined' ? exports : this

        reqAnimFrame(function update(time: number): void {
            reqAnimFrame(update)
            let i = 0
            while (i < tasks.length) {
                let task = tasks[i]
                if (task.update(time)) {
                    i++
                } else {
                    tasks.splice(i, 1)
                }
            }
        })

        interface forceType {
            force: number
            target?: any
        }

        let _id: number = 0
        class Logic {
            public currentValue: forceType
            public startValue: number
            private _queueID: number
            private _onUpdate: any
            private _delayTime: number
            private _duration: number
            private _startTime: number
            private endValue: number
            private callElem: any
            private _id: number
            constructor(queueID: number, elem) {
                this._queueID = queueID
                this._onUpdate = null
                this._duration = 200
                this._delayTime = 0
                this._startTime = null
                this._id = _id++
                this.startValue = 0
                this.currentValue = {
                    force: 0,
                    target: elem
                }
                this.endValue = 1
                this.callElem = elem
            }
            duration(amount: number) {
                this._duration = amount
                return this
            }
            start() {

                const {
                    _queueID,
                    _delayTime,
                    currentValue
                } = this

                let queue = id[_queueID]
                if (queue) {
                    let i = 0,
                        queueItem
                    while (queueItem = queue.shift()) {
                        let idx = tasks.indexOf(queueItem)
                        if (idx > -1) {
                            tasks.splice(i, 1)
                        }
                    }
                } else {
                    queue = id[_queueID] = []
                }

                this.startValue = currentValue.force
                this.endValue = 1

                queue.push(this)
                tasks.push(this)

                this._startTime = now() + this._delayTime
                return this
            }
            delay(amount: number) {
                this._delayTime = amount
                return this
            }
            onUpdate(callback: Function) {
                this._onUpdate = callback
                return this
            }
            restart(asReverse?: boolean) {
                let {
                    _queueID,
                    _delayTime,
                    currentValue
                } = this
                let i = tasks.indexOf(this)
                if (i === -1) {
                    this.start()
                } else {
                    this._startTime = now() + _delayTime
                }
                if (asReverse) {
                    this.startValue = currentValue.force
                    this.endValue = 0
                }
                return this
            }
            update(time: number): boolean {

                let {
                    _startTime,
                    _duration,
                    _onUpdate,
                    currentValue,
                    startValue,
                    endValue,
                    callElem
                } = this

                if (time < _startTime) {
                    return true
                }

                let elapsed = (time - _startTime) / _duration
                elapsed = elapsed > 1 ? 1 : elapsed

                currentValue.force = startValue + (endValue - startValue) * elapsed

                if (_onUpdate) {
                    _onUpdate.call(callElem, currentValue)
                }

                if (elapsed === 1) {
                    return false
                }

                return true
            }
        }

        let _isNonBrowserEnv = 'tabris' in globalEnv || 'tabris' in root || 'tezNative' in globalEnv || 'tezNative' in root
		let _document = _isNonBrowserEnv || !root.document ? {} : root.document
        let _isTouchSimulate = 'ontouchend' in _document.body || root.DocumentTouch || navigator.maxTouchPoints > 0 || root.navigator.msMaxTouchPoints > 0
        let _isReal3DTouch = 'ontouchforcechange' in _document.body || 'onwebkitontouchforcechange' in _document.body

        const getTouch = (e: any, targ: any, changed?: boolean) => {
            let touches = changed ? e.changedTouches : e.touches
            if (touches) {
                let i = 0
                const maxLen = touches.length
                while (i < maxLen) {
                    if (!!touches[i] && touches[i].target === targ) {
                        return touches[i]
                    }
                    i++
                }
            }
            return null
        }

        class Forceify {
            private id: number
            private _callback: any
            private el: any
            private _pressDuration: number
            private _leaveDurationTolerance: number
            private _leaveDuration: number
            private _delay: number
            private _eventPress: string
            private _eventLeave: string
            private _eventUp: string
            private isPressed: boolean
            private _simulatedCallback: Logic
            private _checkResult: string
            private _useSameDurInLeave: boolean
            private _resetOnLeave: boolean
            private _isIOS9RealTouchDevices: boolean
			private __forceValue: number
            public static RegisterNode: any
			public static __esModule: boolean = true
            constructor(el) {
                let forceifyID = 0
                if (!el.forceifyQueueId) {
                    forceifyID = el.forceifyQueueId = Math.floor(Date.now() + (Math.random() * 1000))
                } else {
                    forceifyID = el.forceifyQueueId
                }
                this.id = forceifyID
                this._callback = null
                this.el = el
                this._pressDuration = 200
                this._leaveDurationTolerance = 0.35
                this._leaveDuration = this._pressDuration * this._leaveDurationTolerance
                this._delay = 400
                this._eventPress = null
                this._eventLeave = null
                this._eventUp = null
                this._checkResult = null
                this._useSameDurInLeave = false
                this._isIOS9RealTouchDevices = false
                this._resetOnLeave = true
				this._simulatedCallback = new Logic(forceifyID, el)
                return this
            }
            getEnv() {
                return this._checkResult
            }
            resetOnLeave(state: boolean = true) {
                this._resetOnLeave = state
                return this
            }
            useLongPressEqualDuration(state: boolean = true) {
                this._useSameDurInLeave = state
                return this
            }
            setLongPressLeaveTolerance(amount: number) {
                this._leaveDurationTolerance = amount
                this._leaveDuration = this._pressDuration * amount
                return this
            }
            setLongPressDelay(amount: number) {
                this._delay = amount
                return this
            }
            setLongPressDuration(amount: number) {
                this._pressDuration = amount
                this._leaveDuration = amount * this._leaveDurationTolerance
                return this
            }
            onForce(fn: Function) {
                this._callback = fn
                return this.init()
            }
            on(eventName: string, callbackListener: Function, capture?: any) {
                if (_isNonBrowserEnv) {
                    this.el.on(eventName, callbackListener)
                } else if (root.addEventListener) {
                    this.el.addEventListener(eventName, callbackListener, capture)
                } else if (root.attachEvent) {
                    this.el.attachEvent('on' + eventName, callbackListener)
                } else {
                    this.el['on' + eventName] = callbackListener
                }
                return this
            }
            preventTouchCallout() {
                const el = this.el
                const touchCallout = ['webkitTouchCallout', 'MozTouchCallout', 'msTouchCallout', 'khtmlUserSelect', 'touchCallout', 'webkitUserSelect', 'MozUserSelect', 'msUserSelect', 'khtmlUserSelect', 'userSelect', 'webkitUserDrag', 'MozUserDrag', 'msUserDrag', 'khtmlUserDrag', 'userDrag', 'webkitTouchAction', 'mozTouchAction', 'msTouchAction', 'khtmlTouchAction', 'touchAction']
                const touchCalloutLen = touchCallout.length
                let i = 0
                for (; i < touchCalloutLen; i++) {
                    const property = touchCallout[i]
                    if (property in el.style) {
                        el.style[property] = 'none'
                    }
                }
                return this
            }
            handleForceChange(e: any) {
                if (e.preventDefault) {
                    e.preventDefault()
                }
                if (e.stopPropagation) {
                    e.stopPropagation()
                }
				let force = e.webkitForce !== undefined ? e.webkitForce / 3 : e.force !== undefined ? e.force : undefined
                if (force === undefined) {
                    let touches = getTouch(e, this.el, true)

                    if (touches.force !== undefined) {
                        force = touches.force
                    } else if (touches.webkitForce) {
                        force = touches.force
                    }
                }
				e.force = force
				this.__forceValue = force
				this._simulatedCallback.currentValue.force = force
                this._callback.call(this, e)
                return false
            }
			handleForceEnd (e: any) {
				const {
                    _simulatedCallback,
                    _useSameDurInLeave,
                    _pressDuration,
                    _leaveDuration,
					_callback
                } = this
                if (_simulatedCallback) {
					this._simulatedCallback.startValue = this._simulatedCallback.currentValue.force
                    _simulatedCallback.onUpdate(_callback).duration(_useSameDurInLeave ? _pressDuration : _leaveDuration).delay(0).restart(true)
                }
				return this
			}
            init() {
				const { el, _simulatedCallback, _callback } = this
				const isPointerSupported = 'onpointerdown' in el

                this.preventTouchCallout()

                if ('onwebkitmouseforcebegin' in el) {
					_simulatedCallback.onUpdate(_callback)
                    this.on('webkitmouseforcebegin', e => this.handleForceChange(e))
                    this.on('webkitmouseforcechanged', e => this.handleForceChange(e))
                    this.on('mouseup', e => this.handleForceEnd(e))
                    this._checkResult = 'macOSForce'
                    return this
                } else if ('onmouseforcebegin' in el) {
					_simulatedCallback.onUpdate(_callback)
                    this.on('mouseforcebegin', e => this.handleForceChange(e))
                    this.on('mouseforcechanged', e => this.handleForceChange(e))
                    this.on('mouseup', e => this.handleForceEnd(e))
                    this._checkResult = 'macOSForce'
                    return this
                } else if (_isReal3DTouch) {
					_simulatedCallback.onUpdate(null)
                    this.on('touchforcebegin', e => this.handleForceChange(e))
                    this.on('touchforcechange', e => this.handleForceChange(e))
                    this.on(isPointerSupported ? 'pointerup' : 'touchend', e => this.handleForceEnd(e))
                    this._checkResult = 'iOSForce'
                    return this
                } else if (isPointerSupported) {
                    this._eventPress = 'pointerdown'
                    this._eventLeave = 'pointerleave'
                    this._eventUp = 'pointerup'
                    this._checkResult = root.chrome ? 'Chrome' : 'Modern'
                } else if ('onmspointerdown' in el) {
                    this._eventPress = 'mspointerdown'
                    this._eventLeave = 'mspointerleave'
                    this._eventUp = 'mspointerup'
                    this._checkResult = root.chrome ? 'Chrome' : 'Modern'
                } else if (_isTouchSimulate) {
                    this._eventPress = 'touchstart'
                    this._eventLeave = 'touchleave'
                    this._eventUp = 'touchend'
                    this._checkResult = root.chrome ? 'ChromeMobile' : 'Touch'
                } else if ('onmousedown' in el) {
                    this._eventPress = 'mousedown'
                    this._eventLeave = 'mouseup'
                    this._eventUp = 'mouseleave'
                    this._checkResult = root.chrome ? 'Chrome' : 'Desktop'
                }
                this.isPressed = false
                return this.handleSimulate()
            }
            isChrome() {
                return this._checkResult === 'Chrome' || this._checkResult === 'ChromeMobile'
            }
            isMacOSForceTouch() {
                return this._checkResult === 'macOSForce'
            }
            isIOS3DTouch() {
                return this._checkResult === 'iOSForce'
            }
            isTouch() {
                return this._checkResult === 'Touch'
            }
            isMouse() {
                return this._checkResult === 'Desktop'
            }
            handleLeave() {
                const {
                    _simulatedCallback,
                    _useSameDurInLeave,
                    _pressDuration,
                    _leaveDuration
                } = this
                if (_simulatedCallback) {
                    _simulatedCallback.duration(_useSameDurInLeave ? _pressDuration : _leaveDuration).delay(0).restart(true)
                }
                return this
            }
            handlePress() {
                const {
                    _simulatedCallback,
                    _useSameDurInLeave,
                    _pressDuration,
                    _delay
                } = this
                if (_simulatedCallback) {
                    _simulatedCallback.duration(_pressDuration).delay(_delay).start()
                }
                return this
            }
            handleIOS9ForceTouch() {
                const eventType = 'touchmove'
                const {
                    _simulatedCallback,
                    _isIOS9RealTouchDevices,
                    _callback,
                    el
                } = this
                if (!_isIOS9RealTouchDevices || !_simulatedCallback) {
                    return this
                }
                let _forceValue = {
                    force: 0,
                    target: el
                }
                _simulatedCallback.onUpdate(() => {
                    _callback.call(this, _forceValue)
                })
                this.on(eventType, e => {
                    e.preventDefault()
                    e.stopPropagation()
                    let touches = getTouch(e, el)

                    if (touches === null) {
                        return false
                    }

                    let force = touches.force !== undefined ? touches.force : touches.webkitForce !== undefined ? touches.webkitForce : -1

                    if (force === -1) {
                        return false
                    }

                    _forceValue.force = force
                    return false

                })
                return this
            }
            handleSimulate() {
                let {
                    _simulatedCallback,
                    _isIOS9RealTouchDevices,
                    _eventPress,
                    _eventUp,
                    _eventLeave,
                    isPressed,
                    _callback,
                    id,
                    el
                } = this

                if (_simulatedCallback) {
                    _simulatedCallback.onUpdate(_callback)
                }

                // LONG PRESS
                this.on(_eventPress, e => {
                    if (!isPressed) {
                        if (e.type === _eventPress) {
                            if (e.preventDefault) {
                                e.preventDefault()
                            }
                            if (e.stopPropagation) {
                                e.stopPropagation()
                            }
                            if (_isTouchSimulate && !_isReal3DTouch && !_isIOS9RealTouchDevices) {
                                let touches = getTouch(e, el)
                                if (touches) {
                                    if (touches.force !== undefined || touches.webkitForce !== undefined) {
                                        this._isIOS9RealTouchDevices = _isIOS9RealTouchDevices = true
                                        this.handleIOS9ForceTouch()
                                    }
                                }
                            }
                            this.handlePress()
                            isPressed = this.isPressed = true
                        }
                    }
                    return false
                })

                // LEAVE
                const leaveListener = e => {
                    if (isPressed) {
                        if (e.type === _eventUp || (e.type === _eventLeave && this._resetOnLeave)) {
                            if (e.preventDefault) {
                                e.preventDefault()
                            }
                            if (e.stopPropagation) {
                                e.stopPropagation()
                            }
                            this.handleLeave()
                            isPressed = this.isPressed = false
                        }
                    }
                    return false
                }
                this.on(_eventUp, leaveListener)
                this.on(_eventLeave, leaveListener)

                return this
            }
        }

        return Forceify

    }))

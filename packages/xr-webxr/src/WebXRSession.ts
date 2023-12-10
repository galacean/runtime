import { IXRInputEvent, IXRSession } from "@galacean/engine-design";
import { getInputSource } from "./Util";
import { WebXRFrame } from "./WebXRFrame";

export class WebXRSession implements IXRSession {
  requestAnimationFrame: (callback: FrameRequestCallback) => number;
  cancelAnimationFrame: (id: number) => void;
  /** @internal */
  _onSessionExitCallBack: () => void;

  /** @internal */
  _platformSession: XRSession;
  /** @internal */
  _platformLayer: XRWebGLLayer;
  /** @internal */
  _platformReferenceSpace: XRReferenceSpace;

  private _frame: WebXRFrame;
  private _events: IXRInputEvent[] = [];
  private _screenPointers: XRInputSource[] = [];
  private _inputEventTypeMap: Record<string, number> = {
    // XRInputEventType.SelectStart
    selectstart: 0,
    // XRInputEventType.Select
    select: 1,
    // XRInputEventType.SelectEnd
    selectend: 2,
    // XRInputEventType.SqueezeStart
    squeezestart: 3,
    // XRInputEventType.Squeeze
    squeeze: 4,
    // XRInputEventType.SqueezeEnd
    squeezeend: 5
  };
  private _targetRayModeMap: Record<string, number> = {
    // XRTargetRayMode.Gaze
    gaze: 0,
    // XRTargetRayMode.TrackedPointer
    "tracked-pointer": 1,
    // XRTargetRayMode.Screen
    screen: 2
  };

  get frame(): WebXRFrame {
    return this._frame;
  }

  get framebuffer(): WebGLFramebuffer {
    return this._platformLayer.framebuffer;
  }

  get framebufferWidth(): number {
    return this._platformLayer.framebufferWidth;
  }

  get framebufferHeight(): number {
    return this._platformLayer.framebufferHeight;
  }

  get frameRate(): number {
    return this._platformSession.frameRate;
  }

  get supportedFrameRates(): Float32Array {
    return this._platformSession.supportedFrameRates;
  }

  get events(): IXRInputEvent[] {
    const { _events: events } = this;
    // Select event does not dispatch the move event, so we need to simulate dispatching the move here.
    const { _screenPointers: screenPointers } = this;
    for (let i = 0; i < screenPointers.length; i++) {
      const inputSource = screenPointers[i];
      if (!inputSource) continue;
      const { axes } = inputSource.gamepad;
      const event = {
        // XRInputEventType.Select
        type: 1,
        // XRTargetRayMode.Screen
        targetRayMode: 2,
        // XRTrackedInputDevice.Controller
        input: 0,
        id: i,
        x: axes[0],
        y: axes[1]
      };
      events.push(event);
    }
    return events;
  }

  constructor(session: XRSession, layer: XRWebGLLayer, referenceSpace: XRReferenceSpace) {
    this._frame = new WebXRFrame(this);
    this._platformSession = session;
    this._platformLayer = layer;
    this._platformReferenceSpace = referenceSpace;
    const xrRequestAnimationFrame = session.requestAnimationFrame.bind(session);
    const onFrame = function (time: number, frame: XRFrame, callback: FrameRequestCallback) {
      this._frame._platformFrame = frame;
      callback(time);
    }.bind(this);
    this.requestAnimationFrame = (callback: FrameRequestCallback) => {
      return xrRequestAnimationFrame((time: number, frame: XRFrame) => {
        onFrame(time, frame, callback);
      });
    };
    this.cancelAnimationFrame = session.cancelAnimationFrame.bind(session);
    this._onSessionEvent = this._onSessionEvent.bind(this);
    this._onSessionExit = this._onSessionExit.bind(this);
  }

  getFixedFoveation(): number {
    return this._platformLayer.fixedFoveation;
  }

  setFixedFoveation(value: number) {
    this._platformLayer.fixedFoveation = value;
  }

  start(): void {}

  stop(): void {
    this._frame._platformFrame = null;
  }

  end(): Promise<void> {
    this._frame._platformFrame = null;
    return this._platformSession.end();
  }

  setSessionExitCallBack(onSessionExitCallBack: () => void): void {
    this._onSessionExitCallBack = onSessionExitCallBack;
  }

  addEventListener(): void {
    const { _onSessionEvent: onSessionEvent, _platformSession: session } = this;
    session.addEventListener("select", onSessionEvent);
    session.addEventListener("selectstart", onSessionEvent);
    session.addEventListener("selectend", onSessionEvent);
    session.addEventListener("squeeze", onSessionEvent);
    session.addEventListener("squeezestart", onSessionEvent);
    session.addEventListener("squeezeend", onSessionEvent);
    session.addEventListener("end", this._onSessionExit);
  }

  removeEventListener(): void {
    const { _onSessionEvent: onSessionEvent, _platformSession: session } = this;
    session.removeEventListener("select", onSessionEvent);
    session.removeEventListener("selectstart", onSessionEvent);
    session.removeEventListener("selectend", onSessionEvent);
    session.removeEventListener("squeeze", onSessionEvent);
    session.removeEventListener("squeezestart", onSessionEvent);
    session.removeEventListener("squeezeend", onSessionEvent);
    session.addEventListener("end", this._onSessionExit);
    this._events.length = 0;
  }

  resetEvents(): void {
    this._events.length = 0;
  }

  private _onSessionExit(): void {
    if (this._onSessionExitCallBack) {
      this._onSessionExitCallBack();
      this._onSessionExitCallBack = null;
    }
  }

  private _onSessionEvent(inputSourceEvent: XRInputSourceEvent): void {
    const { inputSource } = inputSourceEvent;
    const event: IXRInputEvent = {
      type: this._inputEventTypeMap[inputSourceEvent.type],
      input: getInputSource(inputSource),
      targetRayMode: this._targetRayModeMap[inputSource.targetRayMode]
    };
    // XRTargetRayMode.Screen
    if (event.targetRayMode === 2) {
      const { _screenPointers: screenPointers } = this;
      const { axes } = inputSource.gamepad;
      event.x = axes[0];
      event.y = axes[1];
      switch (event.type) {
        // XRInputEventType.SelectStart
        case 0:
          let idx = -1;
          let emptyIdx = -1;
          for (let i = screenPointers.length - 1; i >= 0; i--) {
            const pointer = screenPointers[i];
            if (pointer === inputSource) {
              idx = i;
              break;
            }
            if (!pointer) {
              emptyIdx = i;
            }
          }
          if (idx === -1) {
            if (emptyIdx === -1) {
              idx = screenPointers.push(inputSource) - 1;
            } else {
              idx = emptyIdx;
              screenPointers[emptyIdx] = inputSource;
            }
          }
          event.id = idx;
          break;
        // XRInputEventType.SelectEnd
        case 2:
          for (let i = screenPointers.length - 1; i >= 0; i--) {
            if (screenPointers[i] === inputSource) {
              screenPointers[i] = null;
              event.id = i;
            }
          }
          break;
        default:
          break;
      }
    }
    this._events.push(event);
  }
}

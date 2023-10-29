import { IXRFeatureDescriptor, IXRFeatureManager } from "@galacean/engine-design";
import { Engine } from "../../Engine";
import { XRFeatureChangeFlag } from "./XRFeatureChangeFlag";
import { XRPlatformFeature } from "./XRPlatformFeature";

export abstract class XRFeatureManager<T extends IXRFeatureDescriptor> implements IXRFeatureManager {
  platformFeature: XRPlatformFeature;

  protected _engine: Engine;
  protected _descriptor: T;
  protected _enabled: boolean = true;

  /**
   * @readonly
   */
  get descriptor(): T {
    return this._descriptor;
  }

  set descriptor(value: T) {
    this._descriptor = value;
    this.platformFeature._onFeatureChange(XRFeatureChangeFlag.Descriptor, value);
  }

  get enabled(): boolean {
    return this._enabled;
  }

  set enabled(value: boolean) {
    if (this.enabled !== value) {
      this._enabled = value;
      value ? this._onEnable() : this._onDisable();
      this.platformFeature._onFeatureChange(XRFeatureChangeFlag.Enable, value);
    }
  }

  isSupported(descriptor?: IXRFeatureDescriptor): Promise<void> {
    return this.platformFeature._isSupported(descriptor || this._descriptor);
  }

  initialize(): Promise<void> {
    return this.platformFeature._initialize(this._descriptor);
  }

  constructor(engine: Engine) {
    this._engine = engine;
  }

  /**
   * @internal
   */
  _onEnable(): void {}

  /**
   * @internal
   */
  _onDisable(): void {}

  /**
   * @internal
   */
  _onUpdate(): void {}

  /**
   * @internal
   */
  _onSessionInit(): void {
    this.platformFeature._onSessionInit();
  }

  /**
   * @internal
   */
  _onSessionStart(): void {
    this.platformFeature._onSessionStart();
  }

  /**
   * @internal
   */
  _onFrameUpdate(): void {
    this.platformFeature._onUpdate();
  }

  /**
   * @internal
   */
  _onSessionStop(): void {
    this.platformFeature._onSessionStop();
  }

  /**
   * @internal
   */
  _onSessionDestroy(): void {
    this.platformFeature._onSessionDestroy();
  }

  /**
   * @internal
   */
  _onDestroy(): void {
    this.platformFeature._onDestroy();
  }
}

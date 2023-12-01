import { IXRFeature, IXRFeatureConfig, IXRFrame, IXRPlatformFeature, IXRSession } from "@galacean/engine-design";
import { XRManager } from "../XRManager";

/**
 * The base class of XR feature manager.
 */
export abstract class XRFeature<
  TConfig extends IXRFeatureConfig = IXRFeatureConfig,
  TFeature extends IXRPlatformFeature = IXRPlatformFeature
> implements IXRFeature
{
  _platformFeature: TFeature;
  protected _enabled: boolean = true;
  protected _config: TConfig;

  /**
   * Returns whether the feature is enabled.
   */
  get enabled(): boolean {
    return this._enabled;
  }

  set enabled(value: boolean) {
    if (this.enabled !== value) {
      this._enabled = value;
      value ? this.onEnable() : this.onDisable();
    }
  }

  /**
   * @internal
   */
  constructor(protected _xrManager: XRManager) {
    this.onEnable();
  }

  /**
   * Initialize the feature.
   * @returns The promise of the feature
   */
  initialize(): Promise<void> {
    return Promise.resolve();
  }

  /**
   * Called when be enabled.
   */
  onEnable(): void {}

  /**
   * Called when be disabled.
   */
  onDisable(): void {}

  /**
   * Called when xr frame is updated.
   * @param session - The xr session
   * @param frame - The xr frame
   */
  onUpdate(): void {}

  /**
   * Called when the session is initialized.
   */
  onSessionInit(): void {}

  /**
   * Called when session starts.
   */
  onSessionStart(): void {}

  /**
   * Called when the session is stopped.
   */
  onSessionStop(): void {}

  /**
   * Called when the session is destroyed.
   */
  onSessionDestroy(): void {}

  /**
   * Called when the xr module is destroyed.
   */
  onDestroy(): void {}

  /**
   * @internal
   * Returns whether the feature is supported.
   * @returns The promise of the feature
   */
  _isSupported(): Promise<void> {
    if (this._platformFeature) {
      return this._platformFeature.isSupported(this._generateConfig());
    } else {
      return Promise.resolve();
    }
  }

  /**
   * @internal
   * @returns The config of the feature
   */
  _generateConfig(): TConfig {
    return this._config;
  }
}

/**
 * Tools for get time information.
 */
export class Time {
  /** @internal */
  _frameCount: number = 0;

  private _clock: { now: () => number };
  private _time: number;
  private _timeScale: number;
  private _deltaTime: number;
  private _lastSystemTime: number;

  /*
   * The total number of frames since the start of the engine.
   */
  get frameCount(): number {
    return this._frameCount;
  }

  /**
   * The interval in seconds from the last frame to the current frame.
   */
  get deltaTime(): number {
    return this._deltaTime;
  }

  /**
   * The unscaled interval in seconds from the last frame to the current frame.
   */
  get unscaledDeltaTime(): number {
    return this._deltaTime / this._timeScale;
  }

  /**
   * The time in seconds at the beginning of this frame.
   */
  get time(): number {
    return this._time;
  }

  /**
   * The scale of time.
   */
  get timeScale(): number {
    return this._timeScale;
  }

  set timeScale(value) {
    this._timeScale = value;
  }

  /**
   * Constructor of the Time.
   */
  constructor() {
    this._clock = performance ? performance : Date;

    this._timeScale = 1.0;
    this._deltaTime = 0.0001;

    const now = this._clock.now() / 1000;
    this._lastSystemTime = now;
  }

  /**
   * @internal
   */
  _reset() {
    this._lastSystemTime = this._clock.now() / 1000;
  }

  /**
   * @internal
   */
  _tick(): void {
    const systemTime = this._clock.now() / 1000;
    const deltaTime = (systemTime - this._lastSystemTime) * this._timeScale;

    this._deltaTime = deltaTime;
    this._time += deltaTime;
    this._frameCount++;

    this._lastSystemTime = systemTime;
  }
}

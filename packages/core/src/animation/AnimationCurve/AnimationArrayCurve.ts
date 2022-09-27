import { InterpolableValueType } from "../enums/InterpolableValueType";
import { AnimationCurve } from "./AnimationCurve";

/**
 * Store a collection of Keyframes that can be evaluated over time.
 */
export class AnimationArrayCurve extends AnimationCurve<number[], number[]> {
  constructor() {
    super();
    this._type = InterpolableValueType.Array;
  }

  /**
   * @internal
   */
  _evaluateAdditive(time: number, out?: number[]): number[] {
    const baseValue = this.keys[0].value;
    const value = this._evaluate(time, out);
    for (let i = 0, n = value.length; i < n; i++) {
      value[i] = value[i] - baseValue[i];
    }
    return value;
  }

  protected _evaluateLinear(frameIndex: number, nextFrameIndex: number, t: number, out: number[]): number[] {
    const { keys } = this;
    const value = keys[frameIndex].value;
    const nextValue = keys[nextFrameIndex].value;
    for (let i = 0, n = value.length; i < n; i++) {
      out[i] = value[i] * (1 - t) + nextValue[i] * t;
    }
    return out;
  }

  protected _evaluateStep(frameIndex: number, out: number[]): number[] {
    const value = this.keys[frameIndex].value;
    for (let i = 0, n = value.length; i < n; i++) {
      out[i] = value[i];
    }
    return out;
  }

  protected _evaluateHermite(
    frameIndex: number,
    nextFrameIndex: number,
    t: number,
    duration: number,
    out: number[]
  ): number[] {
    const { keys } = this;
    const curKey = keys[frameIndex];
    const nextKey = keys[nextFrameIndex];
    const t0 = curKey.outTangent,
      t1 = nextKey.inTangent,
      p0 = curKey.value,
      p1 = nextKey.value,
      length = p0.length;

    for (let i = 0; i < length; ++i) {
      if (Number.isFinite(t0[i]) && Number.isFinite(t1[i])) {
        const t2 = t * t;
        const t3 = t2 * t;
        const a = 2.0 * t3 - 3.0 * t2 + 1.0;
        const b = t3 - 2.0 * t2 + t;
        const c = t3 - t2;
        const d = -2.0 * t3 + 3.0 * t2;
        out[i] = a * p0[i] + b * t0[i] * duration + c * t1[i] * duration + d * p1[i];
      } else {
        out[i] = curKey.value[i];
      }
    }
    return out;
  }
}

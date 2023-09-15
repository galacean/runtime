import { Matrix, Quaternion, Vector3 } from "@galacean/engine-math";
import { DisorderedArray } from "../../DisorderedArray";
import { EnumXRButton } from "../enum/EnumXRButton";
import { XRInput } from "./XRInput";

export class XRController extends XRInput {
  targetRayMatrix: Matrix = new Matrix();
  targetRayPosition: Vector3 = new Vector3();
  targetRayQuaternion: Quaternion = new Quaternion();
  pressedButtons: EnumXRButton = EnumXRButton.None;
  upMap: number[] = [];
  downMap: number[] = [];
  upList: DisorderedArray<EnumXRButton> = new DisorderedArray();
  downList: DisorderedArray<EnumXRButton> = new DisorderedArray();

  isButtonDown(button: EnumXRButton): boolean {
    return this.downMap[button] === this._engine.time.frameCount;
  }
  isButtonUp(button: EnumXRButton): boolean {
    return this.upMap[button] === this._engine.time.frameCount;
  }
  isButtonHeldDown(button: EnumXRButton): boolean {
    return (this.pressedButtons & button) !== 0;
  }
}

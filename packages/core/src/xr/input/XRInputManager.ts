import { IXRInputProvider } from "@galacean/engine-design";
import { Engine } from "../../Engine";
import { XRController } from "./XRController";
import { XRHand } from "./XRHand";
import { XRInputDevice } from "./XRInputDevice";
import { XRViewer } from "./XRViewer";
import { EnumXRInputSource } from "../enum/EnumXRInputSource";

export class XRInputManager {
  // @internal
  _provider: IXRInputProvider;
  // @internal
  _inputs: XRInputDevice[] = [];

  getInput<T extends XRInputDevice>(inputSource: EnumXRInputSource): T {
    return this._inputs[inputSource] as T;
  }

  initialize(provider: IXRInputProvider) {
    this._provider = provider;
    const { _engine: engine, _inputs: inputs } = this;
    for (let i = EnumXRInputSource.Length - 1; i >= 0; i--) {
      switch (i) {
        case EnumXRInputSource.Controller:
        case EnumXRInputSource.LeftController:
        case EnumXRInputSource.RightController:
          inputs[i] = new XRController(engine);
          break;
        case EnumXRInputSource.Viewer:
        case EnumXRInputSource.LeftViewer:
        case EnumXRInputSource.RightViewer:
          inputs[i] = new XRViewer(engine);
          break;
        case EnumXRInputSource.LeftHand:
        case EnumXRInputSource.RightHand:
          inputs[i] = new XRHand(engine);
          break;
      }
    }
  }

  constructor(private _engine: Engine) {}
}

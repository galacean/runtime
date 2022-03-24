import { RefObject } from "../../asset/RefObject"
import { Engine } from "../../Engine";
import { UpdateFlag } from "../../UpdateFlag";
import { UpdateFlagManager } from "../../UpdateFlagManager";

/**
 * Font.
 */
export class Font extends RefObject {
  private _name: string = "Arial";
  private _updateFlagManager: UpdateFlagManager = new UpdateFlagManager();

  /**
   * The name of the font.
   */
  get name(): string {
    return this._name;
  }

  set name(value: string) {
    value = value || "Arial";
    if (this._name !== value) {
      this._name = value;
      this._updateFlagManager.distribute();
    }
  }

  /**
   * Create a font instance.
   * @param engine - Engine to which the font belongs
   * @param name - The name of font
   */
  constructor(engine: Engine, name: string = "") {
    super(engine);
    this._name = name || "Arial";
  }

  /**
   * @internal
   */
  _registerUpdateFlag(): UpdateFlag {
    return this._updateFlagManager.register();
  }

  /**
   * @override
   */
  protected _onDestroy(): void {}
}


import { RefObject } from "../../asset/RefObject";
import { Engine } from "../../Engine";
import { Texture2D } from "../../texture";
import { CharInfo } from "./CharInfo";
import { FontAtlas } from "../atlas/FontAtlas";
import { TextUtils } from "./TextUtils";

/**
 * Font.
 */
export class Font extends RefObject {
  private static _fontMap: Record<string, Font> = {};

  /**
   * Create a font from OS.
   * @param engine - Engine to which the font belongs
   * @param name - The name of font
   * @param fontUrl - The font url to register, if not, will use system font
   * @returns The font object has been create
   */
  static async create(engine: Engine, name: string, fontUrl: string = ""): Promise<Font> {
    if (name) {
      const fontMap = Font._fontMap;
      let font = fontMap[name];
      if (font) {
        return font;
      }
      if (fontUrl !== "") {
        await TextUtils.registerTTF(name, fontUrl);
      }
      font = new Font(engine, name);
      fontMap[name] = font;
      return font;
    }
    return null;
  }

  /** @internal */
  static _createFromOS(engine: Engine, name: string = ""): Font {
    const fontMap = Font._fontMap;
    let font = fontMap[name];
    if (font) {
      return font;
    }
    font = new Font(engine, name);
    fontMap[name] = font;
    return font;
  }

  private _name: string = "";
  private _fontAtlases: FontAtlas[] = [];
  private _lastIndex: number = -1;

  /**
   * The name of the font object.
   */
  get name(): string {
    return this._name;
  }

  /** @internal */
  set name(value: string) {
    this._name = value;
  }

  private constructor(engine: Engine, name: string = "") {
    super(engine);
    this._name = name;
  }

  /**
   * @internal
   */
  _uploadCharTexture(charInfo: CharInfo): void {
    const fontAtlases = this._fontAtlases;
    let lastIndex = this._lastIndex;
    if (lastIndex === -1) {
      this._createFontAtlas();
      lastIndex++;
    }
    let fontAtlas = fontAtlases[lastIndex];
    if (!fontAtlas.uploadCharTexture(charInfo)) {
      fontAtlas = this._createFontAtlas();
      fontAtlas.uploadCharTexture(charInfo);
      lastIndex++;
    }
    this._lastIndex = lastIndex;
    charInfo.data = null;
  }

  /**
   * @internal
   */
  _addCharInfo(char: string, charInfo: CharInfo) {
    const lastIndex = this._lastIndex;
    charInfo.index = lastIndex;
    this._fontAtlases[lastIndex].addCharInfo(char, charInfo);
  }

  /**
   * @internal
   */
  _getCharInfo(char: string): CharInfo {
    const fontAtlases = this._fontAtlases;
    for (let i = 0, n = fontAtlases.length; i < n; ++i) {
      const fontAtlas = fontAtlases[i];
      const charInfo = fontAtlas.getCharInfo(char);
      if (charInfo) {
        return charInfo;
      }
    }
    return null;
  }

  /**
   * @internal
   */
  _getTextureByIndex(index: number): Texture2D {
    const fontAtlas = this._fontAtlases[index];
    if (fontAtlas) {
      return fontAtlas.texture;
    }
    return null;
  }

  /**
   * @internal
   */
  _getLastIndex(): number {
    return this._lastIndex;
  }

  /**
   * @override
   */
  _onDestroy(): void {
    const fontAtlases = this._fontAtlases;
    for (let i = 0, n = fontAtlases.length; i < n; ++i) {
      fontAtlases[i].destroy(true);
    }
    fontAtlases.length = 0;
    delete Font._fontMap[this._name];
  }

  private _createFontAtlas(): FontAtlas {
    const { engine } = this;
    const fontAtlas = new FontAtlas(engine);
    const texture = new Texture2D(engine, 256, 256);
    fontAtlas.texture = texture;
    this._fontAtlases.push(fontAtlas);
    return fontAtlas;
  }
}

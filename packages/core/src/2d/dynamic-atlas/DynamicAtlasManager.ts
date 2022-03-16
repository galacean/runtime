import { Sprite } from "../sprite/Sprite";
import { Engine } from "../../Engine";
import { DynamicAtlas } from "./DynamicAtlas";
import { Texture2D } from "../../texture/Texture2D";

/**
 * Dynamic atlas manager for text.
 */
export class DynamicAtlasManager {
  private _maxAtlasCount: number = 2;
  private _textureSize: number = 1024;
  private _atlases: Array<DynamicAtlas> = [];
  private _atlasIndex: number = -1;

  /**
   * Indicates how many atlases should be created.
   */
  get maxAtlasCount(): number {
    return this._maxAtlasCount;
  }

  set maxAtlasCount(val: number) {
    this._maxAtlasCount = val;
  }

  /**
   * Indicates the size of the texture.
   */
  get textureSize(): number {
    return this._textureSize;
  }

  set textureSize(val: number) {
    this._textureSize = Math.min(val, 2048);
  }

  /**
   * @internal
   */
  constructor(public readonly engine: Engine) {}

  /**
   * Add a sprite to atlas.
   * @param sprite - the sprite to add
   * @param imageSource - The source of texture
   * @returns the origin texture before batch if have, otherwise null
   */
  public addSprite(sprite: Sprite, imageSource: TexImageSource): Texture2D | null {
    if (this._atlasIndex >= this._maxAtlasCount) {
      return null;
    }

    let atlas = this._atlases[this._atlasIndex];
    if (!atlas) {
      atlas = this._createAtlas();
    }

    const originTexture = atlas.getOriginTextureById(sprite.instanceId);
    if (atlas.addSprite(sprite, imageSource)) {
      return originTexture || null;
    }

    if (this._atlasIndex + 1 >= this._maxAtlasCount) {
      this._atlasIndex = this._maxAtlasCount;
      return null;
    }

    atlas = this._createAtlas();
    atlas.addSprite(sprite, imageSource);
    return null;
  }

  /**
   * Remove a sprite from atlas.
   * @param sprite - the sprite to remove
   */
  public removeSprite(sprite: Sprite) {
    if (!sprite) return ;

    const { _atlases } = this;
    for (let i = 0, l = _atlases.length; i < l; ++i) {
      const atlas = _atlases[i];
      atlas.removeSprite(sprite);
    }
  }

  /**
   * Reset all atlases.
   */
  public reset() {
    const { _atlases } = this;
    for (let i = 0, l = _atlases.length; i < l; ++i) {
      _atlases[i].destroy();
    }

    _atlases.length = 0;
    this._atlasIndex = -1;
  }

  private _createAtlas(): DynamicAtlas {
    this._atlasIndex++;
    const { _textureSize } = this;
    const atlas = new DynamicAtlas(this.engine, _textureSize, _textureSize);
    this._atlases.push(atlas);
    return atlas;
  }
}

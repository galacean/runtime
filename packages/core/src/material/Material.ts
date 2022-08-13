import { IClone } from "@oasis-engine/design";
import { RefObject } from "../asset/RefObject";
import { CloneManager } from "../clone/CloneManager";
import { Engine } from "../Engine";
import { RenderElement } from "../RenderPipeline/RenderElement";
import { ShaderDataGroup } from "../shader/enums/ShaderDataGroup";
import { Shader } from "../shader/Shader";
import { ShaderData } from "../shader/ShaderData";
import { RenderState } from "../shader/state/RenderState";
import { RenderQueueType } from "./enums/RenderQueueType";

/**
 * Material.
 */
export class Material extends RefObject implements IClone {
  /** Name. */
  name: string;
  /** Render queue type. */
  renderQueueType: RenderQueueType = RenderQueueType.Opaque;
  /** Shader data. */
  readonly shaderData: ShaderData = new ShaderData(ShaderDataGroup.Material);

  private _shader: Shader;
  private _renderStates: RenderState[] = []; // todo: later will as a part of shaderData when shader effect frame is OK, that is more powerful and flexible.

  /**
   * Shader used by the material.
   */
  get shader(): Shader {
    return this._shader;
  }

  set shader(value: Shader) {
    this._shader = value;

    const lastStatesCount = this._renderStates.length;
    const passCount = value.shaderPasses.length;

    if (lastStatesCount < passCount) {
      for (let i = lastStatesCount; i < passCount; i++) {
        this._renderStates.push(new RenderState());
      }
    } else {
      this._renderStates.length = passCount;
    }
  }

  /**
   * First Render state.
   */
  get renderState(): RenderState {
    return this._renderStates[0];
  }

  /**
   * Render states.
   */
  get renderStates(): Readonly<RenderState[]> {
    return this._renderStates;
  }

  /**
   * Create a material instance.
   * @param engine - Engine to which the material belongs
   * @param shader - Shader used by the material
   */
  constructor(engine: Engine, shader: Shader) {
    super(engine);
    this.shader = shader;
  }

  /**
   * Clone and return the instance.
   */
  clone(): Material {
    const dest = new Material(this._engine, this.shader);
    this.cloneTo(dest);
    return dest;
  }

  /**
   * Clone to the target material.
   * @param target - target material
   */
  cloneTo(target: Material): void {
    target.shader = this.shader;
    target.renderQueueType = this.renderQueueType;
    this.shaderData.cloneTo(target.shaderData);
    CloneManager.deepCloneObject(this.renderStates, target.renderStates);
  }

  /**
   * @override
   */
  _addRefCount(value: number): void {
    super._addRefCount(value);
    this.shaderData._addRefCount(value);
  }

  /**
   * @internal
   * @todo:temporary solution
   */
  _preRender(renderElement: RenderElement) {}

  /**
   * @override
   */
  protected _onDestroy(): void {}
}

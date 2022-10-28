import { BoundingBox } from "@oasis-engine/math";
import { Logger } from "../base/Logger";
import { Camera } from "../Camera";
import { ignoreClone } from "../clone/CloneManager";
import { ICustomClone } from "../clone/ComponentCloner";
import { Entity } from "../Entity";
import { Mesh } from "../graphic/Mesh";
import { Renderer } from "../Renderer";
import { Shader } from "../shader/Shader";
import { MeshRendererUpdateFlags } from "./enums/MeshRendererUpdateFlags";

/**
 * MeshRenderer Component.
 */
export class MeshRenderer extends Renderer implements ICustomClone {
  private static _uvMacro = Shader.getMacroByName("O3_HAS_UV");
  private static _uv1Macro = Shader.getMacroByName("O3_HAS_UV1");
  private static _normalMacro = Shader.getMacroByName("O3_HAS_NORMAL");
  private static _tangentMacro = Shader.getMacroByName("O3_HAS_TANGENT");
  private static _vertexColorMacro = Shader.getMacroByName("O3_HAS_VERTEXCOLOR");

  /** @internal */
  @ignoreClone
  _mesh: Mesh;

  /**
   * @internal
   */
  constructor(entity: Entity) {
    super(entity);
  }

  /**
   * Mesh assigned to the renderer.
   */
  get mesh(): Mesh {
    return this._mesh;
  }

  set mesh(value: Mesh) {
    if (this._mesh !== value) {
      this._setMesh(value);
    }
  }

  /**
   * @internal
   * @override
   */
  _render(camera: Camera): void {
    const mesh = this._mesh;
    if (mesh) {
      if (this._dirtyUpdateFlag.flags & MeshRendererUpdateFlags.VertexElements) {
        const shaderData = this.shaderData;
        const vertexElements = mesh._vertexElements;

        shaderData.disableMacro(MeshRenderer._uvMacro);
        shaderData.disableMacro(MeshRenderer._uv1Macro);
        shaderData.disableMacro(MeshRenderer._normalMacro);
        shaderData.disableMacro(MeshRenderer._tangentMacro);
        shaderData.disableMacro(MeshRenderer._vertexColorMacro);

        for (let i = 0, n = vertexElements.length; i < n; i++) {
          const { semantic } = vertexElements[i];
          switch (semantic) {
            case "TEXCOORD_0":
              shaderData.enableMacro(MeshRenderer._uvMacro);
              break;
            case "TEXCOORD_1":
              shaderData.enableMacro(MeshRenderer._uv1Macro);
              break;
            case "NORMAL":
              shaderData.enableMacro(MeshRenderer._normalMacro);
              break;
            case "TANGENT":
              shaderData.enableMacro(MeshRenderer._tangentMacro);
              break;
            case "COLOR_0":
              shaderData.enableMacro(MeshRenderer._vertexColorMacro);
              break;
          }
        }
        this._dirtyUpdateFlag.flags &= ~MeshRendererUpdateFlags.VertexElements;
      }

      const subMeshes = mesh.subMeshes;
      const renderPipeline = camera._renderPipeline;
      const renderElementPool = this._engine._renderElementPool;
      for (let i = 0, n = subMeshes.length; i < n; i++) {
        const material = this._materials[i];
        if (material) {
          const renderStates = material.renderStates;
          const shaderPasses = material.shader.passes;
          for (let j = 0, m = shaderPasses.length; j < m; j++) {
            const element = renderElementPool.getFromPool();
            element.setValue(this, mesh, subMeshes[i], material, renderStates[j], shaderPasses[j]);
            renderPipeline.pushPrimitive(element);
          }
        }
      }
    } else {
      Logger.error("mesh is null.");
    }
  }

  /**
   * @internal
   * @override
   */
  _onDestroy() {
    super._onDestroy();
    const mesh = this._mesh;
    if (mesh && !mesh.destroyed) {
      mesh._addRefCount(-1);
      this._mesh = null;
    }
  }

  /**
   * @internal
   */
  _cloneTo(target: MeshRenderer): void {
    target.mesh = this._mesh;
  }

  /**
   * @override
   */
  protected _updateBounds(worldBounds: BoundingBox): void {
    const mesh = this._mesh;
    if (mesh) {
      const localBounds = mesh.bounds;
      const worldMatrix = this._entity.transform.worldMatrix;
      BoundingBox.transform(localBounds, worldMatrix, worldBounds);
    } else {
      worldBounds.min.set(0, 0, 0);
      worldBounds.max.set(0, 0, 0);
    }
  }

  private _setMesh(mesh: Mesh): void {
    const lastMesh = this._mesh;
    if (lastMesh) {
      lastMesh._addRefCount(-1);
      lastMesh._updateFlagManager.removeFlag(this._dirtyUpdateFlag);
    }
    if (mesh) {
      mesh._addRefCount(1);
      mesh._updateFlagManager.addFlag(this._dirtyUpdateFlag);
      this._dirtyUpdateFlag.flags |= MeshRendererUpdateFlags.All;
    }
    this._mesh = mesh;
  }
}

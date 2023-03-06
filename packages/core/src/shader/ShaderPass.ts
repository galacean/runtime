import { GLCapabilityType } from "../base/Constant";
import { Engine } from "../Engine";
import { ShaderFactory } from "../shaderlib/ShaderFactory";
import { Shader } from "./Shader";
import { ShaderMacroCollection } from "./ShaderMacroCollection";
import { ShaderProgram } from "./ShaderProgram";
import { ShaderString } from "./ShaderString";

/**
 * Shader pass containing vertex and fragment source.
 */
export class ShaderPass {
  private static _shaderPassCounter: number = 0;

  /** Pipeline stage. */
  readonly pipelineStage: ShaderString;

  /** @internal */
  _shaderPassId: number = 0;

  private _vertexSource: string;
  private _fragmentSource: string;

  /**
   * Create a shader pass.
   * @param vertexSource - Vertex shader source
   * @param fragmentSource - Fragment shader source
   * @param pipelineStageName - Pipeline stage name
   */
  constructor(vertexSource: string, fragmentSource: string, pipelineStageName?: string);

  /**
   * Create a shader pass.
   * @param vertexSource - Vertex shader source
   * @param fragmentSource - Fragment shader source
   * @param pipelineStage - Pipeline stage
   */
  constructor(vertexSource: string, fragmentSource: string, pipelineStage?: ShaderString);

  constructor(vertexSource: string, fragmentSource: string, pipelineStageOrName?: string | ShaderString) {
    this._shaderPassId = ShaderPass._shaderPassCounter++;

    this._vertexSource = vertexSource;
    this._fragmentSource = fragmentSource;

    if (pipelineStageOrName) {
      this.pipelineStage =
        typeof pipelineStageOrName === "string" ? ShaderString.getByName(pipelineStageOrName) : pipelineStageOrName;
    } else {
      this.pipelineStage = ShaderString.getByName("Forward");
    }
  }

  /**
   * @internal
   */
  _getShaderProgram(engine: Engine, macroCollection: ShaderMacroCollection): ShaderProgram {
    const shaderProgramPool = engine._getShaderProgramPool(this);
    let shaderProgram = shaderProgramPool.get(macroCollection);
    if (shaderProgram) {
      return shaderProgram;
    }

    const isWebGL2: boolean = engine._hardwareRenderer.isWebGL2;
    const macroNameList = [];
    Shader._getNamesByMacros(macroCollection, macroNameList);
    const macroNameStr = ShaderFactory.parseCustomMacros(macroNameList);
    const versionStr = isWebGL2 ? "#version 300 es" : "#version 100";
    const graphicAPI = isWebGL2 ? "#define GRAPHICS_API_WEBGL2" : "#define GRAPHICS_API_WEBGL1";
    let precisionStr = `
    #ifdef GL_FRAGMENT_PRECISION_HIGH
      precision highp float;
      precision highp int;
    #else
      precision mediump float;
      precision mediump int;
    #endif
    `;

    if (engine._hardwareRenderer.canIUse(GLCapabilityType.shaderTextureLod)) {
      precisionStr += "#define HAS_TEX_LOD\n";
    }
    if (engine._hardwareRenderer.canIUse(GLCapabilityType.standardDerivatives)) {
      precisionStr += "#define HAS_DERIVATIVES\n";
    }

    let vertexSource = ShaderFactory.parseIncludes(
      ` ${versionStr}
        ${graphicAPI}
        ${macroNameStr}
      ` + this._vertexSource
    );

    let fragmentSource = ShaderFactory.parseIncludes(
      ` ${versionStr}
        ${graphicAPI}
        ${isWebGL2 ? "" : ShaderFactory.parseExtension(Shader._shaderExtension)}
        ${precisionStr}
        ${macroNameStr}
      ` + this._fragmentSource
    );

    if (isWebGL2) {
      vertexSource = ShaderFactory.convertTo300(vertexSource);
      fragmentSource = ShaderFactory.convertTo300(fragmentSource, true);
    }

    shaderProgram = new ShaderProgram(engine, vertexSource, fragmentSource);

    shaderProgramPool.cache(shaderProgram);
    return shaderProgram;
  }
}

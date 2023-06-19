import { AstNode, TagAstNode } from "./astNode";
import { IAstInfo, IPositionRange, IShaderAstContent } from "./astNode/types";

/**
 * Shader lab interface
 */
export interface IShaderLab {
  /**  */
  initialize(): Promise<void>;

  /**
   * parse galacean shader
   */
  parseShader(shaderCode: string): IShaderInfo;
}

export declare const enum DiagnosticSeverity {
  /**
   * Reports an error.
   */
  Error = 1,
  /**
   * Reports a warning.
   */
  Warning = 2,
  /**
   * Reports an information.
   */
  Information = 3,
  /**
   * Reports a hint.
   */
  Hint = 4
}
export interface IDiagnostic {
  severity: DiagnosticSeverity;
  message: string;
  /**
   * The token which caused the parser error.
   */
  token: IPositionRange;
}
export interface IShaderMainFunction {
  type: "vert" | "frag";
  functionAst: IAstInfo;
}
interface IReference {
  referenced: boolean;
}
export interface IGlobal extends IReference {
  ast: AstNode;
  name: string;
}
export interface IShaderInfo {
  ast: AstNode<IShaderAstContent>;
  name: string;
  subShaders: Array<ISubShader>;
  editorProperties: Record<string, any>;
}
export interface ISubShader {
  name: string;
  passes: Array<IShaderPass>;
  tags?: Record<string, any>;
}
export interface IShaderPass {
  name: string;
  vert: string;
  frag: string;
  tags?: Record<string, any>;
  renderStates: IRenderState;
}
export declare type IRenderState = Record<string, any>;
/** The shader pass property name which reference the fragment shader main function */
export declare const FRAG_FN_NAME = "FragmentShader";
/** The shader pass property name which reference the vertex shader main function */
export declare const VERT_FN_NAME = "VertexShader";
export {};

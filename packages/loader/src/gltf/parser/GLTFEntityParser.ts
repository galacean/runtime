import { Entity } from "@galacean/engine-core";
import { INode } from "../GLTFSchema";
import { GLTFParser } from "./GLTFParser";
import { GLTFParserContext, GLTFParserType, registerGLTFParser } from "./GLTFParserContext";

@registerGLTFParser(GLTFParserType.Entity)
export class GLTFEntityParser extends GLTFParser {
  parse(context: GLTFParserContext, index: number): Entity {
    const nodes = context.glTF.nodes;

    if (!nodes) return null;

    return this._parseSingleEntity(context, nodes[index], index);
  }

  private _parseSingleEntity(context: GLTFParserContext, entityInfo: INode, index: number): Entity {
    const glTFResource = context.glTFResource;
    const engine = glTFResource.engine;
    const { matrix, translation, rotation, scale } = entityInfo;
    const entity = new Entity(engine, entityInfo.name || `_GLTF_ENTITY_${index}`);

    const { transform } = entity;
    if (matrix) {
      const localMatrix = transform.localMatrix;
      localMatrix.copyFromArray(matrix);
      transform.localMatrix = localMatrix;
    } else {
      if (translation) {
        transform.setPosition(translation[0], translation[1], translation[2]);
      }
      if (rotation) {
        transform.setRotationQuaternion(rotation[0], rotation[1], rotation[2], rotation[3]);
      }
      if (scale) {
        transform.setScale(scale[0], scale[1], scale[2]);
      }
    }

    const children = entityInfo.children;
    if (children) {
      for (let i = 0; i < children.length; i++) {
        const childIndex = children[i];
        const childEntity = context.get<Entity>(GLTFParserType.Entity, childIndex);
        entity.addChild(childEntity);
      }
    }

    return entity;
  }
}

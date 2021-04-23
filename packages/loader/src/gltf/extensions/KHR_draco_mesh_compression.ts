import { DRACODecoder } from "@oasis-engine/draco";
import { GLTFResource } from "../GLTFResource";
import { registerExtension } from "../parser/Parser";
import { IMeshPrimitive } from "../schema";
import { getBufferViewData, getComponentType } from "../Util";
import { ExtensionParser } from "./ExtensionParser";
import { IKHRDracoMeshCompression } from "./schema";

@registerExtension("KHR_draco_mesh_compression")
class KHR_draco_mesh_compression extends ExtensionParser {
  private static _decoder: DRACODecoder;

  bootstrap(): void {
    if (!KHR_draco_mesh_compression._decoder) {
      KHR_draco_mesh_compression._decoder = new DRACODecoder();
    }
  }

  createEngineResource(schema: IKHRDracoMeshCompression, context: GLTFResource, gltfPrimitive: IMeshPrimitive) {
    const { gltf, buffers } = context;
    const { bufferViews, accessors } = gltf;
    const { bufferView: bufferViewIndex, attributes: gltfAttributeMap } = schema;

    const attributeMap = {};
    const attributeTypeMap = {};
    for (let attributeName in gltfAttributeMap) {
      attributeMap[attributeName] = gltfAttributeMap[attributeName];
    }
    for (let attributeName in gltfPrimitive.attributes) {
      if (gltfAttributeMap[attributeName] !== undefined) {
        const accessorDef = accessors[gltfPrimitive.attributes[attributeName]];
        attributeTypeMap[attributeName] = getComponentType(accessorDef.componentType).name;
      }
    }
    const indexAccessor = accessors[gltfPrimitive.indices];
    const indexType = getComponentType(indexAccessor.componentType).name;
    const taskConfig = {
      attributeIDs: attributeMap,
      attributeTypes: attributeTypeMap,
      useUniqueIDs: true,
      indexType
    };
    const buffer = getBufferViewData(bufferViews[bufferViewIndex], buffers);
    return KHR_draco_mesh_compression._decoder.decode(buffer, taskConfig).then((parsedGeometry) => parsedGeometry);
  }
}

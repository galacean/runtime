import { registerGLTFExtension } from "../parser/GLTFParser";
import { GLTFParserContext, GLTFParserType } from "../parser/GLTFParserContext";
import { GLTFExtensionMode, GLTFExtensionParser } from "./GLTFExtensionParser";
import { IEXTMeshoptCompressionSchema } from "./GLTFExtensionSchema";
import { MeshoptDecoder } from "./MeshoptDecoder";

@registerGLTFExtension("EXT_meshopt_compression", GLTFExtensionMode.CreateAndParse)
class EXT_meshopt_compression extends GLTFExtensionParser {
  override createAndParse(context: GLTFParserContext, schema: IEXTMeshoptCompressionSchema): Promise<Uint8Array> {
    return context.get<ArrayBuffer>(GLTFParserType.Buffer, schema.buffer).then((arrayBuffer) => {
      return MeshoptDecoder.decodeGltfBuffer(
        schema.count,
        schema.byteStride,
        new Uint8Array(arrayBuffer, schema.byteOffset, schema.byteLength),
        schema.mode,
        schema.filter
      );
    });
  }
}

declare module "@galacean/engine-core" {
  interface EngineConfiguration {
    /** glTF loader options. */
    glTF?: {
      /** Meshopt options. */
      meshOpt?: {
        /** Worker count for transcoder, default is 4. */
        workerCount: number;
      };
    };
  }
}

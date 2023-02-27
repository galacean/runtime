import { DirectLight, Entity, PointLight, SpotLight } from "@oasis-engine/core";
import { registerGLTFExtension } from "../parser/GLTFParser";
import { GLTFParserContext } from "../parser/GLTFParserContext";
import { GLTFExtensionParser } from "./GLTFExtensionParser";
import { IKHRLightsPunctual_Light } from "./Schema";

@registerGLTFExtension("KHR_lights_punctual")
class KHR_lights_punctual extends GLTFExtensionParser {
  parseEngineResource(schema: IKHRLightsPunctual_Light, entity: Entity, context: GLTFParserContext): void {
    const { color, intensity = 1, type, range, spot } = schema;
    const glTFResource = context.glTFResource;
    let light: DirectLight | PointLight | SpotLight;

    if (type === "directional") {
      light = entity.addComponent(DirectLight);
    } else if (type === "point") {
      light = entity.addComponent(PointLight);
    } else if (type === "spot") {
      light = entity.addComponent(SpotLight);
    }

    if (color) {
      light.color.set(color[0], color[1], color[2], 1);
    }

    light.intensity = intensity;

    if (range && !(light instanceof DirectLight)) {
      light.distance = range;
    }

    if (spot && light instanceof SpotLight) {
      const { innerConeAngle = 0, outerConeAngle = Math.PI / 4 } = spot;

      light.angle = innerConeAngle;
      light.penumbra = outerConeAngle - innerConeAngle;
    }

    if (!glTFResource.lights) glTFResource.lights = [];
    glTFResource.lights.push(light);
  }
}

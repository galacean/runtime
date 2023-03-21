import { AnimationClip, AnimationEvent } from "@oasis-engine/core";
import { registerGLTFExtension } from "../parser/GLTFParser";
import { GLTFParserContext } from "../parser/GLTFParserContext";
import { GLTFExtensionMode, GLTFExtensionParser } from "./GLTFExtensionParser";
import { IOasisAnimation } from "./GLTFExtensionSchema";

// @ts-ignore
@registerGLTFExtension("OASIS_animation", GLTFExtensionMode.AdditiveParse)
class OASIS_animation extends GLTFExtensionParser {
  /**
   * @override
   */
  // @ts-ignore
  additiveParse(context: GLTFParserContext, animationClip: AnimationClip, schema: IOasisAnimation): Promise<void> {
    const { engine } = context.glTFResource;
    const { events } = schema;
    return Promise.all(
      events.map((eventData) => {
        return new Promise<void>((resolve) => {
          const event = new AnimationEvent();
          event.functionName = eventData.functionName;
          event.time = eventData.time;
          if (eventData?.parameter?.refId) {
            // @ts-ignore
            engine.resourceManager.getResourceByRef(eventData.parameter).then((asset) => {
              event.parameter = asset;
              resolve();
            });
            animationClip.addEvent(event);
          } else {
            event.parameter = eventData.parameter;
            animationClip.addEvent(event);
            resolve();
          }
        });
      })
    ).then((res) => {
      return null;
    });
  }
}

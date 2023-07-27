import {
  AnimationClip,
  AnimationFloatArrayCurve,
  AnimationQuaternionCurve,
  AnimationVector3Curve,
  Component,
  Entity,
  InterpolationType,
  Keyframe,
  SkinnedMeshRenderer,
  Transform,
  TypedArray
} from "@galacean/engine-core";
import { Quaternion, Vector3, Vector4 } from "@galacean/engine-math";
import {
  AccessorType,
  AnimationChannelTargetPath,
  AnimationSamplerInterpolation,
  IAnimation,
  IAnimationChannel
} from "../GLTFSchema";
import { GLTFUtils } from "../GLTFUtils";
import { GLTFParser } from "./GLTFParser";
import { GLTFParserContext, GLTFParserType, registerGLTFParser } from "./GLTFParserContext";

@registerGLTFParser(GLTFParserType.Animation)
export class GLTFAnimationParser extends GLTFParser {
  /**
   * @internal
   */
  static _parseStandardProperty(
    context: GLTFParserContext,
    animationClip: AnimationClip,
    animationInfo: IAnimation
  ): Promise<void> {
    const { glTF } = context;
    const { accessors, bufferViews } = glTF;
    const { channels, samplers } = animationInfo;

    const sampleDataCollection = new Array<SampleData>();

    let duration = -1;
    let promises = new Array<Promise<Entity[] | void>>();
    promises.push(context.get<Entity[]>(GLTFParserType.Entity));

    // parse samplers
    for (let j = 0, m = samplers.length; j < m; j++) {
      const gltfSampler = samplers[j];
      const inputAccessor = accessors[gltfSampler.input];
      const outputAccessor = accessors[gltfSampler.output];

      const promise = Promise.all([
        GLTFUtils.getAccessorBuffer(context, bufferViews, inputAccessor),
        GLTFUtils.getAccessorBuffer(context, bufferViews, outputAccessor)
      ]).then((bufferInfos) => {
        const input = bufferInfos[0].data;
        let output = bufferInfos[1].data;
        if (outputAccessor.normalized) {
          const scale = GLTFUtils.getNormalizedComponentScale(outputAccessor.componentType);
          const scaled = new Float32Array(output.length);
          for (let k = 0, v = output.length; k < v; k++) {
            scaled[k] = output[k] * scale;
          }
          output = scaled;
        }

        const outputStride = output.length / input.length;

        const interpolation = gltfSampler.interpolation ?? AnimationSamplerInterpolation.Linear;
        let samplerInterpolation: InterpolationType;
        switch (interpolation) {
          case AnimationSamplerInterpolation.CubicSpine:
            samplerInterpolation = InterpolationType.CubicSpine;
            break;
          case AnimationSamplerInterpolation.Step:
            samplerInterpolation = InterpolationType.Step;
            break;
          case AnimationSamplerInterpolation.Linear:
            samplerInterpolation = InterpolationType.Linear;
            break;
        }

        const maxTime = input[input.length - 1];
        if (maxTime > duration) {
          duration = maxTime;
        }

        sampleDataCollection.push({
          type: outputAccessor.type,
          interpolation: samplerInterpolation,
          input,
          output,
          outputSize: outputStride
        });
      });
      promises.push(promise);
    }

    return Promise.all(promises).then((res) => {
      const entities = res[0] as Entity[];

      for (let j = 0, m = channels.length; j < m; j++) {
        const gltfChannel = channels[j];
        const { target } = gltfChannel;

        const channelTargetEntity = entities[target.node];
        let relativePath = "";
        let entity = channelTargetEntity;
        while (entity.parent) {
          relativePath = relativePath === "" ? `${entity.name}` : `${entity.name}/${relativePath}`;
          entity = entity.parent;
        }

        let ComponentType: new (entity: Entity) => Component;
        let propertyName: string;
        switch (target.path) {
          case AnimationChannelTargetPath.TRANSLATION:
            ComponentType = Transform;
            propertyName = "position";
            break;
          case AnimationChannelTargetPath.ROTATION:
            ComponentType = Transform;
            propertyName = "rotationQuaternion";
            break;
          case AnimationChannelTargetPath.SCALE:
            ComponentType = Transform;
            propertyName = "scale";
            break;
          case AnimationChannelTargetPath.WEIGHTS:
            ComponentType = SkinnedMeshRenderer;
            propertyName = "blendShapeWeights";
            break;
          default:
        }

        const curve = this._addCurve(target.path, gltfChannel, sampleDataCollection);
        animationClip.addCurveBinding(relativePath, ComponentType, propertyName, curve);
      }
    });
  }

  private static _addCurve(
    animationChannelTargetPath: AnimationChannelTargetPath,
    gltfChannel: IAnimationChannel,
    sampleDataCollection: SampleData[]
  ) {
    const sampleData = sampleDataCollection[gltfChannel.sampler];
    const { input, output, outputSize } = sampleData;

    switch (animationChannelTargetPath) {
      case AnimationChannelTargetPath.TRANSLATION:
      case AnimationChannelTargetPath.SCALE: {
        const curve = new AnimationVector3Curve();
        const interpolation = (curve.interpolation = sampleData.interpolation);

        let offset = 0;
        for (let i = 0, n = input.length; i < n; i++) {
          const keyframe = new Keyframe<Vector3>();
          keyframe.time = input[i];
          if (interpolation === InterpolationType.CubicSpine) {
            keyframe.inTangent = new Vector3(output[offset++], output[offset++], output[offset++]);
            keyframe.value = new Vector3(output[offset++], output[offset++], output[offset++]);
            keyframe.outTangent = new Vector3(output[offset++], output[offset++], output[offset++]);
          } else {
            keyframe.value = new Vector3(output[offset++], output[offset++], output[offset++]);
          }
          curve.addKey(keyframe);
        }
        return curve;
      }
      case AnimationChannelTargetPath.ROTATION: {
        const curve = new AnimationQuaternionCurve();
        const interpolation = (curve.interpolation = sampleData.interpolation);

        let offset = 0;
        for (let i = 0, n = input.length; i < n; i++) {
          const keyframe = new Keyframe<Quaternion>();
          keyframe.time = input[i];
          if (interpolation === InterpolationType.CubicSpine) {
            keyframe.inTangent = new Vector4(output[offset++], output[offset++], output[offset++], output[offset++]);
            keyframe.value = new Quaternion(output[offset++], output[offset++], output[offset++], output[offset++]);
            keyframe.outTangent = new Vector4(output[offset++], output[offset++], output[offset++], output[offset++]);
          } else {
            keyframe.value = new Quaternion(output[offset++], output[offset++], output[offset++], output[offset++]);
          }
          curve.addKey(keyframe);
        }
        return curve;
      }
      case AnimationChannelTargetPath.WEIGHTS: {
        const curve = new AnimationFloatArrayCurve();
        curve.interpolation = sampleData.interpolation;

        let offset = 0;
        for (let i = 0, n = input.length; i < n; i++) {
          const keyframe = new Keyframe<Float32Array>();
          keyframe.time = input[i];
          if (curve.interpolation === InterpolationType.CubicSpine) {
            keyframe.inTangent = Array.from(output.subarray(offset, offset + outputSize));
            offset += outputSize;
            keyframe.value = output.subarray(offset, offset + outputSize) as Float32Array;
            offset += outputSize;
            keyframe.outTangent = Array.from(output.subarray(offset, offset + outputSize));
            offset += outputSize;
          } else {
            keyframe.value = output.subarray(offset, offset + outputSize) as Float32Array;
            offset += outputSize;
          }
          curve.addKey(keyframe);
        }
        return curve;
      }
    }
  }

  parse(context: GLTFParserContext, index?: number): Promise<AnimationClip[] | AnimationClip> {
    const {
      glTF: { animations }
    } = context;
    if (!animations) return Promise.resolve(null);

    if (index === undefined) {
      return Promise.all(
        animations.map((animationInfo, index) => this._parseSingleAnimation(context, animationInfo, index))
      );
    } else {
      return this._parseSingleAnimation(context, animations[index], index);
    }
  }

  private _parseSingleAnimation(
    context: GLTFParserContext,
    animationInfo: IAnimation,
    index: number
  ): Promise<AnimationClip> {
    const { name = `AnimationClip${index}` } = animationInfo;

    let animationClip = <Promise<AnimationClip> | AnimationClip>(
      GLTFParser.executeExtensionsCreateAndParse(animationInfo.extensions, context, animationInfo)
    );

    let parseStandardPropertyPromise;

    if (!animationClip) {
      animationClip = new AnimationClip(name);
      parseStandardPropertyPromise = GLTFAnimationParser._parseStandardProperty(context, animationClip, animationInfo);
    }
    return Promise.all([animationClip, parseStandardPropertyPromise]).then(([animationClip]) => {
      GLTFParser.executeExtensionsAdditiveAndParse(animationInfo.extensions, context, animationClip, animationInfo);
      return animationClip;
    });
  }
}
interface SampleData {
  type: AccessorType;
  input: TypedArray;
  output: TypedArray;
  interpolation: InterpolationType;
  outputSize: number;
}

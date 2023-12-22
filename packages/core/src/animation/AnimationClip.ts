import { EngineObject } from "../base/EngineObject";
import { Component } from "../Component";
import { Entity } from "../Entity";
import { AnimationClipCurveBinding } from "./AnimationClipCurveBinding";
import { AnimationCurve } from "./animationCurve/AnimationCurve";
import { AnimationEvent } from "./AnimationEvent";
import { AnimationCurveOwner } from "./internal/animationCurveOwner/AnimationCurveOwner";
import { KeyframeValueType } from "./Keyframe";

/**
 * Stores keyframe based animations.
 */
export class AnimationClip extends EngineObject {
  /** @internal */
  _curveBindings: AnimationClipCurveBinding[] = [];

  private _length: number = 0;
  private _events: AnimationEvent[] = [];

  /**
   * Animation events for this animation clip.
   */
  get events(): Readonly<AnimationEvent[]> {
    return this._events;
  }

  /**
   * Animation curve bindings for this animation clip.
   */
  get curveBindings(): Readonly<AnimationClipCurveBinding[]> {
    return this._curveBindings;
  }

  /**
   * Animation length in seconds.
   */
  get length(): number {
    return this._length;
  }

  /**
   * @param name - The AnimationClip's name
   */
  constructor(public readonly name: string) {
    super(null);
  }

  /**
   * Adds an animation event to the clip.
   * @param functionName - The name of the method called in the script
   * @param time - The time when the event be triggered
   * @param parameter - The parameter that is stored in the event and will be sent to the function
   */
  addEvent(functionName: string, time: number, parameter: Object): void;

  /**
   * Adds an animation event to the clip.
   * @param event - The animation event
   */
  addEvent(event: AnimationEvent): void;

  addEvent(param: AnimationEvent | string, time?: number, parameter?: Object): void {
    let newEvent: AnimationEvent;
    if (typeof param === "string") {
      const event = new AnimationEvent();
      event.functionName = param;
      event.time = time;
      event.parameter = parameter;
      newEvent = event;
    } else {
      newEvent = param;
    }
    const events = this._events;
    const count = events.length;
    const eventTime = newEvent.time;
    const maxEventTime = count ? events[count - 1].time : 0;
    if (eventTime >= maxEventTime) {
      events.push(newEvent);
    } else {
      let index = count;
      while (--index >= 0 && eventTime < events[index].time);
      events.splice(index + 1, 0, newEvent);
    }
  }

  /**
   * Clears all events from the clip.
   */
  clearEvents(): void {
    this._events.length = 0;
  }

  /**
   * Add curve binding for the clip.
   * @param entityPath - Path to the game object this curve applies to. The entityPath is formatted similar to a pathname, e.g. "/root/spine/leftArm"
   * @param componentType - The class type of the component that is animated
   * @param property - The name or path to the property being animated. @remarks support property:"a.b", array: "a.b[0]", method: "a.b('c', 0, $value)"
   * @param curve - The animation curve
   */
  addCurveBinding<T extends Component>(
    entityPath: string,
    componentType: new (entity: Entity) => T,
    property: string,
    curve: AnimationCurve<KeyframeValueType>
  ): void;

  /**
   * Add curve binding for the clip.
   * @param entityPath - Path to the game object this curve applies to. The entityPath is formatted similar to a pathname, e.g. "/root/spine/leftArm"
   * @param componentType - The class type of the component that is animated
   * @param setValuePath - The name or path to the property being animated. @remarks support property:"a.b", array: "a.b[0]", method: "a.b('c', 0, $value)"
   * @param getValuePath - The name or path to get the value when being animated, default value is property @remarks support property:"a.b", array: "a.b[0]", method: "a.b('c', 0)"
   * @param curve - The animation curve
   */
  addCurveBinding<T extends Component>(
    entityPath: string,
    componentType: new (entity: Entity) => T,
    setValuePath: string,
    getValuePath: string,
    curve: AnimationCurve<KeyframeValueType>
  ): void;

  /**
   * Add curve binding for the clip.
   * @param entityPath - Path to the game object this curve applies to. The entityPath is formatted similar to a pathname, e.g. "/root/spine/leftArm"
   * @param componentType - The type index of the component that is animated
   * @param componentIndex - The class type of the component that is animated
   * @param property - The name or path to the property being animated. @remarks support property:"a.b", array: "a.b[0]", method: "a.b('c', 0, $value)"
   * @param curve - The animation curve
   */
  addCurveBinding<T extends Component>(
    entityPath: string,
    componentType: new (entity: Entity) => T,
    componentIndex: number,
    property: string,
    curve: AnimationCurve<KeyframeValueType>
  ): void;

  /**
   * Add curve binding for the clip.
   * @param entityPath - Path to the game object this curve applies to. The entityPath is formatted similar to a pathname, e.g. "/root/spine/leftArm"
   * @param componentType - The class type of the component that is animated
   * @param componentIndex - The class type of the component that is animated
   * @param setValuePath - The name or path to the property being animated. @remarks support property:"a.b", array: "a.b[0]", method: "a.b('c', 0, $value)"
   * @param getValuePath - The name or path to get the value when being animated, default value is property @remarks support property:"a.b", array: "a.b[0]", method: "a.b('c', 0)"
   * @param curve - The animation curve
   */
  addCurveBinding<T extends Component>(
    entityPath: string,
    componentType: new (entity: Entity) => T,
    componentIndex: number,
    setValuePath: string,
    getValuePath: string,
    curve: AnimationCurve<KeyframeValueType>
  ): void;

  addCurveBinding<T extends Component>(
    entityPath: string,
    componentType: new (entity: Entity) => T,
    propertyOrSetValuePathOrComponentIndex: number | string,
    curveOrSetValuePathOrGetValuePath: AnimationCurve<KeyframeValueType> | string,
    curveOrGetValuePath?: AnimationCurve<KeyframeValueType> | string,
    curve?: AnimationCurve<KeyframeValueType>
  ): void {
    const curveBinding = new AnimationClipCurveBinding();
    curveBinding.relativePath = entityPath;
    curveBinding.type = componentType;

    if (typeof propertyOrSetValuePathOrComponentIndex === "number") {
      curveBinding.typeIndex = propertyOrSetValuePathOrComponentIndex;
      if (typeof curveOrSetValuePathOrGetValuePath === "string" && typeof curveOrGetValuePath === "string") {
        curveBinding.property = curveOrSetValuePathOrGetValuePath;
        curveBinding.getProperty = curveOrGetValuePath;
        curveBinding.curve = curve;
      } else {
        curveBinding.property = <string>curveOrSetValuePathOrGetValuePath;
        curveBinding.curve = <AnimationCurve<KeyframeValueType>>curveOrGetValuePath;
      }
    } else {
      if (
        typeof propertyOrSetValuePathOrComponentIndex === "string" &&
        typeof curveOrSetValuePathOrGetValuePath === "string"
      ) {
        curveBinding.property = propertyOrSetValuePathOrComponentIndex;
        curveBinding.getProperty = curveOrSetValuePathOrGetValuePath;
        curveBinding.curve = <AnimationCurve<KeyframeValueType>>curveOrGetValuePath;
      } else {
        curveBinding.property = propertyOrSetValuePathOrComponentIndex;
        curveBinding.curve = <AnimationCurve<KeyframeValueType>>curveOrSetValuePathOrGetValuePath;
      }
    }

    this._length = Math.max(this._length, curveBinding.curve.length);
    this._curveBindings.push(curveBinding);
  }

  /**
   * Clears all curve bindings from the clip.
   */
  clearCurveBindings(): void {
    this._curveBindings.length = 0;
    this._length = 0;
  }

  /**
   * @internal
   * Samples an animation at a given time.
   * @param entity - The animated entity
   * @param time - The time to sample an animation
   */
  _sampleAnimation(entity: Entity, time: number): void {
    const { _curveBindings: curveBindings } = this;
    for (let i = curveBindings.length - 1; i >= 0; i--) {
      const curve = curveBindings[i];
      const targetEntity = entity.findByPath(curve.relativePath);
      if (targetEntity) {
        const component =
          curve.typeIndex > 0
            ? targetEntity.getComponents(curve.type, AnimationCurveOwner._components)[curve.typeIndex]
            : targetEntity.getComponent(curve.type);
        if (!component) {
          continue;
        }
        const curveOwner = curve._getTempCurveOwner(targetEntity, component);
        if (curveOwner && curve.curve.keys.length) {
          const value = curveOwner.evaluateValue(curve.curve, time, false);
          curveOwner.applyValue(value, 1, false);
        }
      }
    }
  }
}

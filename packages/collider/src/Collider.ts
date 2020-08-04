import { Component, Entity } from "@alipay/o3-core";
import { ColliderFeature } from "./ColliderFeature";
import { MaskList } from "@alipay/o3-core";

/**
 * 碰撞体组件的基类, 定义碰撞体的数据
 */
export class Collider extends Component {
  /**
   * collider flg
   */
  tag: MaskList;
  /**
   * @constructor
   * @param {Entity} entity
   */
  constructor(entity: Entity, props?: any) {
    super(entity, props);

    this.tag = props.tag || MaskList.EVERYTHING;
  }

  /** 事件回调：在对象Enable的时候，挂载到当前的Scene
   * @private
   */
  _onEnable(): void {
    this.scene.findFeature(ColliderFeature).attachCollider(this);
  }

  /** 事件回调：在对象Disable的时候，从当前的Scene移除
   * @private
   */
  _onDisable(): void {
    this.scene.findFeature(ColliderFeature).detachCollider(this);
  }
}

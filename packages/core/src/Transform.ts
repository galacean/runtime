import { vec3, quat, mat4, vec4, mat3, MathUtil } from "@alipay/o3-math";
import { Node } from "./Node";
import { NodeAbility } from "./NodeAbility";
import { vec3Type, vec4Type, mat4Type, mat3Type } from "./type";

/**
 * 世界矩阵改变标记
 */
class WorldChangeFlag {
  private flag = false;
  constructor() {}
  /**
   * 重置标记
   */
  reset() {
    this.flag = false;
  }

  /**
   * @internal
   */
  _mark() {
    this.flag = true;
  }

  /**
   * 获取标记
   */
  get() {
    return this.flag;
  }
}
//CM:vec3Type、vec4Type、mat3Type、mat4Type类型更换
//CM:相关get方法修改为ReadOnly<T>类型
export class Transform extends NodeAbility {
  // Temp
  private static _tempVec3: vec3Type = vec3.create();

  private static _tempVec41: vec4Type = vec4.create();
  private static _tempVec40: vec4Type = vec4.create();

  private static _tempMat30: mat3Type = mat3.create();
  private static _tempMat31: mat3Type = mat3.create();
  private static _tempMat32: mat3Type = mat3.create();

  private static _tempMat40: mat4Type = mat4.create();
  private static _tempMat41: mat4Type = mat4.create();
  private static _tempMat42: mat4Type = mat4.create();
  private static _tempMat43: mat4Type = mat4.create();

  // Dirty flag
  private static _LOCAL_EULER_FLAG: number = 0x1;
  private static _LOCAL_QUAT_FLAG: number = 0x2;

  private static _WORLD_POSITION_FLAG: number = 0x4;
  private static _WORLD_EULER_FLAG: number = 0x8;
  private static _WORLD_QUAT_FLAG: number = 0x10;
  private static _WORLD_SCALE_FLAG: number = 0x20;

  private static _LOCAL_MATRIX_FLAG: number = 0x40;
  private static _WORLD_MATRIX_FLAG: number = 0x80;

  /**
   * _WORLD_MATRIX_FLAG | _WORLD_POSITION_FLAG
   */
  private static _WM_WP_FLAGS: number = Transform._WORLD_MATRIX_FLAG | Transform._WORLD_POSITION_FLAG;

  /**
   * _WORLD_MATRIX_FLAG | _WORLD_EULER_FLAG | _WORLD_QUAT_FLAG
   */
  private static _WM_WE_WQ_FLAGS: number =
    Transform._WORLD_MATRIX_FLAG | Transform._WORLD_EULER_FLAG | Transform._WORLD_QUAT_FLAG;

  /**
   * _WORLD_MATRIX_FLAG | _WORLD_POSITION_FLAG | _WORLD_EULER_FLAG ｜ _WORLD_QUAT_FLAG
   */
  private static _WM_WP_WE_WQ_FLAGS: number =
    Transform._WORLD_MATRIX_FLAG |
    Transform._WORLD_POSITION_FLAG |
    Transform._WORLD_EULER_FLAG |
    Transform._WORLD_QUAT_FLAG;

  /**
   * Transform._WORLD_MATRIX_FLAG | Transform._WORLD_SCALE_FLAG
   */
  private static _WM_WS_FLAGS: number = Transform._WORLD_MATRIX_FLAG | Transform._WORLD_SCALE_FLAG;

  /**
   * Transform._WORLD_MATRIX_FLAG | Transform._WORLD_POSITION_FLAG | Transform._WORLD_SCALE_FLAG
   */
  private static _WM_WP_WS_FLAGS: number =
    Transform._WORLD_MATRIX_FLAG | Transform._WORLD_POSITION_FLAG | Transform._WORLD_SCALE_FLAG;

  /**
   * Transform._WORLD_MATRIX_FLAG | Transform._WORLD_POSITION_FLAG | Transform._WORLD_EULER_FLAG | Transform._WORLD_QUAT_FLAG | Transform._WORLD_SCALE_FLAG
   */
  private static _WM_WP_WE_WQ_WS_FLAGS: number =
    Transform._WORLD_MATRIX_FLAG |
    Transform._WORLD_POSITION_FLAG |
    Transform._WORLD_EULER_FLAG |
    Transform._WORLD_QUAT_FLAG |
    Transform._WORLD_SCALE_FLAG;

  // Properties
  private _position: vec3Type = vec3.create();
  private _rotation: vec3Type = vec3.create();
  private _rotationQuaternion: vec4Type = quat.create();
  private _scale: vec3Type = vec3.fromValues(1, 1, 1);

  private _worldPosition: vec3Type = vec3.create();
  private _worldRotation: vec3Type = vec3.create();
  private _worldRotationQuaternion: vec4Type = quat.create();
  private _lossyWorldScale: vec3Type = vec3.fromValues(1, 1, 1);

  private _localMatrix: mat4Type = mat4.create();
  private _worldMatrix: mat4Type = mat4.create();

  private _dirtyFlag: number = 0;
  private _changeFlags: WorldChangeFlag[] = [];

  /**
   * 是否往上查父节点。
   */
  private _isParentDirty: boolean = true;
  /**
   * 父 transform 缓存。
   */
  private _parentTransformCache: Transform = null;

  /**
   * 局部位置。
   */
  get position(): vec3Type {
    return this._position;
  }

  set position(value: vec3Type) {
    if (this._position !== value) {
      vec3.copy(this._position, value);
    }
    this._setDirtyFlag(Transform._LOCAL_MATRIX_FLAG, true);
    this._updateWorldPositionFlag();
  }

  /**
   * 世界位置。
   */
  get worldPosition(): vec3Type {
    if (this._getDirtyFlag(Transform._WORLD_POSITION_FLAG)) {
      if (this._getParentTransform()) {
        mat4.getTranslation(this._worldPosition, this.worldMatrix);
      } else {
        vec3.copy(this._worldPosition, this._position);
      }
      this._setDirtyFlag(Transform._WORLD_POSITION_FLAG, false);
    }
    return this._worldPosition;
  }

  set worldPosition(value: vec3Type) {
    if (this._worldPosition !== value) {
      vec3.copy(this._worldPosition, value);
    }
    const parent = this._getParentTransform();
    if (parent) {
      const matWorldToLocal = mat4.invert(Transform._tempMat41, parent.worldMatrix);
      vec3.transformMat4(this._worldPosition, value, matWorldToLocal);
    } else {
      vec3.copy(this._worldPosition, value);
    }
    this.position = this._worldPosition;
    this._setDirtyFlag(Transform._WORLD_POSITION_FLAG, false);
  }

  /**
   * 局部旋转，欧拉角表达，单位是角度制。
   */
  get rotation(): vec3Type {
    if (this._getDirtyFlag(Transform._LOCAL_EULER_FLAG)) {
      quat.toEuler(this._rotation, this._rotationQuaternion);
      this._setDirtyFlag(Transform._LOCAL_EULER_FLAG, false);
    }
    return this._rotation;
  }

  set rotation(value: vec3Type) {
    if (this._rotation !== value) {
      vec3.copy(this._rotation, value);
    }
    this._setDirtyFlag(Transform._LOCAL_MATRIX_FLAG | Transform._LOCAL_QUAT_FLAG, true);
    this._setDirtyFlag(Transform._LOCAL_EULER_FLAG, false);
    this._updateWorldRotationFlag();
  }

  /**
   * 世界旋转，欧拉角表达，单位是角度制。
   */
  get worldRotation(): vec3Type {
    if (this._getDirtyFlag(Transform._WORLD_EULER_FLAG)) {
      quat.toEuler(this._worldRotation, this.worldRotationQuaternion);
      this._setDirtyFlag(Transform._WORLD_EULER_FLAG, false);
    }
    return this._worldRotation;
  }

  set worldRotation(value: vec3Type) {
    if (this._worldRotation !== value) {
      vec3.copy(this._worldRotation, value);
    }
    quat.fromEuler(this._worldRotationQuaternion, value[0], value[1], value[2]);
    this.worldRotationQuaternion = this._worldRotationQuaternion;
    this._setDirtyFlag(Transform._WORLD_EULER_FLAG, false);
  }

  /**
   * 局部旋转，四元数表达
   */
  get rotationQuaternion(): vec4Type {
    if (this._getDirtyFlag(Transform._LOCAL_QUAT_FLAG)) {
      quat.fromEuler(this._rotationQuaternion, this._rotation[0], this._rotation[1], this._rotation[2]);
      this._setDirtyFlag(Transform._LOCAL_QUAT_FLAG, false);
    }
    return this._rotationQuaternion;
  }

  set rotationQuaternion(value: vec4Type) {
    if (this._rotationQuaternion !== value) {
      quat.copy(this._rotationQuaternion, value);
    }
    this._setDirtyFlag(Transform._LOCAL_MATRIX_FLAG | Transform._LOCAL_EULER_FLAG, true);
    this._setDirtyFlag(Transform._LOCAL_QUAT_FLAG, false);
    this._updateWorldRotationFlag();
  }

  /**
   * 世界旋转，四元数表达
   */
  get worldRotationQuaternion(): vec4Type {
    if (this._getDirtyFlag(Transform._WORLD_QUAT_FLAG)) {
      const parent = this._getParentTransform();
      if (parent != null) {
        quat.multiply(this._worldRotationQuaternion, parent.worldRotationQuaternion, this.rotationQuaternion);
      } else {
        quat.copy(this._worldRotationQuaternion, this.rotationQuaternion);
      }
      this._setDirtyFlag(Transform._WORLD_QUAT_FLAG, false);
    }
    return this._worldRotationQuaternion;
  }

  set worldRotationQuaternion(value: vec4Type) {
    if (this._worldRotationQuaternion !== value) {
      quat.copy(this._worldRotationQuaternion, value);
    }
    const parent = this._getParentTransform();
    if (parent) {
      const quatWorldToLocal = quat.invert(Transform._tempVec41, parent.worldRotationQuaternion);
      quat.multiply(this._rotationQuaternion, value, quatWorldToLocal);
    } else {
      quat.copy(this._rotationQuaternion, value);
    }
    this.rotationQuaternion = this._rotationQuaternion;
    this._setDirtyFlag(Transform._WORLD_QUAT_FLAG, false);
  }

  /**
   * 局部缩放。
   */
  get scale(): vec3Type {
    return this._scale;
  }

  set scale(value: vec3Type) {
    if (this._scale !== value) {
      vec3.copy(this._scale, value);
    }
    this._setDirtyFlag(Transform._LOCAL_MATRIX_FLAG, true);
    this._updateWorldScaleFlag();
  }

  /**
   * 世界缩放。
   */
  get lossyWorldScale(): vec3Type {
    if (this._getDirtyFlag(Transform._WORLD_SCALE_FLAG)) {
      if (this._getParentTransform()) {
        const scaleMat = this._getScaleMatrix();
        vec3.set(this._lossyWorldScale, scaleMat[0], scaleMat[4], scaleMat[8]);
      } else {
        vec3.copy(this._lossyWorldScale, this._scale);
      }
      this._setDirtyFlag(Transform._WORLD_SCALE_FLAG, false);
    }
    return this._lossyWorldScale;
  }

  /**
   * 局部矩阵。
   */
  get localMatrix(): mat4Type {
    if (this._getDirtyFlag(Transform._LOCAL_MATRIX_FLAG)) {
      mat4.fromRotationTranslationScale(this._localMatrix, this.rotationQuaternion, this._position, this._scale);
      this._setDirtyFlag(Transform._LOCAL_MATRIX_FLAG, false);
    }
    return this._localMatrix;
  }

  set localMatrix(value: mat4Type) {
    if (this._localMatrix !== value) {
      mat4.copy(this._localMatrix, value);
    }
    mat4.decompose(this._localMatrix, this._position, this._rotationQuaternion, this._scale);
    this._setDirtyFlag(Transform._LOCAL_EULER_FLAG, true);
    this._setDirtyFlag(Transform._LOCAL_MATRIX_FLAG, false);
    this._updateAllWorldFlag();
  }

  /**
   * 世界矩阵。
   */
  get worldMatrix(): mat4Type {
    if (this._getDirtyFlag(Transform._WORLD_MATRIX_FLAG)) {
      const parent = this._getParentTransform();
      if (parent) {
        mat4.multiply(this._worldMatrix, parent.worldMatrix, this.localMatrix);
      } else {
        mat4.copy(this._worldMatrix, this.localMatrix);
      }
      this._setDirtyFlag(Transform._WORLD_MATRIX_FLAG, false);
    }
    return this._worldMatrix;
  }

  set worldMatrix(value: mat4Type) {
    if (this._worldMatrix !== value) {
      mat4.copy(this._worldMatrix, value);
    }
    const parent = this._getParentTransform();
    if (parent) {
      const matWorldToLocal = mat4.invert(Transform._tempMat42, parent.worldMatrix);
      mat4.multiply(this._localMatrix, value, matWorldToLocal);
    } else {
      mat4.copy(this._localMatrix, value);
    }
    this.localMatrix = this._localMatrix;
    this._setDirtyFlag(Transform._WORLD_MATRIX_FLAG, false);
  }

  /**
   * @internal
   * 构建一个变换组件。
   */
  constructor(node?: Node) {
    super(node);
  }

  /**
   * 获取世界矩阵的前向量。
   * @param forward - 前向量
   */
  getWorldForward(forward: vec3Type): vec3Type {
    const worldMatrix = this.worldMatrix;
    forward = vec3.set(forward, worldMatrix[8], worldMatrix[9], worldMatrix[10]);
    return vec3.normalize(forward, forward);
  }

  /**
   * 获取世界矩阵的右向量。
   * @param right - 右向量
   */
  getWorldRight(right: vec3Type): vec3Type {
    const worldMatrix = this.worldMatrix;
    right = vec3.set(right, worldMatrix[0], worldMatrix[1], worldMatrix[2]);
    return vec3.normalize(right, right);
  }

  /**
   * 获取世界矩阵的上向量。
   * @param up - 上向量
   */
  getWorldUp(up: vec3Type): vec3Type {
    const worldMatrix = this.worldMatrix;
    up = vec3.set(up, worldMatrix[4], worldMatrix[5], worldMatrix[6]);
    return vec3.normalize(up, up);
  }

  /**
   * 在指定的方向和距离上位移。
   * @param translation - 位移的方向和距离
   * @param relativeToLocal - 是否相对局部空间
   */
  translate(translation: vec3Type, relativeToLocal: boolean = true): void {
    if (relativeToLocal) {
      const rotationMat = Transform._tempMat40;
      mat4.fromQuat(rotationMat, this.rotationQuaternion);
      translation = vec3.transformMat4(Transform._tempVec3, translation, rotationMat);
      this.position = vec3.add(this._position, this._position, translation);
    } else {
      this.worldPosition = vec3.add(this.worldPosition, translation, this._worldPosition);
    }
  }

  /**
   * 根据指定欧拉角旋转。
   * @param rotation - 旋转角度，欧拉角表达，单位是角度制
   * @param relativeToLocal - 是否相对局部空间
   */
  rotate(rotation: vec3Type, relativeToLocal: boolean = true): void {
    const rotateQuat = quat.fromEuler(Transform._tempVec40, rotation[0], rotation[1], rotation[2]);
    this._rotateByQuat(rotateQuat, relativeToLocal);
  }

  /**
   * 根据指定角度围绕指定轴进行旋转。
   * @param axis - 旋转轴
   * @param angle - 旋转角度，单位是角度制
   * @param relativeToLocal - 是否相对局部空间
   */
  rotateByAxis(axis: vec3Type, angle: number, relativeToLocal: boolean = true): void {
    const rad = (angle * Math.PI) / 180;
    const rotateQuat = quat.setAxisAngle(Transform._tempVec40, axis, rad);
    this._rotateByQuat(rotateQuat, relativeToLocal);
  }

  /**
   * 旋转并且保证世界前向量指向目标世界位置。
   * @param worldPosition - 目标世界位置
   * @param worldUp - 世界上向量，默认是 [0, 1, 0]
   */
  lookAt(worldPosition: vec3Type, worldUp?: vec3Type): void {
    const position = this.worldPosition;
    const EPSILON = MathUtil.EPSILON;
    if (
      //todo:如果数学苦做保护了的话，可以删除
      Math.abs(position[0] - worldPosition[0]) < EPSILON &&
      Math.abs(position[1] - worldPosition[1]) < EPSILON &&
      Math.abs(position[2] - worldPosition[2]) < EPSILON
    ) {
      return;
    }
    worldUp = worldUp ?? vec3.set(Transform._tempVec3, 0, 1, 0);
    const modelMatrix = mat4.lookAtR(Transform._tempMat43, position, worldPosition, worldUp); //CM:可采用3x3矩阵优化
    this.worldRotationQuaternion = mat4.getRotation(Transform._tempVec40, modelMatrix); //CM:正常应该再求一次逆，因为lookat的返回值相当于viewMatrix,viewMatrix是世界矩阵的逆，需要测试一个模型和相机分别lookAt一个物体的效果（是否正确和lookAt方法有关）
  }
  /**
   * 注册 Transform ModelMatrix 修改标记。
   * @returns 标记索引
   */
  registerWorldChangeFlag(): WorldChangeFlag {
    const flag = new WorldChangeFlag();
    this._changeFlags.push(flag);
    return flag;
  }

  /**
   * @internal
   */
  _cloneTo(target: Transform): Transform {
    target.localMatrix = this.localMatrix;
    return target;
  }

  /**
   * 获取 worldMatrix：会触发自身以及所有父节点的worldMatrix更新
   * 获取 worldPosition：会触发自身 position 和自身 worldMatrix 以及所有父节点的 worldMatrix 更新
   * 综上所述：任何一个相关变量更新都会造成其中一条完成链路（worldMatrix）的脏标记为 false
   */
  private _updateWorldPositionFlag(): void {
    if (!this._isContainDirtyFlags(Transform._WM_WP_FLAGS)) {
      this._setDirtyFlag(Transform._WM_WP_FLAGS, true);
      this._setDispatchFlags();
      const nodeChildren = this._node.children;
      for (let i: number = 0, n: number = nodeChildren.length; i < n; i++) {
        nodeChildren[i].transform?._updateWorldPositionFlag();
      }
    }
  }

  /**
   * 获取worldMatrix：会触发自身以及所有父节点的worldMatrix更新
   * 获取worldPosition：会触发自身position和自身worldMatrix以及所有父节点的worldMatrix更新
   * 获取worldRotationQuaternion：会触发自身以及所有父节点的worldRotationQuaternion更新
   * 获取worldRotation：会触发自身worldRotation和自身worldRotationQuaternion以及所有父节点的worldRotationQuaternion更新
   * 综上所述：任何一个相关变量更新都会造成其中一条完成链路（worldMatrix或orldRotationQuaternion）的脏标记为false
   */
  private _updateWorldRotationFlag() {
    if (!this._isContainDirtyFlags(Transform._WM_WE_WQ_FLAGS)) {
      this._setDirtyFlag(Transform._WM_WE_WQ_FLAGS, true);
      this._setDispatchFlags();
      const nodeChildren = this._node.children;
      for (let i: number = 0, n: number = nodeChildren.length; i < n; i++) {
        nodeChildren[i].transform?._updateWorldPositionAndRotationFlag(); //父节点旋转发生变化，子节点的世界位置和旋转都需要更新
      }
    }
  }

  /**
   * 获取 worldMatrix：会触发自身以及所有父节点的 worldMatrix 更新
   * 获取 worldPosition：会触发自身 position 和自身 worldMatrix 以及所有父节点的 worldMatrix 更新
   * 获取 worldRotationQuaternion：会触发自身以及所有父节点的 worldRotationQuaternion 更新
   * 获取 worldRotation：会触发自身 worldRotation 和自身 worldRotationQuaternion 以及所有父节点的worldRotationQuaternion更新
   * 综上所述：任何一个相关变量更新都会造成其中一条完成链路（worldMatrix 或 worldRotationQuaternion）的脏标记为false
   */
  private _updateWorldPositionAndRotationFlag() {
    if (!this._isContainDirtyFlags(Transform._WM_WP_WE_WQ_FLAGS)) {
      this._setDirtyFlag(Transform._WM_WP_WE_WQ_FLAGS, true);
      this._setDispatchFlags();
      const nodeChildren = this._node.children;
      for (let i: number = 0, n: number = nodeChildren.length; i < n; i++) {
        nodeChildren[i].transform?._updateWorldPositionAndRotationFlag();
      }
    }
  }

  /**
   * 获取 worldMatrix：会触发自身以及所有父节点的 worldMatrix 更新
   * 获取 worldPosition：会触发自身 position 和自身 worldMatrix 以及所有父节点的 worldMatrix 更新
   * 获取 worldScale：会触发自身以及所有父节点的 worldMatrix 更新
   * 综上所述：任何一个相关变量更新都会造成其中一条完成链路（worldMatrix）的脏标记为 false。
   */
  private _updateWorldScaleFlag() {
    if (!this._isContainDirtyFlags(Transform._WM_WS_FLAGS)) {
      this._setDirtyFlag(Transform._WM_WS_FLAGS, true);
      this._setDispatchFlags();
      const nodeChildren = this._node.children;
      for (let i: number = 0, n: number = nodeChildren.length; i < n; i++) {
        nodeChildren[i].transform?._updateWorldPositionAndScaleFlag();
      }
    }
  }

  /**
   * 获取 worldMatrix：会触发自身以及所有父节点的 worldMatrix 更新
   * 获取 worldPosition：会触发自身 position 和自身 worldMatrix 以及所有父节点的 worldMatrix 更新
   * 获取 worldScale：会触发自身以及所有父节点的worldMatrix更新
   * 综上所述：任何一个相关变量更新都会造成其中一条完成链路（worldMatrix）的脏标记为 false。
   */
  private _updateWorldPositionAndScaleFlag(): void {
    if (!this._isContainDirtyFlags(Transform._WM_WP_WS_FLAGS)) {
      this._setDirtyFlag(Transform._WM_WP_WS_FLAGS, true);
      this._setDispatchFlags();
      const nodeChildren = this._node.children;
      for (let i: number = 0, n: number = nodeChildren.length; i < n; i++) {
        nodeChildren[i].transform?._updateWorldPositionAndScaleFlag();
      }
    }
  }

  /**
   * 更新所有世界标记，原理同上。
   */
  private _updateAllWorldFlag(): void {
    if (!this._isContainDirtyFlags(Transform._WM_WP_WE_WQ_WS_FLAGS)) {
      this._setDirtyFlag(Transform._WM_WP_WE_WQ_WS_FLAGS, true);
      this._setDispatchFlags();
      const nodeChildren = this._node.children;
      for (let i: number = 0, n: number = nodeChildren.length; i < n; i++) {
        nodeChildren[i].transform?._updateAllWorldFlag();
      }
    }
  }

  /**
   * 获取父 transform
   */
  private _getParentTransform(): Transform | null {
    if (!this._isParentDirty) {
      return this._parentTransformCache;
    }
    let parentCache: Transform = null;
    let parent = this._node.parentNode;
    while (parent) {
      const transform = parent.transform;
      if (transform) {
        parentCache = transform;
        break;
      } else {
        parent = parent.parent;
      }
    }
    this._parentTransformCache = parentCache;
    this._isParentDirty = false;
    return parentCache;
  }

  private _getScaleMatrix(): mat3Type {
    const invRotation = Transform._tempVec40;
    const invRotationMat = Transform._tempMat30;
    const worldRotScaMat = Transform._tempMat31;
    const scaMat = Transform._tempMat32;
    mat3.fromMat4(worldRotScaMat, this.worldMatrix);
    quat.invert(invRotation, this.worldRotationQuaternion);
    mat3.fromQuat(invRotation, invRotationMat);
    mat3.multiply(scaMat, invRotationMat, worldRotScaMat);
    return scaMat;
  }

  /**
   * 是否包含所有的脏标记。
   */
  private _isContainDirtyFlags(targetDirtyFlags: number): boolean {
    return (this._dirtyFlag & targetDirtyFlags) === targetDirtyFlags;
  }

  /**
   * 获取脏标记
   */
  private _getDirtyFlag(type: number): boolean {
    return (this._dirtyFlag & type) != 0;
  }

  private _setDirtyFlag(type: number, value: boolean): void {
    if (value) {
      this._dirtyFlag |= type;
    } else {
      this._dirtyFlag &= ~type;
    }
  }

  private _setDispatchFlags() {
    const len = this._changeFlags.length;
    for (let i = len; i >= 0; i--) {
      this._changeFlags[i]._mark();
    }
  }

  private _rotateByQuat(rotateQuat: vec4Type, relativeToLocal: boolean) {
    if (relativeToLocal) {
      quat.multiply(this._rotationQuaternion, this.rotationQuaternion, rotateQuat);
      this.rotationQuaternion = this._rotationQuaternion;
    } else {
      quat.multiply(this._worldRotationQuaternion, this.worldRotationQuaternion, rotateQuat);
      this.worldRotationQuaternion = this._worldRotationQuaternion;
    }
  }

  /**
   * @internal
   */
  _setParentDirty(): void {
    this._isParentDirty = true;
    this._updateAllWorldFlag();
  }
}

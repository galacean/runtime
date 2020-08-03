import { MathUtil } from "./MathUtil";
import { Vector3 } from "./Vector3";
import { Matrix3x3 } from "./Matrix3x3";

/**
 * 四元数
 */
export class Quaternion {
  /**
   * 将两个四元数相加。
   * @param a - 左四元数
   * @param b - 右四元数
   * @param out - 四元数相加结果
   */
  static add(a: Quaternion, b: Quaternion, out: Quaternion): void {
    out.x = a.x + b.x;
    out.y = a.y + b.y;
    out.z = a.z + b.z;
    out.w = a.w + b.w;
  }

  /**
   * 将两个四元数相乘。
   * @param a - 左四元数
   * @param b - 右四元数
   * @param out - 四元数相乘结果
   */
  static multiply(a: Quaternion, b: Quaternion, out: Quaternion): void {
    out.x = a.x * b.x;
    out.y = a.y * b.y;
    out.z = a.z * b.z;
    out.w = a.w * b.w;
  }

  /**
   * 计算共轭四元数。
   * @param a - 输入四元数
   * @param out - 输出的共轭四元数
   */
  static conjugate(a: Quaternion, out: Quaternion): void {
    out.x = -a.x;
    out.y = -a.y;
    out.z = -a.z;
    out.w = a.w;
  }

  /**
   * 计算两个四元数的点积。
   * @param a - 左四元数
   * @param b - 右四元数
   * @returns 返回两个四元数的点积
   */
  static dot(a: Quaternion, b: Quaternion): number {
    return a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w;
  }

  /**
   * 判断两个四元数是否相等。
   * @param a - 四元数
   * @param b - 四元数
   * @returns 返回两个四元数是否相等，是返回 true，否则返回 false
   */
  static equals(a: Quaternion, b: Quaternion): boolean {
    return (
      MathUtil.equals(a.x, b.x) && MathUtil.equals(a.y, b.y) && MathUtil.equals(a.z, b.z) && MathUtil.equals(a.w, b.w)
    );
  }

  /**
   * 通过x,y,z轴的旋转生成四元数。
   * @param x - 绕X轴旋转的角度 pitch
   * @param y - 绕Y轴旋转的角度 yaw
   * @param z - 绕Z轴旋转的角度 roll
   * @param out - 生成的四元数
   */
  static fromEuler(x: number, y: number, z: number, out: Quaternion): void {
    const halfToRad = (0.5 * Math.PI) / 180.0;
    x *= halfToRad;
    y *= halfToRad;
    z *= halfToRad;

    const sx = Math.sin(x);
    const cx = Math.cos(x);
    const sy = Math.sin(y);
    const cy = Math.cos(y);
    const sz = Math.sin(z);
    const cz = Math.cos(z);

    out.x = sx * cy * cz - cx * sy * sz;
    out.y = cx * sy * cz + sx * cy * sz;
    out.z = cx * cy * sz - sx * sy * cz;
    out.w = cx * cy * cz + sx * sy * sz;
  }

  /**
   * 通过矩阵得出对应的四元数。
   * @param a - 3x3矩阵
   * @param out - 生成的四元数
   */
  static fromMat3(a: Matrix3x3, out: Quaternion): void {
    const ae = a.elements;
    let fTrace = ae[0] + ae[4] + ae[8];
    let fRoot;

    if (fTrace > 0.0) {
      // |w| > 1/2, may as well choose w > 1/2
      fRoot = Math.sqrt(fTrace + 1.0); // 2w
      out.w = 0.5 * fRoot;
      fRoot = 0.5 / fRoot; // 1/(4w)
      out.x = (ae[5] - ae[7]) * fRoot;
      out.y = (ae[6] - ae[2]) * fRoot;
      out.z = (ae[1] - ae[3]) * fRoot;
    } else {
      // |w| <= 1/2
      const qMap = ["x", "y", "z", "w"]; // TODO 待优化
      let i = 0;
      if (ae[4] > ae[0]) i = 1;
      if (ae[8] > ae[i * 3 + i]) i = 2;
      let j = (i + 1) % 3;
      let k = (i + 2) % 3;

      fRoot = Math.sqrt(ae[i * 3 + i] - ae[j * 3 + j] - ae[k * 3 + k] + 1.0);
      out[qMap[i]] = 0.5 * fRoot;
      fRoot = 0.5 / fRoot;
      out.w = (ae[j * 3 + k] - ae[k * 3 + j]) * fRoot;
      out[qMap[j]] = (ae[j * 3 + i] + ae[i * 3 + j]) * fRoot;
      out[qMap[k]] = (ae[k * 3 + i] + ae[i * 3 + k]) * fRoot;
    }
  }

  /**
   * 计算四元数的逆。
   * @param a - 四元数的逆
   * @param out - 四元数的逆
   */
  static invert(a: Quaternion, out: Quaternion): void {
    const { x, y, z, w } = a;
    const dot = x * x + y * y + z * z + w * w;
    const invDot = dot ? 1.0 / dot : 0;

    out.x = -x * invDot;
    out.y = -y * invDot;
    out.z = -z * invDot;
    out.w = w * invDot;
  }

  /**
   * 插值四元数。
   * @param a - 左四元数
   * @param b - 右四元数
   * @param t - 插值比例
   * @param out - 插值结果
   */
  static lerp(a: Quaternion, b: Quaternion, t: number, out: Quaternion): void {
    const { x, y, z, w } = a;
    out.x = x + (b.x - x) * t;
    out.y = y + (b.y - y) * t;
    out.z = z + (b.z - z) * t;
    out.w = w + (b.w - w) * t;
  }

  /**
   * 球面插值四元数。
   * @param a - 左四元数
   * @param b - 右四元数
   * @param t - 插值比例
   * @param out - 插值结果
   */
  static slerp(a: Quaternion, b: Quaternion, t: number, out: Quaternion): void {
    const ax = a.x;
    const ay = a.y;
    const az = a.z;
    const aw = a.w;
    let bx = b.x;
    let by = b.y;
    let bz = b.z;
    let bw = b.w;

    let omega, cosom, sinom, scale0, scale1;

    // calc cosine
    cosom = ax * bx + ay * by + az * bz + aw * bw;
    // adjust signs (if necessary)
    if (cosom < 0.0) {
      cosom = -cosom;
      bx = -bx;
      by = -by;
      bz = -bz;
      bw = -bw;
    }
    // calculate coefficients
    if (1.0 - cosom > 0.000001) {
      // standard case (slerp)
      omega = Math.acos(cosom);
      sinom = Math.sin(omega);
      scale0 = Math.sin((1.0 - t) * omega) / sinom;
      scale1 = Math.sin(t * omega) / sinom;
    } else {
      // "from" and "to" quaternions are very close
      //  ... so we can do a linear interpolation
      scale0 = 1.0 - t;
      scale1 = t;
    }
    // calculate final values
    out.x = scale0 * ax + scale1 * bx;
    out.y = scale0 * ay + scale1 * by;
    out.z = scale0 * az + scale1 * bz;
    out.w = scale0 * aw + scale1 * bw;
  }

  /**
   * 将一个四元数归一化。
   * @param a - 四元数
   * @param out - 四元数归一化的结果
   */
  static normalize(a: Quaternion, out: Quaternion): void {
    const { x, y, z, w } = a;
    let len: number = x * x + y * y + z * z + w * w;
    if (len > 0) {
      len = 1 / Math.sqrt(len);
      out.x = x * len;
      out.y = y * len;
      out.z = z * len;
      out.w = w * len;
    }
  }

  /**
   * 绕X轴旋转四元数。
   * @param a - 四元数
   * @param rad - 旋转角度
   * @param out - 旋转后的四元数
   */
  static rotateX(a: Quaternion, rad: number, out: Quaternion): void {
    rad *= 0.5;
    const { x, y, z, w } = a;
    const bx = Math.sin(rad);
    const bw = Math.cos(rad);

    out.x = x * bw + w * bx;
    out.y = y * bw + z * bx;
    out.z = z * bw - y * bx;
    out.w = w * bw - x * bx;
  }

  /**
   * 绕Y轴旋转四元数。
   * @param a - 四元数
   * @param rad - 旋转角度
   * @param out - 旋转后的四元数
   */
  static rotateY(a: Quaternion, rad: number, out: Quaternion): void {
    rad *= 0.5;
    const { x, y, z, w } = a;
    const by = Math.sin(rad);
    const bw = Math.cos(rad);

    out.x = x * bw - z * by;
    out.y = y * bw + w * by;
    out.z = z * bw + x * by;
    out.w = w * bw - y * by;
  }

  /**
   * 绕Z轴旋转四元数。
   * @param a - 四元数
   * @param rad - 旋转角度
   * @param out - 旋转后的四元数
   */
  static rotateZ(a: Quaternion, rad: number, out: Quaternion): void {
    rad *= 0.5;
    const { x, y, z, w } = a;
    const bz = Math.sin(rad);
    const bw = Math.cos(rad);

    out.x = x * bw + y * bz;
    out.y = y * bw - x * bz;
    out.z = z * bw + w * bz;
    out.w = w * bw - z * bz;
  }

  /**
   * 将一个四元数缩放。
   * @param a - 四元数
   * @param s - 缩放因子
   * @param out - 四元数缩放的结果
   */
  static scale(a: Quaternion, s: number, out: Quaternion): void {
    out.x = a.x * s;
    out.y = a.y * s;
    out.z = a.z * s;
    out.w = a.w * s;
  }

  /**
   * 获取四元数的欧拉角。
   * @param a - 四元数
   * @param out - 欧拉角
   */
  static toEuler(a: Quaternion, out: Vector3): void {
    const { x, y, z, w } = a;
    let Threshold = 0.5 - MathUtil.ZeroTolerance;
    let t = w * y - x * z;

    if (t < -Threshold || t > Threshold) {
      // 奇异姿态,俯仰角为±90°
      let sign = Math.sign(t);

      out.z = -2 * sign * Math.atan2(x, w); // yaw
      out.y = sign * (Math.PI / 2.0); // pitch
      out.x = 0; // roll
    } else {
      out.x = Math.atan2(2 * (x * w + y * z), 1 - 2 * (x * x + y * y));
      out.y = Math.asin(2 * (w * y - z * x));
      out.z = Math.atan2(2 * (x * y + z * w), 1 - 2 * (y * y + z * z));
    }

    let radToDegrees = 180.0 / Math.PI;
    out.x *= radToDegrees;
    out.y *= radToDegrees;
    out.z *= radToDegrees;
  }

  /** X轴坐标 */
  x: number;
  /** Y轴坐标 */
  y: number;
  /** Z轴坐标 */
  z: number;
  /** W轴坐标 */
  w: number;

  /**
   * 创建四元数实例。
   * @param x - 默认值0
   * @param y - 默认值0
   * @param z - 默认值0
   * @param w - 默认值1
   */
  constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 1) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  /**
   * 设置x, y, z, w的值。
   * @param x
   * @param y
   * @param z
   * @param w
   * @returns 返回当前四元数
   */
  setValue(x: number, y: number, z: number, w: number): Quaternion {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;

    return this;
  }

  /**
   * 创建一个新的四元数，并用当前四元数初始化。
   * @returns 返回一个新的四元数，并且拷贝当前四元数的值
   */
  clone(): Quaternion {
    let ret = new Quaternion(this.x, this.y, this.z, this.w);
    return ret;
  }

  /**
   * 将当前四元数值拷贝给out四元数。
   * @param out - 目标四元数
   */
  cloneTo(out: Quaternion): void {
    out.x = this.x;
    out.y = this.y;
    out.z = this.z;
    out.w = this.w;
  }

  /**
   * 共轭四元数
   * @returns 返回当前四元数
   */
  conjugate(): Quaternion {
    this.x *= -1;
    this.y *= -1;
    this.z *= -1;

    return this;
  }

  /**
   * 从四元数分解欧拉角，并返回角度。
   * @param out - 输出欧拉角
   * @param q - 输入
   * @returns 返回当前四元数的欧拉角(单位：度)
   */
  getAxisAngle(out: Vector3): number {
    let rad = Math.acos(this.w) * 2.0;
    let s = Math.sin(rad / 2.0);
    if (s != 0.0) {
      out.x = this.x / s;
      out.y = this.y / s;
      out.z = this.z / s;
    } else {
      // If s is zero, return any axis (no rotation - axis does not matter)
      out.x = 1;
      out.y = 0;
      out.z = 0;
    }
    return rad;
  }

  /**
   * 将四元数设置为单位四元数。
   */
  identity(): void {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.w = 1;
  }

  /**
   * 计算一个四元数的标量长度。
   * @returns 返回当前四元数的标量长度
   */
  length(): number {
    const { x, y, z, w } = this;
    return Math.sqrt(x * x + y * y + z * z + w * w);
  }

  /**
   * 计算一个四元数的标量长度的平方。
   * @returns 返回当前四元数的标量长度的平方
   */
  lengthSquared(): number {
    const { x, y, z, w } = this;
    return x * x + y * y + z * z + w * w;
  }

  /**
   * 通过旋转的欧拉角设置四元数。
   * @param axis - 旋转轴向量
   * @param rad - 旋转角度
   * @returns 返回当前四元数
   */
  setAxisAngle(axis: Vector3, rad: number): Quaternion {
    rad *= 0.5;
    const s = Math.sin(rad);
    this.x = axis.x * s;
    this.y = axis.y * s;
    this.z = axis.z * s;
    this.w = Math.cos(rad);
    return this;
  }
}

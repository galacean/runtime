import { InternalAssetType, OasisObject } from "@alipay/o3-base";

/**
 * 使用引用计数管理的资源对象基类
 */
export class AssetObject extends OasisObject {
  public type: InternalAssetType | string;

  public name: string;
  public cacheID: number;
  public needRecreate: boolean;
  constructor() {
    super();
  }
}

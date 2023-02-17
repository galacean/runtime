import { EngineObject } from "../base";
import { AssetPromise } from "./AssetPromise";
import { LoadItem } from "./LoadItem";
import { request, RequestConfig } from "./request";
import { ResourceManager } from "./ResourceManager";
import { ContentRestoreInfo } from "./ContentRestoreInfo";
/**
 * Loader abstract class.
 */
export abstract class Loader<T> {
  /**
   * Register a class with a string name for serialization and deserialization.
   * @param key - class name
   * @param obj - class object
   */
  public static registerClass(className: string, classDefine: { new (...args: any): any }) {
    this._engineObjects[className] = classDefine;
  }

  /**
   * Get the class object by class name.
   * @param key - class name
   * @returns class object
   */
  public static getClass(className: string): { new (...args: any): any } {
    return this._engineObjects[className];
  }

  private static _engineObjects: { [key: string]: any } = {};

  constructor(public readonly useCache: boolean) {}

  request: <U>(url: string, config: RequestConfig) => AssetPromise<U> = request;
  abstract load(item: LoadItem, resourceManager: ResourceManager): AssetPromise<T> | Record<string, AssetPromise<any>>;

  addContentRestoreInfo(engineObject: EngineObject, restoreInfo: ContentRestoreInfo): void {
    restoreInfo._loader = this;
    engineObject.engine.resourceManager._addRestoreContentInfo(engineObject.instanceId, restoreInfo);
  }

  restoreContent(
    host: EngineObject,
    restoreInfo: ContentRestoreInfo
  ): AssetPromise<T> | Record<string, AssetPromise<any>> {
    throw new Error("Method not implemented.");
  }
}

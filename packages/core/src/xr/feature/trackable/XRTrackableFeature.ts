import { IXRTrackable } from "@galacean/engine-design";
import { XRPlatformFeature } from "../XRPlatformFeature";

export class XRTrackableFeature<T extends IXRTrackable> extends XRPlatformFeature {
  getChanges(): { readonly added: T[]; readonly updated: T[]; readonly removed: T[] } {
    return { added: [], updated: [], removed: [] };
  }
}

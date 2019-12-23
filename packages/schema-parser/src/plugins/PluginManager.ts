import * as o3 from "@alipay/o3";
import { Oasis } from "../Oasis";
import { Plugin } from "./Plugin";

export class PluginManager implements PluginHook {
  private registeredPlugins: Set<Plugin> = new Set();
  private plugins: PluginHook[] = [];

  register(plugin: Plugin) {
    this.registeredPlugins.add(plugin);
  }

  boot(oasis: Oasis) {
    for (let plugin of this.registeredPlugins.values()) {
      if (typeof plugin === "function") {
        plugin = plugin(oasis);
      }
      this.plugins.push(plugin);
    }
  }

  reset() {
    this.registeredPlugins.clear();
    this.plugins = [];
  }

  nodeAdded(node: o3.Node) {
    this.delegateMethod("nodeAdded", node);
  }

  private delegateMethod(name: keyof PluginHook, param: any) {
    this.plugins.forEach(plugin => plugin[name] && (plugin[name] as any)(param));
  }
}

export interface PluginHook {
  oasis?: Oasis;
  nodeAdded?(node: o3.Node): any;
  abilityAdded?(ability: o3.NodeAbility): any;
  schemaParsed?(): any;
  abilityDeleted?(id: string): any;
  beforeNodeDeleted?(config: any): any;
  // todo type
  resourceAdded?(resource: any): any;
}

export function pluginHook(options: Partial<{ before: keyof PluginHook; after: keyof PluginHook }>): MethodDecorator {
  return function(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<any>) {
    const method = descriptor.value;

    descriptor.value = async function(...args: any[]) {
      options.before && this.oasis.pluginManager.delegateMethod(options.before, ...args);
      const returnObj = await method.apply(this, arguments);
      options.after && this.oasis.pluginManager.delegateMethod(options.after, returnObj);
      return returnObj;
    };
  };
}

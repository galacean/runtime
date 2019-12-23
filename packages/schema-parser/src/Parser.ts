import { PluginManager, PluginHook } from "./plugins/PluginManager";
import { Oasis } from "./Oasis";
import { defaultCameraPlugin } from "./plugins/DefaultCameraPlugin";
import { Plugin } from "./plugins/Plugin";

export class Parser {
  private pluginManager: PluginManager = new PluginManager();
  public parse(options: Options): Promise<Oasis> {
    return Oasis.create(options, this.pluginManager);
  }

  register(plugin: Plugin) {
    this.pluginManager.register(plugin);
  }

  resetPlugins() {
    this.pluginManager.reset();
  }

  private constructor() {}

  static create(): Parser {
    // todo delete
    const parser = new Parser();
    parser.register(defaultCameraPlugin);
    return parser;
  }
}

export const parser = Parser.create();

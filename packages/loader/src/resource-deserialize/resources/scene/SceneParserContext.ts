import { Entity, Scene } from "@galacean/engine-core";
import type { IScene } from "../schema";
import { ParserContext } from "../parser/ParserContext";

export class SceneParserContext extends ParserContext<Scene, IScene> {
  public override appendChild(entity: Entity): void {
    this.target.addRootEntity(entity);
  }
}

import { MathUtil, Matrix, Ray, Vector2, Vector3, Vector4 } from "@oasis-engine/math";
import { WebGLEngine } from "@oasis-engine/rhi-webgl";
import { Camera, Entity } from "@oasis-engine/core";
import { expect } from "chai";

const canvasDOM = document.createElement("canvas");
canvasDOM.width = 1024;
canvasDOM.height = 1024;

describe("Transform test", function () {
  let entity: Entity;
  before(() => {
    const engine = new WebGLEngine(canvasDOM);
    entity = engine.sceneManager.activeScene.createRootEntity();
  });

  it("World direction", () => {
    const transform = entity.transform;
    transform.position.set(1, -2, 3);
    transform.rotate(0, 45, 0);

    expect(transform.worldForward).to.deep.equal(new Vector3(-0.7071067811865476, -0, -0.7071067811865476));
    expect(transform.worldRight).to.deep.equal(new Vector3(0.7071067811865476, 0, -0.7071067811865476));
    expect(transform.worldUp).to.deep.equal(new Vector3(0, 1, 0));
  });
});

import { Camera, Entity, Script } from "@oasis-engine/core";
import { Vector3 } from "@oasis-engine/math";
import { WebGLEngine } from "@oasis-engine/rhi-webgl";
import chai, { expect } from "chai";
import spies from "chai-spies";

chai.use(spies);

describe("webgl engine test", () => {
  it("create a webgl engine", () => {
    const canvas = document.createElement("canvas");
    const engine = new WebGLEngine(canvas);
    expect(engine).not.be.null;
  });

  it("engine destroy", () => {
    class ParentScript extends Script {
      onAwake() {
        console.log("ParentScript___onAwake");
      }
      onEnable() {
        console.log("ParentScript___onEnable");
      }

      onDisable() {
        console.log("ParentScript___onDisable");
      }

      onUpdate() {
        console.log("ParentScript___onUpdate");
        this.engine.destroy();
      }
    }

    class ChildScript extends Script {
      onAwake() {
        console.log("ChildScript___onAwake");
      }
      onEnable() {
        console.log("ChildScript___onEnable");
      }

      onDisable() {
        console.log("ChildScript___onDisable");
      }

      onUpdate() {
        console.log("ChildScript___onUpdate");
      }
    }

    const canvas = document.createElement("canvas");
    const engine = new WebGLEngine(canvas);
    engine.canvas.resizeByClientSize();
    const scene = engine.sceneManager.activeScene;
    const rootEntity = scene.createRootEntity();
    engine.run();

    // init camera
    const cameraEntity = rootEntity.createChild("camera");
    const camera = cameraEntity.addComponent(Camera);
    camera.isOrthographic = true;
    const pos = cameraEntity.transform.position;
    pos.set(0, 0, 50);
    cameraEntity.transform.position = pos;
    cameraEntity.transform.lookAt(new Vector3(0, 0, 0));

    const parentEntity = new Entity(engine);
    parentEntity.addComponent(ParentScript);
    const childEntity = parentEntity.createChild("test");
    childEntity.addComponent(ChildScript);
    rootEntity.addChild(parentEntity);
  });

  it("engine device lost", () => {
    const canvas = document.createElement("canvas");
    const engine = new WebGLEngine(canvas);
    engine.canvas.resizeByClientSize();
    const scene = engine.sceneManager.activeScene;
    const rootEntity = scene.createRootEntity();

    // init camera
    const cameraEntity = rootEntity.createChild("camera");
    const camera = cameraEntity.addComponent(Camera);

    engine.run();

    const opLost = chai.spy(() => {
      console.log("On device lost.");
    });
    const onRestored = chai.spy(() => {
      console.log("On device restored.");
    });

    engine.on("devicelost", opLost);
    engine.on("devicerestored", onRestored);

    engine.forceLoseDevice();
    setTimeout(() => {
      expect(opLost).to.have.been.called.exactly(1);
      console.log("sdsdsdsdd");
    }, 100);

    setTimeout(() => {
      engine.forceRestoreDevice();
    }, 1000);
  });
});
// npx cross-env TS_NODE_PROJECT=tsconfig.tests.json nyc --reporter=lcov floss -p tests/src/*.test.ts -r ts-node/register
// npx cross-env TS_NODE_PROJECT=tsconfig.tests.json nyc --reporter=lcov floss --path tests -r ts-node/register

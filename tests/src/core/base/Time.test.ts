import { WebGLEngine } from "@oasis-engine/rhi-webgl";
import { expect } from "chai";

describe("Time", () => {
  it("Time basic", () => {
    const engine = new WebGLEngine(document.createElement("canvas"));

    expect(engine.time.frameCount).to.be.equal(0);
    expect(engine.time.elapsedTime).to.be.equal(0);
    expect(engine.time.deltaTime).to.be.equal(0);
    expect(engine.time.actualElapsedTime).to.be.equal(0);
    expect(engine.time.actualDeltaTime).to.be.equal(0);

    expect(engine.time.timeScale).to.be.equal(1);
    engine.time.timeScale = 2;
    expect(engine.time.timeScale).to.be.equal(2);

    expect(engine.time.maximumDeltaTime).to.be.equal(0.333333);
    engine.time.maximumDeltaTime = 0.5;
    expect(engine.time.maximumDeltaTime).to.be.equal(0.5);

    engine.update();
    expect(engine.time.frameCount).to.be.equal(1);
  });
});

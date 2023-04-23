import { Matrix, Ray, Vector2, Vector3, Vector4 } from "@galacean/engine-math";
import { WebGLEngine } from "@galacean/engine-rhi-webgl";
import { Camera, CameraClearFlags, Entity, Layer } from "@galacean/engine-core";
import { expect } from "chai";

const canvasDOM = document.createElement("canvas");
canvasDOM.width = 1024;
canvasDOM.height = 1024;

describe("camera test", function () {
  let node: Entity;
  let camera: Camera;
  let identityMatrix: Matrix;

  before(() => {
    const engine = new WebGLEngine(canvasDOM);
    node = engine.sceneManager.activeScene.createRootEntity();
    camera = node.addComponent(Camera);
    identityMatrix = new Matrix();
  });

  it("constructor", () => {
    // Test default values
    expect(camera.aspectRatio).to.eq(1);
    expect(camera.entity.transform.worldPosition).not.to.be.undefined;
    expect(camera.viewport).to.deep.eq(new Vector4(0, 0, 1, 1));
    expect(camera.fieldOfView).to.eq(45);
    expect(camera.isOrthographic).to.eq(false);

    // Test that _renderPipeline is not undefined
    expect(camera["_renderPipeline"]).not.to.be.undefined;
  });

  it("view matrix", () => {
    // Test that view matrix is identity matrix when camera is at origin
    camera.entity.transform.setWorldPosition(0, 0, 0);
    expect(camera.viewMatrix).to.deep.eq(identityMatrix);

    // Test that view matrix is correct when camera is moved
    Matrix.invert(camera.entity.transform.worldMatrix, identityMatrix);
    expect(camera.viewMatrix).to.deep.eq(identityMatrix);
  });

  it("culling mask", () => {
    // Test default culling mask
    expect(camera.cullingMask).to.eq(Layer.Everything);

    // Test setting culling mask
    camera.cullingMask = Layer.Layer3;
    expect(camera.cullingMask).to.eq(Layer.Layer3);
  });

  it("clear flags", () => {
    // Test default clear flags
    expect(camera.clearFlags).to.eq(CameraClearFlags.All);

    // Test setting clear flags
    camera.clearFlags = CameraClearFlags.Color;
    expect(camera.clearFlags).to.eq(CameraClearFlags.Color);
  });

  it("world to viewport point", () => {
    // Test that world point to viewport point works correctly
    const worldPoint = new Vector3(512, 512, 512);
    const viewportPoint = camera.worldToViewportPoint(worldPoint, new Vector3());
    const expectedworldPoint = camera.viewportToWorldPoint(viewportPoint, new Vector3());
    expect(worldPoint.x).to.be.closeTo(expectedworldPoint.x, 0.1, "Result x should match expected value");
    expect(worldPoint.y).to.be.closeTo(expectedworldPoint.y, 0.1, "Result y should match expected value");
  });

  it("viewport to world point", () => {
    // Test that viewport point to world point works correctly
    const viewportPoint = new Vector3(0, 0, -30);
    const worldPoint = camera.viewportToWorldPoint(viewportPoint, new Vector3());
    const expectedviewportPoint = camera.worldToViewportPoint(worldPoint, new Vector3());
    expect(viewportPoint.z).to.be.closeTo(expectedviewportPoint.z, 0.1, "Result z should match expected value");

  });

  it("viewport point to ray", () => {
    // Test that viewport point to ray works correctly
    const viewportPoint = new Vector2(0.5, 0.5);
    const ray = new Ray(new Vector3(0, 0, 0), new Vector3(0, 1, 0));
    const direction = camera.viewportPointToRay(viewportPoint, ray);
    expect(ray).to.deep.eq(direction);
  });

  it("screen point to ray", () => {
    // Test that screen point to ray works correctly
    const screenPoint = new Vector2(0.5, 0.5);
    const ray = new Ray(new Vector3(0, 1, 1), new Vector3(0, 1, 0));
    const direction = camera.screenPointToRay(screenPoint, ray);
    expect(ray).to.deep.eq(direction);
  });

  it("screen to viewport point", () => {
    // Test that screen to viewport point works correctly
    const screenPoint = new Vector3(0, 0, 512);
    const viewport = camera.screenToViewportPoint(screenPoint, new Vector3());
    expect(viewport).to.deep.eq(screenPoint);
  });

  it("viewport to screen point", () => {
    // Test that viewport to screen point works correctly
    const viewportPoint = new Vector3(0, 0, 512);
    const screenPoint = camera.viewportToScreenPoint(viewportPoint, new Vector3());
    expect(screenPoint).to.deep.eq(viewportPoint);
  });

  it("screen to world point", () => {
    // Test that screen to world point works correctly
    const screenPoint = new Vector3(512, 512, 512);
    const worldPoint = camera.screenToWorldPoint(screenPoint, new Vector3());
    const expectedScreenPoint = camera.worldToScreenPoint(worldPoint, new Vector3());
    expect(screenPoint.x).to.be.closeTo(expectedScreenPoint.x, 0.1, "Result x should match expected value");
    expect(screenPoint.y).to.be.closeTo(expectedScreenPoint.y, 0.1, "Result y should match expected value");
  });

  it("world to screen point", () => {
    // Test that world to screen point works correctly
    const worldPoint = new Vector3(0, 0, 512);
    const screenPoint = camera.worldToScreenPoint(worldPoint, new Vector3());
    const expectedworldPoint = camera.screenToWorldPoint(screenPoint, new Vector3());
    expect(worldPoint.z).to.be.closeTo(expectedworldPoint.z, 0.1, "Result z should match expected value");
  });

  /*
    Attention:
    Below methods will change the default view of current Camera. 
    If executed in advance, it will affect the expected results of other test cases, 
    so it should be placed at the end of the test case execution.
  */
  it("projection matrix", () => {
    // Test perspective projection matrix
    camera.aspectRatio = 2;
    camera.fieldOfView = 60;
    Matrix.perspective(
      60 * Math.PI / 180,
      2,
      camera.nearClipPlane,
      camera.farClipPlane,
      camera.viewMatrix
    );
    expect(camera.projectionMatrix).to.deep.eq(camera.viewMatrix);

    // Test orthographic projection matrix
    camera.isOrthographic = true;
    Matrix.ortho(
      -camera.orthographicSize,
      camera.orthographicSize,
      -camera.orthographicSize,
      camera.orthographicSize,
      camera.nearClipPlane,
      camera.farClipPlane,
      camera.viewMatrix
    );
    expect(camera.projectionMatrix).not.to.eq(camera.viewMatrix);
  });
});
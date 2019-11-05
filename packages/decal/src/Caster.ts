import { raycast } from './cast.js';
import { AMeshRenderer } from '@alipay/o3-mesh';

type RendererArray = Array<AMeshRenderer>;

export class Caster {
  public rendererGroup: RendererArray;
  public ray;

  setRay(ray) {
    this.ray = ray;
  }

  intersect(node) {
    if (!this.ray) {
      console.error('需要设置射线');
    }
    this.getAllMeshRender(node);
    const group = this.rendererGroup;
    let intersection = [];
    for (let i = 0; i < group.length; i += 1) {
      const intersect = raycast(group[i], this.ray);
      if (intersect) {
        intersection = intersection.concat(intersect);
      }
    }
    return intersection;
  }

  getAllMeshRender(node) {
    if (node.abilityArray.length > 0 && node.abilityArray[0] instanceof AMeshRenderer) {
      this.rendererGroup.push(node.abilityArray[0]);
    }
    if (node.children.length > 0) {
      for (let i = 0; i < node.children.length; i += 1) {
        this.getAllMeshRender(node.children[i]);
      }
    }
  }

}
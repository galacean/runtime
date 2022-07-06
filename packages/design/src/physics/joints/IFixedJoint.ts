import { IJoint } from "./IJoint";
import { Vector3 } from "@oasis-engine/math";

/*
 A fixed joint permits no relative movement between two colliders. ie the colliders are glued together.
 */
export interface IFixedJoint extends IJoint {}

import type { Object3D } from 'three'
/** Model contract. Rest pose = rotation 0 at the hinge. Materials named `paint`, `seat`, `wheel` receive option colours.
 *  Lights/buttons need an emissive material. Placeholder car and any licensed .glb must both satisfy this. */
export type Kind = 'hinge' | 'slide' | 'spin' | 'toggle' | 'static'
export interface PartSpec { kind: Kind; label: string; axis?: 'x' | 'y' | 'z'; open?: number }
export interface Cam { pos: [number, number, number]; target: [number, number, number] }
export interface ModelMap {
  driverDoor: string
  cameras: Record<string, Cam>
  tour: { do: 'toggle' | 'view' | 'reset'; id: string }[]
  parts: Record<string, PartSpec>
}
export interface Opt { id: string; label: string; hex: string }
export interface Vehicles {
  vehicles: { name: string | null; image: string | null; description: string | null; availability: string | null }[]
  model: { file: string | null; mobileFile: string | null }
  paints: Opt[]; seats: Opt[]; wheels: Opt[]
}
export interface Showroom { name: string | null; description: string | null; canonical: string | null; contact: Record<string, string | null> }
/** Returns the names of required nodes missing from the loaded model. */
export const validate = (root: Object3D, map: ModelMap): string[] => Object.keys(map.parts).filter((n) => !root.getObjectByName(n))

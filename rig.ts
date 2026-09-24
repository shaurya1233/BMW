import { useEffect } from 'react'
import gsap from 'gsap'
import { Color, type Mesh, type MeshStandardMaterial, type Object3D } from 'three'
import { useStore } from '../store'
import type { ModelMap } from './contract'

/** Drives ANY model that satisfies the contract: placeholder or a licensed .glb. */
export function useRig(root: Object3D | null, map: ModelMap) {
  const on = useStore((s) => s.on), colors = useStore((s) => s.colors)
  useEffect(() => {
    if (!root) return
    for (const [name, p] of Object.entries(map.parts)) {
      const o = root.getObjectByName(name); if (!o) continue
      const t = !!on[name], b = (o.userData.b ??= { r: p.axis ? o.rotation[p.axis] : 0, y: o.position.y })
      if (p.kind === 'hinge' || p.kind === 'spin') gsap.to(o.rotation, { [p.axis!]: b.r + (t ? p.open! : 0), duration: 0.9, ease: 'power3.inOut', overwrite: 'auto' })
      else if (p.kind === 'slide') gsap.to(o.position, { y: b.y + (t ? p.open! : 0), duration: 0.7, ease: 'power3.inOut', overwrite: 'auto' })
      else if (p.kind === 'toggle') o.traverse((m) => {
        const mat = (m as Mesh).isMesh ? ((m as Mesh).material as MeshStandardMaterial) : null
        if (mat?.emissive) gsap.to(mat, { emissiveIntensity: t ? 2.5 : 0, duration: 0.4, overwrite: 'auto' })
      })
    }
  }, [root, map, on])
  useEffect(() => {
    if (!root) return
    root.traverse((m) => {
      const mat = (m as Mesh).isMesh ? ((m as Mesh).material as MeshStandardMaterial) : null
      const g = mat?.name
      if (!mat || (g !== 'paint' && g !== 'seat' && g !== 'wheel')) return
      const base: Color = (mat.userData.c0 ??= mat.color.clone()), c = colors[g] ? new Color(colors[g]) : base
      gsap.to(mat.color, { r: c.r, g: c.g, b: c.b, duration: 0.6, ease: 'power2.out', overwrite: 'auto' })
    })
  }, [root, colors])
}

import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import gsap from 'gsap'
import type { OrbitControls as Ctl } from 'three-stdlib'
import { useStore } from '../store'
import type { Cam, ModelMap } from './contract'

/** Exterior orbit limits, and an interior mode: dolly through the driver door, then limited look-around. */
export function CameraRig({ map }: { map: ModelMap }) {
  const camera = useThree((s) => s.camera), controls = useThree((s) => s.controls) as unknown as Ctl | null
  const view = useStore((s) => s.view), nonce = useStore((s) => s.nonce), prev = useRef('exterior')
  useEffect(() => {
    const c = map.cameras[view], d = map.cameras.door, door = map.driverDoor
    if (!controls || !c) return
    const st = useStore.getState(), inside = view !== 'exterior', was = prev.current !== 'exterior'
    prev.current = view
    const lim = (i: boolean) => { controls.minDistance = i ? 0 : 3; controls.maxDistance = i ? 1.2 : 10; controls.minPolarAngle = i ? 1.2 : 0.2; controls.maxPolarAngle = i ? 1.9 : 1.5; controls.enableZoom = !i }
    controls.minDistance = 0; controls.maxDistance = Infinity; controls.minPolarAngle = 0; controls.maxPolarAngle = Math.PI
    const tl = gsap.timeline({ onUpdate: () => controls.update(), onComplete: () => lim(inside) })
    const go = (p: Cam, t: number) => {
      tl.to(camera.position, { x: p.pos[0], y: p.pos[1], z: p.pos[2], duration: t, ease: 'power3.inOut' })
      tl.to(controls.target, { x: p.target[0], y: p.target[1], z: p.target[2], duration: t, ease: 'power3.inOut' }, '<')
    }
    if (inside && !was) { if (!st.on[door]) st.tog(door, 'Driver door'); go(d, 1.1) }
    go(c, 1.3)
    if (!inside && was && st.on[door]) tl.call(() => useStore.getState().tog(door, 'Driver door'))
    return () => { tl.kill() }
  }, [view, nonce, controls, camera, map])
  return null
}

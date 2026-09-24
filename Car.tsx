import { useCallback, useEffect, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import type { Group, Object3D } from 'three'
import { useStore } from '../store'
import { type ModelMap, validate } from './contract'
import { useRig } from './rig'
import { Placeholder } from './Placeholder'

function Glb({ url, onRoot }: { url: string; onRoot: (o: Object3D) => void }) {
  const { scene } = useGLTF(url)
  useEffect(() => { onRoot(scene) }, [scene, onRoot])
  return <primitive object={scene} />
}

/** Placeholder when vehicles.json model.file is null; otherwise the client's licensed .glb. Same rig, same picking. */
export function Car({ map, file }: { map: ModelMap; file: string | null }) {
  const [root, setRoot] = useState<Object3D | null>(null)
  const st = useStore.getState
  const set = useCallback((o: Object3D | null) => { if (o) setRoot(o) }, [])
  useEffect(() => {
    if (!root) return
    const miss = validate(root, map); st().setMissing(miss)
    if (miss.length) console.warn('Model contract: missing nodes', miss)
  }, [root, map])
  useRig(root, map)
  const part = (o: Object3D | null) => { while (o) { if (map.parts[o.name]) return o.name; o = o.parent } return null }
  return (
    <group
      onPointerOver={(e) => { e.stopPropagation(); const p = part(e.object); st().setHover(p); document.body.style.cursor = p && map.parts[p].kind !== 'static' ? 'pointer' : '' }}
      onPointerOut={() => { st().setHover(null); document.body.style.cursor = '' }}
      onClick={(e) => { e.stopPropagation(); const p = part(e.object); if (p && map.parts[p].kind !== 'static') st().tog(p, map.parts[p].label) }}>
      {file ? <Glb url={file} onRoot={set} /> : <Placeholder ref={set as (g: Group | null) => void} />}
    </group>)
}

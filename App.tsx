import { Suspense, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, Lightformer, MeshReflectorMaterial, OrbitControls, PerformanceMonitor, useProgress } from '@react-three/drei'
import gsap from 'gsap'
import { Car } from './car/Car'
import { CameraRig } from './car/CameraRig'
import { useStore } from './store'
import type { ModelMap, Vehicles } from './car/contract'
import mapJson from '../data/model-map.json'
import vJson from '../data/vehicles.json'

const M = mapJson as unknown as ModelMap, V = vJson as unknown as Vehicles
const DPR = [2, 1.25, 1, 1] // quality tiers: high, medium, low, static (frameloop on demand)
const canGL = () => { try { return !!document.createElement('canvas').getContext('webgl') } catch { return false } }

function Loader() {
  const { progress, active } = useProgress()
  return active ? <div className="load" role="status"><i style={{ width: `${progress}%` }} /><span>Loading vehicle {Math.round(progress)}%</span></div> : null
}

function Fallback() {
  const withImg = V.vehicles.filter((v) => v.image)
  return (<div className="fallback" role="region" aria-label="Vehicle gallery">
    {withImg.length ? withImg.map((v, i) => <img key={i} src={v.image!} alt={v.name ?? 'Vehicle'} loading="lazy" decoding="async" />)
      : <p className="empty">3D view needs WebGL, which is unavailable here. No approved vehicle images have been supplied yet.</p>}
  </div>)
}

function Controls() {
  const s = useStore(), tour = useRef<gsap.core.Timeline | null>(null)
  const parts = Object.entries(M.parts).filter(([, p]) => p.kind !== 'static')
  const stop = () => { tour.current?.kill(); s.setTour(false) }
  const start = () => {
    s.reset(); s.setTour(true)
    const tl = gsap.timeline({ onComplete: () => useStore.getState().setTour(false) })
    M.tour.forEach((t, i) => tl.call(() => {
      const st = useStore.getState()
      if (t.do === 'view') st.setView(t.id); else if (t.do === 'reset') st.reset(); else st.tog(t.id, M.parts[t.id]?.label)
    }, [], i * 2.6))
    tour.current = tl
  }
  return (
    <section className="dock" aria-label="Vehicle controls">
      <p className="sr" role="status" aria-live="polite">{s.note}</p>
      <div className="row" role="group" aria-label="Viewpoint">
        {Object.keys(M.cameras).filter((k) => k !== 'door').map((k) => (
          <button key={k} aria-pressed={s.view === k} onClick={() => s.setView(k)}>{k}</button>))}
      </div>
      <div className="row">
        <button onClick={s.tour ? stop : start}>{s.tour ? 'Stop tour' : 'Guided tour'}</button>
        <button onClick={s.undo} disabled={!s.hist.length}>Undo</button>
        <button onClick={s.reset}>Reset all</button>
        <a className="pri" href="#book">Book a showroom visit</a>
      </div>
      <details><summary>All parts and finishes</summary>
        {s.missing.length > 0 && <p className="err" role="alert">Model is missing contract nodes: {s.missing.join(', ')}</p>}
        <ul className="parts">{parts.map(([n, p]) => (<li key={n}><button aria-pressed={!!s.on[n]} onClick={() => s.tog(n, p.label)}>{p.label}</button></li>))}</ul>
        {(['paint', 'seat', 'wheel'] as const).map((g) => {
          const o = V[`${g}s` as 'paints' | 'seats' | 'wheels']
          return o.length ? (
            <label key={g}>{g} finish
              <select value={s.colors[g] ?? ''} onChange={(e) => s.setColor(g, e.target.value, o.find((k) => k.hex === e.target.value)?.label ?? 'default')}>
                <option value="">Default</option>{o.map((k) => <option key={k.id} value={k.hex}>{k.label}</option>)}
              </select></label>) : <p key={g} className="empty">No approved {g} options supplied.</p>
        })}
      </details>
    </section>)
}

export default function App() {
  const [tier, setTier] = useState(innerWidth < 700 ? 1 : 0), [gen, setGen] = useState(0), [lost, setLost] = useState(false)
  const gl = useMemo(canGL, []), last = useRef(0), hover = useStore((s) => s.hover)
  const reset = () => useStore.getState().setView('exterior')
  return (
    <>
      <header className="hero"><p className="micro">Performance showroom</p><h1>THE ART OF PERFORMANCE</h1><p>PRECISION ENGINEERED. PERFORMANCE DEFINED.</p>
        {!V.model.file && <p className="micro">Generic placeholder vehicle. Not a BMW model.</p>}
        {hover && <p className="micro" aria-hidden="true">{M.parts[hover]?.label}</p>}</header>
      <div className="stage" onDoubleClick={reset} onPointerUp={(e) => { if (e.pointerType === 'touch') { const t = Date.now(); if (t - last.current < 300) reset(); last.current = t } }}>
        {gl ? (
          <Canvas key={gen} dpr={[1, DPR[tier]]} frameloop={tier >= 3 ? 'demand' : 'always'} camera={{ position: M.cameras.exterior.pos, fov: 40, near: 0.05 }}
            aria-label="Interactive 3D vehicle. Every action is also available in the controls panel."
            onCreated={({ gl: r }) => {
              r.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault(); setLost(true) })
              r.domElement.addEventListener('webglcontextrestored', () => { setLost(false); setGen((g) => g + 1) })
            }}>
            <color attach="background" args={['#0A0A0B']} /><fog attach="fog" args={['#0A0A0B', 12, 30]} />
            <PerformanceMonitor onDecline={() => setTier((t) => Math.min(3, t + 1))} />
            <ambientLight intensity={0.15} /><spotLight position={[4, 8, 3]} angle={0.5} penumbra={1} intensity={80} />
            <Environment resolution={128} frames={1}>
              <Lightformer form="rect" intensity={3} position={[0, 5, -4]} scale={[10, 2, 1]} />
              <Lightformer form="rect" intensity={2} position={[-6, 1, 2]} rotation-y={Math.PI / 2} scale={[8, 1, 1]} />
              <Lightformer form="rect" intensity={1.5} color="#1C69D4" position={[6, 1, 3]} rotation-y={-Math.PI / 2} scale={[6, 1, 1]} />
            </Environment>
            <Suspense fallback={null}><Car map={M} file={V.model.file} /></Suspense>
            <mesh rotation-x={-Math.PI / 2}><planeGeometry args={[40, 40]} />
              <MeshReflectorMaterial mirror={0} blur={[300, 80]} resolution={tier === 0 ? 512 : 256} mixBlur={1} mixStrength={40} roughness={1} depthScale={1} color="#0A0A0B" metalness={0.5} /></mesh>
            <OrbitControls makeDefault enablePan={false} enableDamping dampingFactor={0.08} />
            <CameraRig map={M} />
          </Canvas>) : <Fallback />}
        {lost && <p className="err" role="alert">Graphics context lost. Restoring…</p>}
      </div>
      <Loader /><Controls />
    </>)
}

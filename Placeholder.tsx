import { forwardRef, useMemo } from 'react'
import { DoubleSide, type Group, MeshPhysicalMaterial, MeshStandardMaterial } from 'three'
type P = [number, number, number]
type M = MeshStandardMaterial
const Box = ({ a, p, m }: { a: P; p?: P; m: M }) => (<mesh position={p} material={m}><boxGeometry args={a} /></mesh>)
const Lamp = ({ name, p, s }: { name: string; p: P; s: P }) => (
  <group name={name} position={p}><mesh><boxGeometry args={s} /><meshStandardMaterial color="#dfe7f0" emissive="#9fc4ff" emissiveIntensity={0} /></mesh></group>)
const Door = ({ n, win, w, x, z, m }: { n: string; win: string; w: number; x: number; z: number; m: Record<string, M> }) => (
  <group name={n} position={[x, 0.7, z]}>
    <Box a={[w, 0.3, 0.05]} p={[-w / 2, 0.15, 0]} m={m.paint} />
    <group name={win} position={[-w / 2, 0.5, 0]}><Box a={[w - 0.05, 0.4, 0.03]} m={m.glass} /></group>
  </group>)
/** Abstract, generic, procedurally built placeholder. Not a BMW model. Right-hand drive, +X is forward. */
export const Placeholder = forwardRef<Group>((_, ref) => {
  const m = useMemo(() => ({
    paint: new MeshPhysicalMaterial({ name: 'paint', color: '#1C1F24', metalness: 0.7, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.05 }),
    glass: new MeshPhysicalMaterial({ color: '#8fa4b8', roughness: 0, transparent: true, opacity: 0.28, side: DoubleSide }),
    seat: new MeshStandardMaterial({ name: 'seat', color: '#2a2d33', roughness: 0.85 }),
    wheel: new MeshStandardMaterial({ name: 'wheel', color: '#3a3f47', metalness: 0.9, roughness: 0.35 }),
    trim: new MeshStandardMaterial({ color: '#0d0e10', roughness: 0.6 }),
  }), [])
  const seat = (n: string, p: P, w: number) => (
    <group name={n} position={p}><Box a={[0.5, 0.2, w]} m={m.seat} /><Box a={[0.1, 0.5, w]} p={[-0.2, 0.3, 0]} m={m.seat} /></group>)
  const wheel = (n: string, p: P) => (
    <group name={n} position={p}><mesh rotation={[Math.PI / 2, 0, 0]} material={m.wheel}><cylinderGeometry args={[0.35, 0.35, 0.22, 24]} /></mesh></group>)
  return (
    <group ref={ref}>
      <Box a={[4.2, 0.5, 1.8]} p={[0, 0.45, 0]} m={m.paint} />
      <Box a={[1.8, 0.06, 1.7]} p={[-0.15, 1.4, 0]} m={m.paint} />
      {[0.72, -1.02].flatMap((x) => [0.87, -0.87].map((z) => <Box key={`${x}${z}`} a={[0.06, 0.7, 0.06]} p={[x, 1.05, z]} m={m.trim} />))}
      <Box a={[0.04, 0.7, 1.6]} p={[0.76, 1.05, 0]} m={m.glass} />
      <Box a={[0.04, 0.7, 1.6]} p={[-1.06, 1.05, 0]} m={m.glass} />
      <Box a={[0.35, 0.16, 1.6]} p={[0.5, 0.8, 0]} m={m.trim} />
      <group name="bonnet" position={[0.72, 0.73, 0]}><Box a={[1.38, 0.06, 1.7]} p={[0.69, 0, 0]} m={m.paint} /></group>
      <group name="boot" position={[-1.05, 0.73, 0]}><Box a={[1.05, 0.06, 1.7]} p={[-0.525, 0, 0]} m={m.paint} /></group>
      <Door n="door_fl" win="window_fl" w={0.85} x={0.7} z={-0.9} m={m} />
      <Door n="door_fr" win="window_fr" w={0.85} x={0.7} z={0.9} m={m} />
      <Door n="door_rl" win="window_rl" w={0.8} x={-0.2} z={-0.9} m={m} />
      <Door n="door_rr" win="window_rr" w={0.8} x={-0.2} z={0.9} m={m} />
      {seat('seat_fl', [0.15, 0.8, -0.45], 0.5)}{seat('seat_fr', [0.15, 0.8, 0.45], 0.5)}{seat('seat_r', [-0.7, 0.8, 0], 1.4)}
      <group name="steering" position={[0.42, 0.98, 0.45]}><mesh rotation={[0, Math.PI / 2, 0]} material={m.trim}><torusGeometry args={[0.17, 0.02, 8, 24]} /></mesh></group>
      <group name="vent_l" position={[0.66, 0.86, -0.35]}><Box a={[0.02, 0.1, 0.18]} m={m.trim} /></group>
      <group name="vent_r" position={[0.66, 0.86, 0.35]}><Box a={[0.02, 0.1, 0.18]} m={m.trim} /></group>
      <Lamp name="btn_1" p={[0.68, 0.9, 0.1]} s={[0.02, 0.03, 0.03]} /><Lamp name="btn_2" p={[0.68, 0.9, -0.1]} s={[0.02, 0.03, 0.03]} />
      <Lamp name="headlight_l" p={[2.1, 0.55, -0.6]} s={[0.05, 0.12, 0.4]} /><Lamp name="headlight_r" p={[2.1, 0.55, 0.6]} s={[0.05, 0.12, 0.4]} />
      <Lamp name="taillight_l" p={[-2.1, 0.55, -0.6]} s={[0.05, 0.12, 0.4]} /><Lamp name="taillight_r" p={[-2.1, 0.55, 0.6]} s={[0.05, 0.12, 0.4]} />
      {wheel('wheel_fl', [1.3, 0.35, -0.95])}{wheel('wheel_fr', [1.3, 0.35, 0.95])}{wheel('wheel_rl', [-1.3, 0.35, -0.95])}{wheel('wheel_rr', [-1.3, 0.35, 0.95])}
    </group>)
})

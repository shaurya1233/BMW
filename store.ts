import { create } from 'zustand'
interface S {
  on: Record<string, boolean>; colors: Record<string, string | undefined>
  view: string; nonce: number; hover: string | null; missing: string[]; tour: boolean; note: string
  hist: (() => void)[]
  tog: (n: string, label?: string) => void; setColor: (g: string, hex: string, label: string) => void
  setView: (v: string) => void; setHover: (n: string | null) => void; setMissing: (m: string[]) => void
  setTour: (t: boolean) => void; undo: () => void; reset: () => void
}
export const useStore = create<S>((set, get) => ({
  on: {}, colors: {}, view: 'exterior', nonce: 0, hover: null, missing: [], tour: false, note: '', hist: [],
  tog: (n, label = n) => {
    const was = !!get().on[n]
    set((s) => ({ on: { ...s.on, [n]: !was }, note: `${label} ${was ? 'off' : 'on'}`,
      hist: [...s.hist, () => set((t) => ({ on: { ...t.on, [n]: was } }))] }))
  },
  setColor: (g, hex, label) => {
    const prev = get().colors[g]
    set((s) => ({ colors: { ...s.colors, [g]: hex || undefined }, note: `${g} set to ${label}`,
      hist: [...s.hist, () => set((t) => ({ colors: { ...t.colors, [g]: prev } }))] }))
  },
  setView: (v) => set((s) => ({ view: v, nonce: s.nonce + 1, note: `Viewpoint: ${v}` })),
  setHover: (hover) => set({ hover }), setMissing: (missing) => set({ missing }), setTour: (tour) => set({ tour }),
  undo: () => { const h = get().hist, f = h[h.length - 1]; if (f) { f(); set({ hist: h.slice(0, -1), note: 'Last change undone' }) } },
  reset: () => set((s) => ({ on: {}, colors: {}, hist: [], view: 'exterior', nonce: s.nonce + 1, note: 'Reset to default' })),
}))

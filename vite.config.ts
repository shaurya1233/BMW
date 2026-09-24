import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// Shaders can be imported with `?raw` (built into Vite), so no extra plugin is needed.
export default defineConfig({ base: './', plugins: [react()] })

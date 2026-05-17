import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isGhPages = process.env.DEPLOY_TARGET === 'gh-pages' || process.env.GITHUB_ACTIONS;
  return {
    base: isGhPages ? '/afford-print/' : '/',
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] })
    ],
  }
})

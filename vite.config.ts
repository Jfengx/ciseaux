import { rmSync } from 'fs'
import path from 'path'
import { type Plugin, type UserConfig, defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
import Unocss from 'unocss/vite'
import { presetUno, presetAttributify, presetIcons } from 'unocss'
import pkg from './package.json'

rmSync('dist', { recursive: true, force: true }) // v14.14.0

function withDebug(config: UserConfig): UserConfig {
  if (process.env.VSCODE_DEBUG) {
    if (!config.build) config.build = {}
    config.build.sourcemap = true
    config.plugins = (config.plugins || []).concat({
      name: 'electron-vite-debug',
      configResolved(config) {
        const index = config.plugins.findIndex(
          (p) => p.name === 'electron-main-watcher',
        )
        // At present, Vite can only modify plugins in configResolved hook.
        ;(config.plugins as Plugin[]).splice(index, 1)
      },
    })
  }
  return config
}

function presetElectron() {
  return electron({
    main: {
      entry: 'electron/main/index.ts',
      vite: withDebug({
        build: {
          outDir: 'dist/electron/main',
        },
      }),
    },
    // preload: {
    //   input: {
    //     index: path.join(__dirname, "electron/preload/index.ts"),
    //   },
    //   vite: {
    //     build: {
    //       sourcemap: "inline",
    //       outDir: "dist/electron/preload",
    //     },
    //   },
    // },
    renderer: {},
  })
}

function presetUnoCss() {
  return Unocss({
    presets: [presetUno(), presetAttributify(), presetIcons()],
    rules: [
      [
        'p-c',
        {
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%)`,
        },
      ],
      [
        'f-c',
        {
          display: 'flex',
          'justify-content': 'center',
          'align-items': 'center',
        },
      ],
      [
        'f-cj',
        {
          display: 'flex',
          'justify-content': 'center',
        },
      ],
      [
        'f-ca',
        {
          display: 'flex',
          'align-items': 'center',
        },
      ],
      [
        'rel',
        {
          position: 'relative',
        },
      ],
      [
        'abs',
        {
          position: 'absolute',
        },
      ],
    ],
  })
}

export default defineConfig({
  plugins: [vue(), presetUnoCss(), presetElectron()],
  server: {
    host: pkg.env.VITE_DEV_SERVER_HOST,
    port: pkg.env.VITE_DEV_SERVER_PORT,
  },
})

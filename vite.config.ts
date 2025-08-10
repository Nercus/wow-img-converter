import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Unfonts from 'unplugin-fonts/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'

import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'

const host = process.env.TAURI_DEV_HOST

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [
    vue(),
    tailwindcss(),
    Components({
      dts: './src/types/components.d.ts',
      dirs: ['./src/components'],
      resolvers: [
        IconsResolver({
          prefix: false,
          enabledCollections: ['solar', 'clarity', 'svgspinners'],
        }),
      ],
    }),
    AutoImport({
      dts: './src/types/auto-imports.d.ts',
      imports: [
        'vue',
        '@vueuse/core',
        'pinia',
      ],
      dirs: ['./src/composables'],
    }),
    Icons({
      autoInstall: true,
      defaultStyle: 'iconify',
      compiler: 'vue3',
    }),
    Unfonts({
      fontsource: {
        families: [
          {
            name: 'Montserrat',
            variable: {
              wght: true,
              ital: true,
            },
          },
        ],
      },
    }),
  ],
  build: {
    commonjsOptions: {
      include: ['node_modules/**'],
    },
    target: 'esnext',
  },
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
        protocol: 'ws',
        host,
        port: 1421,
      }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ['**/src-tauri/**'],
    },
  },
}))

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'


export default defineConfig({
  base: './',
  plugins: [
    vue(),
    {
      resolveId(id, importor, opt) {
        debugger
      }
    }
  ],
  // resolve: {
  //   alias: [
  //     {
  //       find: '@src',
  //       replacement: path.resolve(__dirname, 'src')
  //     },
  //     {
  //       find: '@common',
  //       replacement: path.resolve(__dirname, 'src/common')
  //     },
  //     {
  //       find: '@components',
  //       replacement: path.resolve(__dirname, 'src/components')
  //     }
  //   ],
  //   dedupe: ['vue']
  // },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    }
  },

  server: {
    host: '0.0.0.0',
    port: 4000
  }
})

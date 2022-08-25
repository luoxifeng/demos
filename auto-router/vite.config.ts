import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import vitePluginVueRouter from './src/plugins/vite-plugin-vue-router'
import Pages from 'vite-plugin-pages'

export default defineConfig({
  base: './',
  resolve: {
    alias: [
      {
        find: '@src',
        replacement: path.resolve(__dirname, 'src')
      },
      {
        find: '@common',
        replacement: path.resolve(__dirname, 'src/common')
      },
      {
        find: '@components',
        replacement: path.resolve(__dirname, 'src/components')
      }
    ],
    dedupe: ['vue']
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    }
  },
  plugins: [
    vue(),
    vitePluginVueRouter({
      auto: 'half',
      extensions: ['vue'],
      exclude: ['**/components/**/*.vue']
    }),
    Pages({
      extensions: ['vue'],
      exclude: ['**/components/*.vue'],
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 5000
  }
})

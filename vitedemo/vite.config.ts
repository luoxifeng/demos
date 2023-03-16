import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import fs from 'fs'


console.log(import.meta.url)
export default defineConfig({
  base: './',
  plugins: [
    vue(),
    {
      // enforce: 'pre',
      name: 'vite:ccc',
      apply: 'build',
      async resolveId(id, importor, opt) {
        // console.log('resolveId=====', {id, importor, opt})
        // if (opt.scan && id === 'ccc') {
        //   const pkg = require('ccc/package.json')
        //   const pkgPath = require.resolve('ccc/package.json')
        //   const moduleEntry = path.join(pkgPath, `.${pkg.module}`)

        //   if (fs.existsSync(moduleEntry)) return moduleEntry
        //   return path.join(pkgPath, `.${pkg.main}`)

        //   console.log('======', pkg.module, path.join(pkgPath, `.${pkg.module}`))
        // }
        // debugger
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

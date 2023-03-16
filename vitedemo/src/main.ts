import { createApp, h } from 'vue'
const all = import.meta.glob('./util/*.ts')
import App from './App.vue'
import 'aaa'
// import 'ccc'


// const j: string = '123'

// console.log('-------vite-------', j)
// console.log('-------vite-------')
console.log(all)
// console.log('-------vite-------')


const app = createApp({
  render: () => h(App)
}).mount('#app')

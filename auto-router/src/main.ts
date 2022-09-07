import { createApp } from 'vue'
import router from './router'
import App from './App.vue'
import Parse, { parseComments } from '../parse'
const app = createApp(App)

app.use(router)
app.mount('#app')

const str = `
123
/**@dd
 * @f13_pcc
 * @name Dialog工厂 @ddd ddd
*      @img dialog.png
       * @desc 这是Dialog工厂，
       使用此工厂可以快速创建通用的dialog
 * @tag 弹窗
 * @author guoying
 **/
`

// console.log('parseComments', parseComments(str))
var g = [/\s+/, /\s*\*\s*/]

const parse = new Parse(str)

parse.parse()

console.log('Parse:', parse.tokens)




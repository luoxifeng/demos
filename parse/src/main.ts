import { createApp } from 'vue'
import App from './App.vue'
import { parseComments } from './lib/dox'
import Parse from './parse'

const app = createApp(App)

app.mount('#app')

const str = `
123
// @dd 123
// /* @4*&dd 1*@ */
/** 222
 * @4*&dd   
 * @f13_pcc
 * @name Dialog工厂 @ddd ddd
*      @img dialog.png  
         		* @desc 这是Dialog工厂，
       使用此工厂可以快速创建通用的dialog
 * @tag 弹窗
 * @author guoying
 **/

			 /**!'
				* @dd
				* @f13_pcc
				* @name Dialog工厂 @ddd ddd
			 *      @img dialog.png  
										* @desc 这是Dialog工厂，
							使用此工厂可以快速创建通用的dialog
				* @tag 弹窗
				* @author guoying
				**/
`

const el = document.querySelector('#code')

if (el) {
  el.innerHTML = JSON.stringify(parseComments(str), null, 2)
}


const parse = new Parse(str)

parse.parse()

console.log('Parse:', parse.tags)
// console.log(el.innerHTML)





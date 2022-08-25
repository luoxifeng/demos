import { watch, ref, Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

let isBack = false
let touchEndX = 0

// 监听 路由事件 新进为true
window.addEventListener(
  'popstate',
  () => {
    isBack = true
  },
  false
)

document.body.addEventListener('touchend', (e: TouchEvent) => {
  touchEndX = e.changedTouches[0].pageX
})

type Result = {
  routeAction: Ref<string>
}

export default (): Result => {
  const route = useRoute()
  const router = useRouter()
  const routeAction = ref<string>('push')

  watch(
    () => route.name,
    (name, oldName) => {
      console.log('route is >>>>>', route, router)
      if (!oldName) {
        routeAction.value = ''
      } else if (touchEndX < 0) {
        routeAction.value = 'none'
        touchEndX = 0
        isBack = false
      } else {
        if (isBack) {
          routeAction.value = 'pop'
        } else {
          routeAction.value = 'push'
        }
        isBack = false
      }

      //设置是否可以侧滑返回
      window.App.gestureAble({
        able: name === 'index' ? 'Y' : 'N',
        wkWebViewAble: 'Y'
      })
    }
  )

  return {
    routeAction
  }
}

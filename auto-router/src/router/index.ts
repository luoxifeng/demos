import { createRouter, createWebHashHistory, Router, RouteRecordRaw } from 'vue-router'
import _routes from '~pages'
console.log('vite-plugin-pages:', _routes)

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'index',
    component: () => import('../pages/Index/Index.vue'),
    meta: {
      title: '首页：手动注册'
    }
  },
  ..._routes
]

const router: Router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPostion) {
    if (savedPostion) {
      return savedPostion
    }
  }
})

// // 导航守卫
// router.beforeEach((to, from) => {
//   console.log('router before', to, from)
// })
window.router = router
export default router

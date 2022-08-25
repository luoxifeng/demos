<template>
  <div class="detail">
    {{$route.meta.title}}
    detail root
      <router-view ></router-view>
  </div>
</template>

<script setup lang="ts">
 
</script>


<route lang="js">

// import { test } from './api.ts'

// export { test1, test2 as KKK } from '@common/api.ts'

// export * from './api.ts'

// // export * as jjj from '../api.ts'

// export const path = '/detail/lllll1'

export default {
    path: '/detail',
    name: 'detail',
    meta: {
        title: '详情页3测试',
        // test
    },
}
</route>

<!-- <route lang="ts" path="/detail" name="detail" ></route> -->

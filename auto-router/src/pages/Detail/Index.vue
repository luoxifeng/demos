<template>
  <div class="detail">
    {{$route.meta.title}}
    detail
  </div>
</template>

<script setup lang="ts">
 
</script>



<route lang="ts">

import { test } from './api.ts'

export { test1, test2 as KKK } from '@common/api.ts'

export * from './api.ts'

// const hh: string = '123'
// export * as jjj from '../api.ts'

// export const path = '/detail/lllll1'

export function name(params: any) {
  console.log('test block')
  return ''
}
// name()
export default {
    // path: '/detail',
    // name: 'detail',
    meta: {
        title: '详情页22222测试',
        test
    },
}
</route>

<!-- <test lang="ts">
export default function name(params: any) {
  console.log('test block')
  return ''
}
// name()
</test> -->



<!-- <route lang="ts" path="/detail" name="detail" ></route> -->

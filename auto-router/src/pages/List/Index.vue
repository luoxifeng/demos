<template>
  <div class="list">
    {{$route.meta.title || "List"}}
    <h3>name:{{$route.name}}</h3>
    <h3>path:{{$route.path}}</h3>
  </div>
</template>

<script setup lang="ts">
 
</script>



<!-- <route lang="ts">
import { test } from './api.ts'

export default {
    path: '/list',
    name: 'list',
    meta: {
        title: '列表页测试',
        test
    },
}
</route> -->
<!-- 
<route>
{
  path: '/list1',
  name: 'List-自定义2块',
  meta: {
    requiresAuth: false
  },
  alias: ['/detail/kk']
}
</route> -->

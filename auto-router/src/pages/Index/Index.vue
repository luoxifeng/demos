<template>
  <div class="index" @click="click">
  {{$route.name}}
    <img src="./bg.png" alt="" style="width: 100%">
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
function click(params:type) {
  router.push('/list')
}
 
</script>

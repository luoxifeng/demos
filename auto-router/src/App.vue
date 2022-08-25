<template>
  <div>
    <h2>自动路由</h2>
    <router-view v-slot="{ Component }">
      <transition>
        <keep-alive :include="['index']">
          <component :is="Component" />
        </keep-alive>
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  // import useRouterTransition from '@src/common/useRouterTransition'

  const router = useRouter()
  // const { routeAction } = useRouterTransition()
</script>

<style lang="less">
  ::-webkit-scrollbar {
    width: 0;
    height: 0;
    display: none;
  }
  .none-leave-from {
    opacity: 0;
  }
  .push-enter-active,
  .push-leave-active,
  .pop-enter-active,
  .pop-leave-active {
    backface-visibility: hidden;
    transition: all 0.3s ease-out;
  }

  .push-leave-to {
    backface-visibility: hidden;
    transform: translate(-20%, 0);
  }

  .push-enter-from {
    backface-visibility: hidden;
    transform: translate(100%, 0);
  }
  .push-enter-active {
    backface-visibility: hidden;
    z-index: 20;
  }
  .push-leave-active {
    backface-visibility: hidden;
    z-index: 0;
  }
  .pop-leave-from {
    z-index: 30;
  }
  .pop-leave-active {
    backface-visibility: hidden;
    transform: translate(100%, 0);
    z-index: 30;
  }
  .pop-enter-from {
    backface-visibility: hidden;
    transform: translate(-20%, 0);
    opacity: 0;
  }
</style>

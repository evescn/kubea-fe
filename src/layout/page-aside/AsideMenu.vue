<template>
    <a-menu :selected-keys="selectedKey" :style="{ height: '100%', boderRight: 0 }" mode="inline">
        <AsideMenuItem :routes="routes" />
    </a-menu>
</template>

<script lang="ts" setup>
import { ref, toRefs, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { usePermissionStore } from '@/stores'
import AsideMenuItem from './AsideMenuItem.vue'

const route = useRoute()
const { routes } = toRefs(usePermissionStore())

const selectedKey = ref([])

watchEffect(() => {
    selectedKey.value = [route.name]
})
</script>

<style scoped>
.ant-menu-item {
    margin: 0 !important;
}
</style>

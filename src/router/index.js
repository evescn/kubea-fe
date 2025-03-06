import { createRouter, createWebHistory } from 'vue-router'
import { usePermissionStore, useUserStore } from '@/stores'

// createRouter 创建路由实例
// 配置 history 模式
// 1. history模式：createWebHistory     地址栏不带 #
// 2. hash模式：   createWebHashHistory 地址栏带 #
// console.log(import.meta.env.DEV)

// vite 中的环境变量 import.meta.env.BASE_URL  就是 vite.config.js 中的 base 配置项
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    // history: createWebHashHistory(),
    routes: [
        {
            path: '/login',
            component: () => import('@/views/login/LoginPage.vue')
        }, // 登录页
        {
            path: '/',
            redirect: '/application/list'
        }
    ]
})

//使用钩子函数对路由进行权限跳转
router.beforeEach(async (to, from, next) => {
    const store = usePermissionStore()
    // 如果没有token, 且访问的是非登录页，拦截到登录，其他情况正常放行
    const useStore = useUserStore()
    if (to.path === '/login') {
        next()
    } else if (!useStore.token && to.path !== '/login') {
        next('/login')
    } else {
        // 设置路由

        // const { setPermission, permission } = storeToRefs(store)
        // console.log('111route-permission', store)
        // console.log('222route-permission', store.permission)
        if (!store.permission) {
            await store.setPermission()
            // console.log('333route-permission', store.permission)
            store.routes.forEach((item) => {
                router.addRoute(item)
            })
            next(to)
        }
        next()
    }
})

export default router

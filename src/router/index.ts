import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/products'
  },
  {
    path: '/products',
    name: 'Products',
    component: () => import('@/views/products/index.vue'),
    meta: { title: '商品库' }
  },
  {
    path: '/batch-edit',
    name: 'BatchEdit',
    component: () => import('@/views/batch-edit/index.vue'),
    meta: { title: '批量编辑' }
  },
  {
    path: '/calendar',
    name: 'Calendar',
    component: () => import('@/views/calendar/index.vue'),
    meta: { title: '活动日历' }
  },
  {
    path: '/materials',
    name: 'Materials',
    component: () => import('@/views/materials/index.vue'),
    meta: { title: '素材管理' }
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: () => import('@/views/tasks/index.vue'),
    meta: { title: '任务记录' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router

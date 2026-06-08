<template>
  <el-container class="app-container">
    <el-aside width="220px" class="sidebar">
      <div class="logo">
        <el-icon :size="32" color="#409EFF">
          <Shop />
        </el-icon>
        <span class="logo-text">电商运营助手</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        background-color="#1f2d3d"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        router
      >
        <el-menu-item index="/products">
          <el-icon><Goods /></el-icon>
          <span>商品库</span>
        </el-menu-item>
        <el-menu-item index="/batch-edit">
          <el-icon><Edit /></el-icon>
          <span>批量编辑</span>
        </el-menu-item>
        <el-menu-item index="/calendar">
          <el-icon><Calendar /></el-icon>
          <span>活动日历</span>
        </el-menu-item>
        <el-menu-item index="/materials">
          <el-icon><Picture /></el-icon>
          <span>素材管理</span>
        </el-menu-item>
        <el-menu-item index="/tasks">
          <el-icon><List /></el-icon>
          <span>任务记录</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentPageTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-tag type="info" effect="dark">
            <el-icon><Clock /></el-icon>
            {{ currentTime }}
          </el-tag>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const activeMenu = computed(() => route.path)
const currentPageTitle = computed(() => route.meta.title as string || '首页')

const currentTime = ref('')
let timer: number

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

onMounted(() => {
  updateTime()
  timer = window.setInterval(updateTime, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style lang="scss" scoped>
.app-container {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.sidebar {
  background-color: #1f2d3d;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background-color: #19232f;
  border-bottom: 1px solid #2d3a4b;

  .logo-text {
    color: #fff;
    font-size: 18px;
    font-weight: 600;
  }
}

.sidebar-menu {
  flex: 1;
  border-right: none;

  .el-menu-item {
    height: 56px;
    line-height: 56px;
    font-size: 15px;

    &.is-active {
      background-color: #2b4a6f !important;
    }

    &:hover {
      background-color: #2d3a4b !important;
    }
  }
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 60px;

  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;

    .el-tag {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
    }
  }
}

.main-content {
  padding: 24px;
  background-color: #f5f7fa;
  overflow-y: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Product, Activity, Material, Task, Shop } from '@/types'
import {
  productStorage,
  activityStorage,
  materialStorage,
  taskStorage,
  shopStorage
} from '@/utils/storage'

export const useMainStore = defineStore('main', () => {
  const products = ref<Product[]>(productStorage.getAll())
  const activities = ref<Activity[]>(activityStorage.getAll())
  const materials = ref<Material[]>(materialStorage.getAll())
  const tasks = ref<Task[]>(taskStorage.getAll())
  const shops = ref<Shop[]>(shopStorage.getAll())

  const shopNames = computed(() => shops.value.map(s => s.name))

  const productStats = computed(() => ({
    total: products.value.length,
    onSale: products.value.filter(p => p.status === 'on_sale').length,
    offSale: products.value.filter(p => p.status === 'off_sale').length,
    abnormal: products.value.filter(p => p.isAbnormal).length,
    lowStock: products.value.filter(p => p.stock < 10).length
  }))

  const taskStats = computed(() => ({
    total: tasks.value.length,
    pending: tasks.value.filter(t => t.status === 'pending').length,
    processing: tasks.value.filter(t => t.status === 'processing').length,
    completed: tasks.value.filter(t => t.status === 'completed').length,
    failed: tasks.value.filter(t => t.status === 'failed').length,
    needReview: tasks.value.filter(t => t.needReview && !t.reviewed).length
  }))

  const activityStats = computed(() => ({
    total: activities.value.length,
    ongoing: activities.value.filter(a => a.status === 'ongoing').length,
    pending: activities.value.filter(a => a.status === 'pending').length,
    approved: activities.value.filter(a => a.status === 'approved').length
  }))

  const materialStats = computed(() => ({
    total: materials.value.length,
    pending: materials.value.filter(m => m.auditStatus === 'pending').length,
    approved: materials.value.filter(m => m.auditStatus === 'approved').length,
    rejected: materials.value.filter(m => m.auditStatus === 'rejected').length
  }))

  function refreshAll() {
    products.value = productStorage.getAll()
    activities.value = activityStorage.getAll()
    materials.value = materialStorage.getAll()
    tasks.value = taskStorage.getAll()
    shops.value = shopStorage.getAll()
  }

  function addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) {
    const newProduct = productStorage.add(product)
    products.value.unshift(newProduct)
  }

  function updateProduct(id: string, updates: Partial<Product>) {
    const index = products.value.findIndex(p => p.id === id)
    if (index !== -1) {
      products.value[index] = {
        ...products.value[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      productStorage.update(id, updates)
    }
  }

  function deleteProduct(id: string) {
    products.value = products.value.filter(p => p.id !== id)
    productStorage.delete(id)
  }

  function batchUpdateProducts(ids: string[], updates: Partial<Product>) {
    const now = new Date().toISOString()
    products.value.forEach(p => {
      if (ids.includes(p.id)) {
        Object.assign(p, updates, { updatedAt: now })
      }
    })
    productStorage.batchUpdate(ids, updates)
  }

  function batchUpdateProductsMap(updatesMap: Map<string, Partial<Product>>) {
    const now = new Date().toISOString()
    products.value.forEach(p => {
      if (updatesMap.has(p.id)) {
        Object.assign(p, updatesMap.get(p.id)!, { updatedAt: now })
      }
    })
    productStorage.batchUpdateMap(updatesMap)
  }

  function batchImportProducts(productsData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[]) {
    productStorage.batchImport(productsData)
    refreshAll()
  }

  function addActivity(activity: Omit<Activity, 'id' | 'createdAt'>) {
    activityStorage.add(activity)
    refreshAll()
  }

  function updateActivity(id: string, updates: Partial<Activity>) {
    activityStorage.update(id, updates)
    refreshAll()
  }

  function deleteActivity(id: string) {
    activityStorage.delete(id)
    refreshAll()
  }

  function addMaterial(material: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>) {
    materialStorage.add(material)
    refreshAll()
  }

  function updateMaterial(id: string, updates: Partial<Material>) {
    materialStorage.update(id, updates)
    refreshAll()
  }

  function deleteMaterial(id: string) {
    materialStorage.delete(id)
    refreshAll()
  }

  function addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
    taskStorage.add(task)
    refreshAll()
  }

  function updateTask(id: string, updates: Partial<Task>) {
    taskStorage.update(id, updates)
    refreshAll()
  }

  function deleteTask(id: string) {
    taskStorage.delete(id)
    refreshAll()
  }

  return {
    products,
    activities,
    materials,
    tasks,
    shops,
    shopNames,
    productStats,
    taskStats,
    activityStats,
    materialStats,
    refreshAll,
    addProduct,
    updateProduct,
    deleteProduct,
    batchUpdateProducts,
    batchImportProducts,
    addActivity,
    updateActivity,
    deleteActivity,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    addTask,
    updateTask,
    deleteTask
  }
})

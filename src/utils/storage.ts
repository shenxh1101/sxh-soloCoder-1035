import { Product, Activity, Material, Task, Shop } from '@/types'

const STORAGE_KEY = 'ecommerce_ops_data'

interface StorageData {
  products: Product[]
  activities: Activity[]
  materials: Material[]
  tasks: Task[]
  shops: Shop[]
  lastSync: string
}

const defaultData: StorageData = {
  products: [],
  activities: [],
  materials: [],
  tasks: [],
  shops: [
    { id: '1', name: '天猫旗舰店', platform: '天猫' },
    { id: '2', name: '京东自营店', platform: '京东' },
    { id: '3', name: '拼多多旗舰店', platform: '拼多多' },
    { id: '4', name: '抖音旗舰店', platform: '抖音' }
  ],
  lastSync: new Date().toISOString()
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

function getData(): StorageData {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      return JSON.parse(data)
    }
  } catch (e) {
    console.error('Failed to load data:', e)
  }
  saveData(defaultData)
  return defaultData
}

function saveData(data: StorageData) {
  try {
    data.lastSync = new Date().toISOString()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('Failed to save data:', e)
  }
}

export const productStorage = {
  getAll(): Product[] {
    return getData().products
  },
  getById(id: string): Product | undefined {
    return getData().products.find(p => p.id === id)
  },
  add(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const data = getData()
    const newProduct: Product = {
      ...product,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    data.products.unshift(newProduct)
    saveData(data)
    return newProduct
  },
  update(id: string, updates: Partial<Product>): Product | undefined {
    const data = getData()
    const index = data.products.findIndex(p => p.id === id)
    if (index !== -1) {
      data.products[index] = {
        ...data.products[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      saveData(data)
      return data.products[index]
    }
    return undefined
  },
  delete(id: string): boolean {
    const data = getData()
    const index = data.products.findIndex(p => p.id === id)
    if (index !== -1) {
      data.products.splice(index, 1)
      saveData(data)
      return true
    }
    return false
  },
  batchUpdate(ids: string[], updates: Partial<Product>): number {
    const data = getData()
    let count = 0
    data.products.forEach(p => {
      if (ids.includes(p.id)) {
        Object.assign(p, updates, { updatedAt: new Date().toISOString() })
        count++
      }
    })
    saveData(data)
    return count
  },
  batchImport(products: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[]): Product[] {
    const data = getData()
    const now = new Date().toISOString()
    const newProducts = products.map(p => ({
      ...p,
      id: generateId(),
      createdAt: now,
      updatedAt: now
    }))
    data.products.unshift(...newProducts)
    saveData(data)
    return newProducts
  }
}

export const activityStorage = {
  getAll(): Activity[] {
    return getData().activities
  },
  getById(id: string): Activity | undefined {
    return getData().activities.find(a => a.id === id)
  },
  add(activity: Omit<Activity, 'id' | 'createdAt'>): Activity {
    const data = getData()
    const newActivity: Activity = {
      ...activity,
      id: generateId(),
      createdAt: new Date().toISOString()
    }
    data.activities.unshift(newActivity)
    saveData(data)
    return newActivity
  },
  update(id: string, updates: Partial<Activity>): Activity | undefined {
    const data = getData()
    const index = data.activities.findIndex(a => a.id === id)
    if (index !== -1) {
      data.activities[index] = { ...data.activities[index], ...updates }
      saveData(data)
      return data.activities[index]
    }
    return undefined
  },
  delete(id: string): boolean {
    const data = getData()
    const index = data.activities.findIndex(a => a.id === id)
    if (index !== -1) {
      data.activities.splice(index, 1)
      saveData(data)
      return true
    }
    return false
  }
}

export const materialStorage = {
  getAll(): Material[] {
    return getData().materials
  },
  getById(id: string): Material | undefined {
    return getData().materials.find(m => m.id === id)
  },
  add(material: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>): Material {
    const data = getData()
    const now = new Date().toISOString()
    const newMaterial: Material = {
      ...material,
      id: generateId(),
      createdAt: now,
      updatedAt: now
    }
    data.materials.unshift(newMaterial)
    saveData(data)
    return newMaterial
  },
  update(id: string, updates: Partial<Material>): Material | undefined {
    const data = getData()
    const index = data.materials.findIndex(m => m.id === id)
    if (index !== -1) {
      data.materials[index] = {
        ...data.materials[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      saveData(data)
      return data.materials[index]
    }
    return undefined
  },
  delete(id: string): boolean {
    const data = getData()
    const index = data.materials.findIndex(m => m.id === id)
    if (index !== -1) {
      data.materials.splice(index, 1)
      saveData(data)
      return true
    }
    return false
  }
}

export const taskStorage = {
  getAll(): Task[] {
    return getData().tasks
  },
  getById(id: string): Task | undefined {
    return getData().tasks.find(t => t.id === id)
  },
  add(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
    const data = getData()
    const now = new Date().toISOString()
    const newTask: Task = {
      ...task,
      id: generateId(),
      createdAt: now,
      updatedAt: now
    }
    data.tasks.unshift(newTask)
    saveData(data)
    return newTask
  },
  update(id: string, updates: Partial<Task>): Task | undefined {
    const data = getData()
    const index = data.tasks.findIndex(t => t.id === id)
    if (index !== -1) {
      const updatesWithTime: Partial<Task> = {
        ...updates,
        updatedAt: new Date().toISOString()
      }
      if (updates.status === 'completed' && !data.tasks[index].completedAt) {
        updatesWithTime.completedAt = new Date().toISOString()
      }
      data.tasks[index] = { ...data.tasks[index], ...updatesWithTime }
      saveData(data)
      return data.tasks[index]
    }
    return undefined
  },
  delete(id: string): boolean {
    const data = getData()
    const index = data.tasks.findIndex(t => t.id === id)
    if (index !== -1) {
      data.tasks.splice(index, 1)
      saveData(data)
      return true
    }
    return false
  }
}

export const shopStorage = {
  getAll(): Shop[] {
    return getData().shops
  },
  add(shop: Omit<Shop, 'id'>): Shop {
    const data = getData()
    const newShop: Shop = { ...shop, id: generateId() }
    data.shops.push(newShop)
    saveData(data)
    return newShop
  },
  update(id: string, updates: Partial<Shop>): Shop | undefined {
    const data = getData()
    const index = data.shops.findIndex(s => s.id === id)
    if (index !== -1) {
      data.shops[index] = { ...data.shops[index], ...updates }
      saveData(data)
      return data.shops[index]
    }
    return undefined
  }
}

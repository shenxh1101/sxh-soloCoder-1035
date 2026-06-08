export interface Product {
  id: string
  sku: string
  title: string
  sellingPoint: string
  category: string
  price: number
  originalPrice: number
  stock: number
  reservedStock: number
  status: 'on_sale' | 'off_sale' | 'pending'
  shop: string
  image: string
  isAbnormal: boolean
  abnormalReason?: string
  createdAt: string
  updatedAt: string
}

export interface Activity {
  id: string
  name: string
  type: string
  platform: string
  shop: string
  startTime: string
  endTime: string
  registrationStart: string
  registrationEnd: string
  discountRule: string
  minPrice: number
  reservedStock: number
  inCharge: string
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'ongoing' | 'ended'
  productIds: string[]
  remark: string
  createdAt: string
}

export interface Material {
  id: string
  name: string
  type: 'main_image' | 'detail_image' | 'short_copy' | 'long_copy'
  category: string
  content: string
  productIds: string[]
  shop: string
  auditStatus: 'pending' | 'approved' | 'rejected'
  auditRemark?: string
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  title: string
  type: string
  relatedId?: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  operator: string
  failReason?: string
  needReview: boolean
  reviewed: boolean
  remark: string
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export interface Shop {
  id: string
  name: string
  platform: string
}

export interface DailyTask {
  date: string
  tasks: Task[]
  summary: {
    total: number
    completed: number
    pending: number
    failed: number
    needReview: number
  }
}

export type ImportType = 'product' | 'material'

export interface ImportRecord {
  id: string
  type: ImportType
  fileName: string
  total: number
  success: number
  failed: number
  operator: string
  createdAt: string
}

<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">批量编辑</h2>
      <div class="page-actions">
        <el-tag type="info" v-if="selectedIds.length > 0">
          已选择 {{ selectedIds.length }} 件商品
        </el-tag>
      </div>
    </div>

    <el-steps :active="currentStep" finish-status="success" style="margin-bottom: 24px">
      <el-step title="筛选商品" />
      <el-step title="选择商品" />
      <el-step title="批量修改" />
      <el-step title="确认执行" />
    </el-steps>

    <div v-if="currentStep === 0" class="step-content">
      <h3 style="margin-bottom: 16px">第一步：筛选需要编辑的商品</h3>
      <div class="filter-bar">
        <div class="filter-item">
          <span class="filter-label">店铺:</span>
          <el-select v-model="filters.shop" placeholder="全部店铺" clearable style="width: 160px">
            <el-option v-for="shop in store.shopNames" :key="shop" :label="shop" :value="shop" />
          </el-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">分类:</span>
          <el-select v-model="filters.category" placeholder="全部分类" clearable style="width: 160px">
            <el-option v-for="cat in categories" :key="cat" :label="cat" :value="cat" />
          </el-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">状态:</span>
          <el-select v-model="filters.status" placeholder="全部状态" clearable style="width: 140px">
            <el-option label="在售" value="on_sale" />
            <el-option label="下架" value="off_sale" />
            <el-option label="待审核" value="pending" />
          </el-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">价格区间:</span>
          <el-input-number v-model="filters.minPrice" :min="0" placeholder="最低价" style="width: 120px" />
          <span style="margin: 0 8px">-</span>
          <el-input-number v-model="filters.maxPrice" :min="0" placeholder="最高价" style="width: 120px" />
        </div>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <el-alert
        :title="`筛选结果：共 ${filteredProducts.length} 件商品`"
        type="success"
        :closable="false"
        style="margin: 16px 0"
      />

      <div style="text-align: right; margin-top: 16px">
        <el-button type="primary" :disabled="filteredProducts.length === 0" @click="nextStep">
          下一步：选择商品
        </el-button>
      </div>
    </div>

    <div v-if="currentStep === 1" class="step-content">
      <h3 style="margin-bottom: 16px">第二步：选择要批量编辑的商品</h3>
      <div style="margin-bottom: 16px">
        <el-button @click="selectAll">全选</el-button>
        <el-button @click="invertSelection">反选</el-button>
        <span style="margin-left: 16px; color: #909399">
          已选择 {{ selectedIds.length }} / {{ filteredProducts.length }} 件
        </span>
      </div>

      <div class="table-container" style="max-height: 400px">
        <el-table
          ref="tableRef"
          :data="filteredProducts"
          stripe
          border
          height="100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column label="商品图" width="70">
            <template #default="{ row }">
              <el-image
                :src="row.image"
                fit="cover"
                style="width: 50px; height: 50px; border-radius: 4px"
              />
            </template>
          </el-table-column>
          <el-table-column prop="sku" label="SKU" width="120" />
          <el-table-column prop="title" label="商品标题" min-width="200" show-overflow-tooltip />
          <el-table-column prop="price" label="价格" width="100">
            <template #default="{ row }">¥{{ row.price }}</template>
          </el-table-column>
          <el-table-column prop="stock" label="库存" width="80" />
          <el-table-column prop="shop" label="店铺" width="140">
            <template #default="{ row }">
              <el-tag size="small">{{ row.shop }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div style="text-align: right; margin-top: 16px">
        <el-button @click="prevStep">上一步</el-button>
        <el-button type="primary" :disabled="selectedIds.length === 0" @click="nextStep">
          下一步：批量修改
        </el-button>
      </div>
    </div>

    <div v-if="currentStep === 2" class="step-content">
      <h3 style="margin-bottom: 16px">第三步：设置批量修改内容</h3>

      <el-tabs v-model="activeTab" style="margin-top: 16px">
        <el-tab-pane label="标题/卖点" name="title">
          <el-form :model="batchForm" label-width="120px" style="max-width: 800px">
            <el-form-item label="修改标题">
              <el-radio-group v-model="batchForm.titleMode">
                <el-radio value="none">不修改</el-radio>
                <el-radio value="replace">替换为</el-radio>
                <el-radio value="prefix">添加前缀</el-radio>
                <el-radio value="suffix">添加后缀</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="batchForm.titleMode !== 'none'" label="标题内容">
              <el-input v-model="batchForm.titleValue" type="textarea" :rows="2" />
            </el-form-item>
            <el-form-item label="修改卖点">
              <el-radio-group v-model="batchForm.sellingPointMode">
                <el-radio value="none">不修改</el-radio>
                <el-radio value="replace">替换为</el-radio>
                <el-radio value="prefix">添加前缀</el-radio>
                <el-radio value="suffix">添加后缀</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="batchForm.sellingPointMode !== 'none'" label="卖点内容">
              <el-input v-model="batchForm.sellingPointValue" type="textarea" :rows="2" />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="价格/库存" name="price">
          <el-form :model="batchForm" label-width="120px" style="max-width: 800px">
            <el-form-item label="修改价格">
              <el-radio-group v-model="batchForm.priceMode">
                <el-radio value="none">不修改</el-radio>
                <el-radio value="fixed">固定价格</el-radio>
                <el-radio value="increase">加价</el-radio>
                <el-radio value="decrease">减价</el-radio>
                <el-radio value="discount">按折扣</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="batchForm.priceMode !== 'none'" label="价格数值">
              <el-input-number v-model="batchForm.priceValue" :min="0" :step="1" />
              <span v-if="batchForm.priceMode === 'discount'" style="margin-left: 8px">折 (如 8.5 表示85折)</span>
              <span v-else-if="batchForm.priceMode === 'increase' || batchForm.priceMode === 'decrease'" style="margin-left: 8px">元</span>
            </el-form-item>
            <el-form-item label="修改库存">
              <el-radio-group v-model="batchForm.stockMode">
                <el-radio value="none">不修改</el-radio>
                <el-radio value="fixed">固定库存</el-radio>
                <el-radio value="increase">增加</el-radio>
                <el-radio value="decrease">减少</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="batchForm.stockMode !== 'none'" label="库存数值">
              <el-input-number v-model="batchForm.stockValue" :min="0" />
              <span style="margin-left: 8px">件</span>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="上下架/状态" name="status">
          <el-form :model="batchForm" label-width="120px" style="max-width: 800px">
            <el-form-item label="修改状态">
              <el-radio-group v-model="batchForm.statusMode">
                <el-radio value="none">不修改</el-radio>
                <el-radio value="on_sale">批量上架</el-radio>
                <el-radio value="off_sale">批量下架</el-radio>
                <el-radio value="pending">设为待审核</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="标记异常">
              <el-radio-group v-model="batchForm.abnormalMode">
                <el-radio value="none">不修改</el-radio>
                <el-radio value="mark">标记为异常</el-radio>
                <el-radio value="unmark">解除异常标记</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="batchForm.abnormalMode === 'mark'" label="异常原因">
              <el-select v-model="batchForm.abnormalReason" style="width: 300px">
                <el-option label="价格异常" value="价格异常" />
                <el-option label="库存异常" value="库存异常" />
                <el-option label="图片异常" value="图片异常" />
                <el-option label="标题违规" value="标题违规" />
                <el-option label="其他原因" value="其他原因" />
              </el-select>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>

      <div style="text-align: right; margin-top: 24px">
        <el-button @click="prevStep">上一步</el-button>
        <el-button type="primary" :disabled="!hasChanges" @click="nextStep">
          下一步：确认执行
        </el-button>
      </div>
    </div>

    <div v-if="currentStep === 3" class="step-content">
      <h3 style="margin-bottom: 16px">第四步：确认批量修改</h3>

      <el-alert
        type="warning"
        :closable="false"
        style="margin-bottom: 20px"
      >
        <template #title>
          <strong>请确认以下修改内容，操作不可撤销！</strong>
        </template>
      </el-alert>

      <div class="preview-box">
        <h4>待修改商品：{{ selectedIds.length }} 件</h4>
        <el-descriptions :column="1" border>
          <el-descriptions-item v-if="batchForm.titleMode !== 'none'" label="标题">
            <el-tag :type="modeType(batchForm.titleMode)">{{ modeText(batchForm.titleMode) }}</el-tag>
            <span style="margin-left: 12px">{{ batchForm.titleValue }}</span>
          </el-descriptions-item>
          <el-descriptions-item v-if="batchForm.sellingPointMode !== 'none'" label="卖点">
            <el-tag :type="modeType(batchForm.sellingPointMode)">{{ modeText(batchForm.sellingPointMode) }}</el-tag>
            <span style="margin-left: 12px">{{ batchForm.sellingPointValue }}</span>
          </el-descriptions-item>
          <el-descriptions-item v-if="batchForm.priceMode !== 'none'" label="价格">
            <el-tag type="danger">{{ priceModeText(batchForm.priceMode) }}</el-tag>
            <span style="margin-left: 12px">
              {{ batchForm.priceValue }}{{ batchForm.priceMode === 'discount' ? '折' : '元' }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item v-if="batchForm.stockMode !== 'none'" label="库存">
            <el-tag type="success">{{ stockModeText(batchForm.stockMode) }}</el-tag>
            <span style="margin-left: 12px">{{ batchForm.stockValue }} 件</span>
          </el-descriptions-item>
          <el-descriptions-item v-if="batchForm.statusMode !== 'none'" label="状态">
            <el-tag type="warning">{{ statusModeText(batchForm.statusMode) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item v-if="batchForm.abnormalMode !== 'none'" label="异常标记">
            <el-tag :type="batchForm.abnormalMode === 'mark' ? 'danger' : 'success'">
              {{ batchForm.abnormalMode === 'mark' ? '标记异常' : '解除异常' }}
            </el-tag>
            <span v-if="batchForm.abnormalMode === 'mark'" style="margin-left: 12px">
              原因：{{ batchForm.abnormalReason }}
            </span>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <div style="text-align: right; margin-top: 24px">
        <el-button @click="prevStep">上一步</el-button>
        <el-button type="primary" @click="executeBatch">确认并执行</el-button>
      </div>
    </div>

    <el-dialog v-model="resultDialogVisible" title="批量修改结果" width="500px">
      <el-result
        :icon="result.success ? 'success' : 'info'"
        :title="result.success ? '执行成功' : '执行完成'"
        :sub-title="`成功修改 ${result.success} 件，失败 ${result.failed} 件`"
      >
        <template #extra>
          <el-button type="primary" @click="resetForm">完成</el-button>
        </template>
      </el-result>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { ElMessage, ElTable } from 'element-plus'
import { useMainStore } from '@/stores/main'
import type { Product } from '@/types'

const store = useMainStore()

const currentStep = ref(0)
const activeTab = ref('title')
const selectedIds = ref<string[]>([])
const resultDialogVisible = ref(false)
const tableRef = ref<InstanceType<typeof ElTable>>()

const filters = reactive({
  shop: '',
  category: '',
  status: '',
  minPrice: null as number | null,
  maxPrice: null as number | null
})

const batchForm = reactive({
  titleMode: 'none',
  titleValue: '',
  sellingPointMode: 'none',
  sellingPointValue: '',
  priceMode: 'none',
  priceValue: 0,
  stockMode: 'none',
  stockValue: 0,
  statusMode: 'none',
  abnormalMode: 'none',
  abnormalReason: ''
})

const result = reactive({
  success: 0,
  failed: 0
})

const categories = computed(() => {
  const cats = new Set(store.products.map(p => p.category))
  return Array.from(cats)
})

const filteredProducts = computed(() => {
  return store.products.filter(p => {
    if (filters.shop && p.shop !== filters.shop) return false
    if (filters.category && p.category !== filters.category) return false
    if (filters.status && p.status !== filters.status) return false
    if (filters.minPrice !== null && p.price < filters.minPrice) return false
    if (filters.maxPrice !== null && p.price > filters.maxPrice) return false
    return true
  })
})

const hasChanges = computed(() => {
  return batchForm.titleMode !== 'none' ||
    batchForm.sellingPointMode !== 'none' ||
    batchForm.priceMode !== 'none' ||
    batchForm.stockMode !== 'none' ||
    batchForm.statusMode !== 'none' ||
    batchForm.abnormalMode !== 'none'
})

const handleSelectionChange = (val: Product[]) => {
  selectedIds.value = val.map(p => p.id)
}

const selectAll = () => {
  if (tableRef.value) {
    tableRef.value.toggleAllSelection()
  } else {
    selectedIds.value = filteredProducts.value.map(p => p.id)
  }
}

const invertSelection = () => {
  if (tableRef.value) {
    filteredProducts.value.forEach(p => {
      tableRef.value!.toggleRowSelection(p, !selectedIds.value.includes(p.id))
    })
  } else {
    const currentSelected = new Set(selectedIds.value)
    selectedIds.value = filteredProducts.value
      .filter(p => !currentSelected.has(p.id))
      .map(p => p.id)
  }
}

const clearSelection = () => {
  if (tableRef.value) {
    tableRef.value.clearSelection()
  }
  selectedIds.value = []
}

const handleSearch = () => {
  clearSelection()
}

const handleReset = () => {
  Object.assign(filters, {
    shop: '',
    category: '',
    status: '',
    minPrice: null,
    maxPrice: null
  })
  clearSelection()
}

const nextStep = () => {
  if (currentStep.value < 3) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    if (currentStep.value === 2) {
      clearSelection()
    }
    currentStep.value--
  }
}

const modeType = (mode: string) => {
  const map: Record<string, string> = {
    replace: 'primary',
    prefix: 'success',
    suffix: 'warning'
  }
  return map[mode] || ''
}

const modeText = (mode: string) => {
  const map: Record<string, string> = {
    replace: '替换',
    prefix: '加前缀',
    suffix: '加后缀'
  }
  return map[mode] || ''
}

const priceModeText = (mode: string) => {
  const map: Record<string, string> = {
    fixed: '固定价格',
    increase: '加价',
    decrease: '减价',
    discount: '折扣'
  }
  return map[mode] || ''
}

const stockModeText = (mode: string) => {
  const map: Record<string, string> = {
    fixed: '固定库存',
    increase: '增加库存',
    decrease: '减少库存'
  }
  return map[mode] || ''
}

const statusModeText = (mode: string) => {
  const map: Record<string, string> = {
    on_sale: '上架',
    off_sale: '下架',
    pending: '待审核'
  }
  return map[mode] || ''
}

const executeBatch = () => {
  let successCount = 0
  const failedCount = 0

  const visibleProductIds = new Set(filteredProducts.value.map(p => p.id))
  const validSelectedIds = selectedIds.value.filter(id => visibleProductIds.has(id))

  if (validSelectedIds.length !== selectedIds.value.length) {
    ElMessage.warning(`已自动排除 ${selectedIds.value.length - validSelectedIds.length} 个不在当前筛选范围内的商品`)
    selectedIds.value = validSelectedIds
  }

  const selectedProducts = store.products.filter(p => validSelectedIds.includes(p.id))

  selectedProducts.forEach(product => {
    const updates: Partial<Product> = {}

    if (batchForm.titleMode !== 'none') {
      if (batchForm.titleMode === 'replace') {
        updates.title = batchForm.titleValue
      } else if (batchForm.titleMode === 'prefix') {
        updates.title = batchForm.titleValue + product.title
      } else if (batchForm.titleMode === 'suffix') {
        updates.title = product.title + batchForm.titleValue
      }
    }

    if (batchForm.sellingPointMode !== 'none') {
      if (batchForm.sellingPointMode === 'replace') {
        updates.sellingPoint = batchForm.sellingPointValue
      } else if (batchForm.sellingPointMode === 'prefix') {
        updates.sellingPoint = batchForm.sellingPointValue + product.sellingPoint
      } else if (batchForm.sellingPointMode === 'suffix') {
        updates.sellingPoint = product.sellingPoint + batchForm.sellingPointValue
      }
    }

    if (batchForm.priceMode !== 'none') {
      if (batchForm.priceMode === 'fixed') {
        updates.price = batchForm.priceValue
      } else if (batchForm.priceMode === 'increase') {
        updates.price = product.price + batchForm.priceValue
      } else if (batchForm.priceMode === 'decrease') {
        updates.price = Math.max(0, product.price - batchForm.priceValue)
      } else if (batchForm.priceMode === 'discount') {
        updates.price = Math.round(product.price * batchForm.priceValue / 10 * 100) / 100
      }
    }

    if (batchForm.stockMode !== 'none') {
      if (batchForm.stockMode === 'fixed') {
        updates.stock = batchForm.stockValue
      } else if (batchForm.stockMode === 'increase') {
        updates.stock = product.stock + batchForm.stockValue
      } else if (batchForm.stockMode === 'decrease') {
        updates.stock = Math.max(0, product.stock - batchForm.stockValue)
      }
    }

    if (batchForm.statusMode !== 'none') {
      updates.status = batchForm.statusMode as Product['status']
    }

    if (batchForm.abnormalMode !== 'none') {
      if (batchForm.abnormalMode === 'mark') {
        updates.isAbnormal = true
        updates.abnormalReason = batchForm.abnormalReason
      } else if (batchForm.abnormalMode === 'unmark') {
        updates.isAbnormal = false
        updates.abnormalReason = ''
      }
    }

    if (Object.keys(updates).length > 0) {
      store.updateProduct(product.id, updates)
      successCount++
    }
  })

  result.success = successCount
  result.failed = failedCount
  resultDialogVisible.value = true

  store.addTask({
    title: `批量修改 - ${selectedIds.length}件商品`,
    type: '批量修改',
    priority: 'high',
    status: 'completed',
    progress: 100,
    operator: '当前用户',
    needReview: true,
    reviewed: false,
    remark: `批量修改 ${successCount} 件商品，包含${buildChangeDescription()}`
  })

  ElMessage.success(`批量修改完成，成功 ${successCount} 件`)
}

const buildChangeDescription = () => {
  const changes: string[] = []
  if (batchForm.titleMode !== 'none') changes.push('标题')
  if (batchForm.sellingPointMode !== 'none') changes.push('卖点')
  if (batchForm.priceMode !== 'none') changes.push('价格')
  if (batchForm.stockMode !== 'none') changes.push('库存')
  if (batchForm.statusMode !== 'none') changes.push('状态')
  if (batchForm.abnormalMode !== 'none') changes.push('异常标记')
  return changes.join('、')
}

const resetForm = () => {
  resultDialogVisible.value = false
  currentStep.value = 0
  selectedIds.value = []
  Object.assign(batchForm, {
    titleMode: 'none',
    titleValue: '',
    sellingPointMode: 'none',
    sellingPointValue: '',
    priceMode: 'none',
    priceValue: 0,
    stockMode: 'none',
    stockValue: 0,
    statusMode: 'none',
    abnormalMode: 'none',
    abnormalReason: ''
  })
}
</script>

<style lang="scss" scoped>
.step-content {
  flex: 1;
  overflow-y: auto;
}

.preview-box {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 8px;

  h4 {
    margin-bottom: 16px;
    color: #303133;
  }
}
</style>

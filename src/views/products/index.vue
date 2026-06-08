<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">商品库</h2>
      <div class="page-actions">
        <el-button type="primary" @click="handleImport">
          <el-icon><Upload /></el-icon>
          导入商品
        </el-button>
        <el-button @click="generateMock">
          <el-icon><MagicStick /></el-icon>
          生成演示数据
        </el-button>
        <el-button type="success" @click="handleExport">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
      </div>
    </div>

    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-label">商品总数</div>
        <div class="stat-value">{{ store.productStats.total }}</div>
        <el-icon class="stat-icon" :size="28"><Goods /></el-icon>
      </div>
      <div class="stat-card success">
        <div class="stat-label">在售商品</div>
        <div class="stat-value">{{ store.productStats.onSale }}</div>
        <el-icon class="stat-icon" :size="28"><CircleCheck /></el-icon>
      </div>
      <div class="stat-card warning">
        <div class="stat-label">异常商品</div>
        <el-badge :value="store.productStats.abnormal" class="stat-badge">
          <div class="stat-value" style="font-size: 32px;">{{ store.productStats.abnormal }}</div>
        </el-badge>
        <el-icon class="stat-icon" :size="28"><Warning /></el-icon>
      </div>
      <div class="stat-card info">
        <div class="stat-label">低库存预警</div>
        <div class="stat-value">{{ store.productStats.lowStock }}</div>
        <el-icon class="stat-icon" :size="28"><Clock /></el-icon>
      </div>
    </div>

    <div class="filter-bar">
      <div class="filter-item">
        <span class="filter-label">店铺:</span>
        <el-select v-model="filters.shop" placeholder="全部店铺" clearable style="width: 160px">
          <el-option v-for="shop in store.shopNames" :key="shop" :label="shop" :value="shop" />
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
        <span class="filter-label">分类:</span>
        <el-select v-model="filters.category" placeholder="全部分类" clearable style="width: 140px">
          <el-option v-for="cat in categories" :key="cat" :label="cat" :value="cat" />
        </el-select>
      </div>
      <div class="filter-item">
        <span class="filter-label">仅异常:</span>
        <el-switch v-model="filters.onlyAbnormal" />
      </div>
      <div class="filter-item">
        <span class="filter-label">搜索:</span>
        <el-input
          v-model="filters.keyword"
          placeholder="SKU/标题"
          clearable
          style="width: 200px"
          :prefix-icon="Search"
        />
      </div>
      <el-button type="primary" @click="handleReset">重置</el-button>
    </div>

    <div class="table-container">
      <el-table
        :data="filteredProducts"
        stripe
        border
        height="100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="商品图" width="80">
          <template #default="{ row }">
            <el-image
              :src="row.image"
              :preview-src-list="[row.image]"
              fit="cover"
              style="width: 60px; height: 60px; border-radius: 4px"
            >
              <template #error>
                <div class="image-error">
                </div>
              </template>
            </el-image>
          </template>
        </el-table-column>
        <el-table-column prop="sku" label="SKU" width="120" />
        <el-table-column prop="title" label="商品标题" min-width="200">
          <template #default="{ row }">
            <div>
              <div class="product-title">{{ row.title }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="sellingPoint" label="卖点" width="180" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" width="100" />
        <el-table-column label="价格" width="120">
          <template #default="{ row }">
            <div class="price-info">
              <span class="current-price">¥{{ row.price }}</span>
              <span class="original-price">¥{{ row.originalPrice }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="库存" width="100">
          <template #default="{ row }">
            <el-tag :type="row.stock < 10 ? 'danger' : row.stock < 50 ? 'warning' : 'success'">
              {{ row.stock }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="shop" label="店铺" width="140">
          <template #default="{ row }">
            <el-tag size="small">{{ row.shop }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="异常" width="80">
          <template #default="{ row }">
            <el-tooltip v-if="row.isAbnormal" :content="row.abnormalReason" placement="top">
              <el-icon :size="20" color="#f56c6c"><WarningFilled /></el-icon>
            </el-tooltip>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button
              size="small"
              :type="row.isAbnormal ? 'success' : 'warning'"
              @click="toggleAbnormal(row)"
            >
              {{ row.isAbnormal ? '解除异常' : '标记异常' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="editDialogVisible" title="编辑商品" width="800px">
      <el-form v-if="currentProduct" :model="currentProduct" label-width="100px">
        <el-form-item label="商品标题">
          <el-input v-model="currentProduct.title" />
        </el-form-item>
        <el-form-item label="销售卖点">
          <el-input v-model="currentProduct.sellingPoint" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="售价">
              <el-input-number v-model="currentProduct.price" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="原价">
              <el-input-number v-model="currentProduct.originalPrice" :min="0" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="库存">
              <el-input-number v-model="currentProduct.stock" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
            <el-select v-model="currentProduct.status" style="width: 100%">
              <el-option label="在售" value="on_sale" />
              <el-option label="下架" value="off_sale" />
              <el-option label="待审核" value="pending" />
            </el-select>
          </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="所属店铺">
          <el-select v-model="currentProduct.shop" style="width: 100%">
            <el-option v-for="shop in store.shopNames" :key="shop" :label="shop" :value="shop" />
          </el-select>
        </el-form-item>
        <el-form-item label="图片链接">
          <el-input v-model="currentProduct.image" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="importDialogVisible" title="导入商品" width="600px">
      <el-alert
        title="支持Excel/CSV"
        type="info"
        :closable="false"
        style="margin-bottom: 20px"
      >
        <template #title>
          支持导入 Excel (.xlsx, .xls) 和 CSV 格式文件
        </template>
      </el-alert>
      <el-upload
        class="upload-demo"
        drag
        :auto-upload="false"
        :on-change="handleFileChange"
        :limit="1"
        accept=".xlsx,.xls,.csv"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">
            支持的字段：SKU、商品标题、卖点、分类、价格、原价、库存、状态、店铺、图片</div>
        </template>
      </el-upload>
      <el-form style="margin-top: 20px">
        <el-form-item label="默认店铺">
          <el-select v-model="importDefaultShop" style="width: 100%">
            <el-option v-for="shop in store.shopNames" :key="shop" :label="shop" :value="shop" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!importFile" @click="confirmImport">开始导入</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="abnormalDialogVisible" title="标记异常" width="500px">
      <el-form :model="abnormalForm" label-width="100px">
        <el-form-item label="异常原因">
          <el-select v-model="abnormalForm.reason" style="width: 100%">
            <el-option label="价格异常" value="价格异常" />
            <el-option label="库存异常" value="库存异常" />
            <el-option label="图片异常" value="图片异常" />
            <el-option label="标题违规" value="标题违规" />
            <el-option label="其他原因" value="其他原因" />
          </el-select>
        </el-form-item>
        <el-form-item label="详细说明">
          <el-input v-model="abnormalForm.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="abnormalDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAbnormal">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { useMainStore } from '@/stores/main'
import { generateMockData from '@/utils/mock'
import { parseImportFile, transformToProducts, exportToExcel } from '@/utils/import'
import type { Product } from '@/types'

const store = useMainStore()

const filters = ref({
  shop: '',
  status: '',
  category: '',
  onlyAbnormal: false,
  keyword: ''
})

const selectedProducts = ref<Product[]>([])
const editDialogVisible = ref(false)
const importDialogVisible = ref(false)
const abnormalDialogVisible = ref(false)
const currentProduct = ref<Product | null>(null)
const importFile = ref<File | null>(null)
const importDefaultShop = ref(store.shopNames[0] || '')

const abnormalForm = ref({
  reason: '',
  remark: ''
})

const abnormalTarget = ref<Product | null>(null)

const categories = computed(() => {
  const cats = new Set(store.products.map(p => p.category))
  return Array.from(cats)
})

const filteredProducts = computed(() => {
  return store.products.filter(p => {
    if (filters.value.shop && p.shop !== filters.value.shop) return false
    if (filters.value.status && p.status !== filters.value.status) return false
    if (filters.value.category && p.category !== filters.value.category) return false
    if (filters.value.onlyAbnormal && !p.isAbnormal) return false
    if (filters.value.keyword) {
      const kw = filters.value.keyword.toLowerCase()
      if (!p.sku.toLowerCase().includes(kw) && !p.title.toLowerCase().includes(kw)) return false
    }
    return true
  })
})

const statusType = (status: string) => {
  const map: Record<string, string> = {
    on_sale: 'success',
    off_sale: 'info',
    pending: 'warning'
  }
  return map[status] || ''
}

const statusText = (status: string) => {
  const map: Record<string, string> = {
    on_sale: '在售',
    off_sale: '下架',
    pending: '待审核'
  }
  return map[status] || ''
}

const handleSelectionChange = (val: Product[]) => {
  selectedProducts.value = val
}

const handleReset = () => {
  filters.value = {
    shop: '',
    status: '',
    category: '',
    onlyAbnormal: false,
    keyword: ''
  }
}

const handleEdit = (row: Product) => {
  currentProduct.value = { ...row }
  editDialogVisible.value = true
}

const saveEdit = () => {
  if (!currentProduct.value) return
  const oldProduct = store.products.find(p => p.id === currentProduct.value!.id)
  const changes: string[] = []
  if (oldProduct && currentProduct.value) {
    if (oldProduct.title !== currentProduct.value.title) changes.push('标题')
    if (oldProduct.sellingPoint !== currentProduct.value.sellingPoint) changes.push('卖点')
    if (oldProduct.price !== currentProduct.value.price) changes.push('价格')
    if (oldProduct.stock !== currentProduct.value.stock) changes.push('库存')
    if (oldProduct.status !== currentProduct.value.status) changes.push('状态')
    if (oldProduct.shop !== currentProduct.value.shop) changes.push('店铺')
  }
  store.updateProduct(currentProduct.value.id, {
    title: currentProduct.value.title,
    sellingPoint: currentProduct.value.sellingPoint,
    price: currentProduct.value.price,
    originalPrice: currentProduct.value.originalPrice,
    stock: currentProduct.value.stock,
    status: currentProduct.value.status,
    shop: currentProduct.value.shop,
    image: currentProduct.value.image
  })
  editDialogVisible.value = false
  ElMessage.success('保存成功')
  if (changes.length > 0) {
    store.addTask({
      title: `商品编辑 - ${currentProduct.value.sku}`,
      type: '批量修改',
      priority: 'medium',
      status: 'completed',
      progress: 100,
      operator: '当前用户',
      needReview: changes.includes('价格') || changes.includes('库存'),
      reviewed: false,
      remark: `修改了${changes.join('、')}`
    })
  }
}

const toggleAbnormal = (row: Product) => {
  if (row.isAbnormal) {
    ElMessageBox.confirm('确定要解除该商品的异常标记吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      store.updateProduct(row.id, { isAbnormal: false, abnormalReason: '' })
      ElMessage.success('已解除异常标记')
      store.addTask({
        title: `解除异常 - ${row.sku}`,
        type: '商品导入',
        priority: 'medium',
        status: 'completed',
        progress: 100,
        operator: '当前用户',
        needReview: false,
        reviewed: false,
        remark: '商品异常标记已解除'
      })
    })
  } else {
    abnormalTarget.value = row
    abnormalForm.value = { reason: '', remark: '' }
    abnormalDialogVisible.value = true
  }
}

const confirmAbnormal = () => {
  if (!abnormalTarget.value) return
  const reason = abnormalForm.value.remark
    ? `${abnormalForm.value.reason}: ${abnormalForm.value.remark}`
    : abnormalForm.value.reason
  store.updateProduct(abnormalTarget.value.id, {
    isAbnormal: true,
    abnormalReason: reason
  })
  abnormalDialogVisible.value = false
  ElMessage.success('已标记为异常商品')
  store.addTask({
    title: `标记异常 - ${abnormalTarget.value.sku}`,
    type: '商品导入',
    priority: 'high',
    status: 'completed',
    progress: 100,
    operator: '当前用户',
    needReview: true,
    reviewed: false,
    remark: `标记异常，原因：${reason}`
  })
}

const handleImport = () => {
  importFile.value = null
  importDialogVisible.value = true
}

const handleFileChange = (file: any) => {
  importFile.value = file.raw
}

const confirmImport = async () => {
  if (!importFile.value) return

  try {
    const data = await parseImportFile(importFile.value)
    const products = transformToProducts(data, importDefaultShop.value)
    store.batchImportProducts(products)
    importDialogVisible.value = false
    ElMessage.success(`成功导入 ${products.length} 条商品数据`)
    store.addTask({
      title: `商品导入 - ${importFile.value.name}`,
      type: '商品导入',
      priority: 'medium',
      status: 'completed',
      progress: 100,
      operator: '当前用户',
      needReview: false,
      reviewed: false,
      remark: `成功导入 ${products.length} 条商品`
    })
  } catch (error: any) {
    ElMessage.error(error.message || '导入失败')
  }
}

const generateMock = () => {
  const result = generateMockData(true)
  if (result) {
    ElMessage.success('演示数据已生成，包含 30 个商品、15 个活动、20 个素材、30 个任务')
  } else {
    ElMessage.info('未生成新数据')
  }
}

const handleExport = () => {
  const data = filteredProducts.value.map(p => ({
    SKU: p.sku,
    商品标题: p.title,
    销售卖点: p.sellingPoint,
    分类: p.category,
    售价: p.price,
    原价: p.originalPrice,
    库存: p.stock,
    店铺: p.shop,
    状态: statusText(p.status),
    是否异常: p.isAbnormal ? '是' : '否',
    异常原因: p.abnormalReason || ''
  }))
  exportToExcel(data, `商品列表_${new Date().toLocaleDateString()}`)
  ElMessage.success('导出成功')
}


</script>

<style lang="scss" scoped>
.product-title {
  font-weight: 500;
  color: #303133;
}

.price-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  .current-price {
    color: #f56c6c;
    font-weight: 600;
    font-size: 14px;
  }
  .original-price {
    color: #909399;
    text-decoration: line-through;
    font-size: 12px;
  }
}

.image-error {
  width: 60px;
  height: 60px;
  background: #f5f7fa;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
}

.upload-demo {
  :deep(.el-upload-dragger) {
    padding: 40px;
  }
}

.stat-badge {
  :deep(.el-badge__content) {
    top: 8px;
    right: 8px;
  }
}
</style>

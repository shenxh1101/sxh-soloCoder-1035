<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">素材管理</h2>
      <div class="page-actions">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新建素材
        </el-button>
      </div>
    </div>

    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-label">素材总数</div>
        <div class="stat-value">{{ store.materialStats.total }}</div>
        <el-icon class="stat-icon" :size="28"><Picture /></el-icon>
      </div>
      <div class="stat-card success">
        <div class="stat-label">已通过</div>
        <div class="stat-value">{{ store.materialStats.approved }}</div>
        <el-icon class="stat-icon" :size="28"><CircleCheck /></el-icon>
      </div>
      <div class="stat-card warning">
        <div class="stat-label">待审核</div>
        <div class="stat-value">{{ store.materialStats.pending }}</div>
        <el-icon class="stat-icon" :size="28"><Clock /></el-icon>
      </div>
      <div class="stat-card info">
        <div class="stat-label">已拒绝</div>
        <div class="stat-value">{{ store.materialStats.rejected }}</div>
        <el-icon class="stat-icon" :size="28"><Close /></el-icon>
      </div>
    </div>

    <div class="filter-bar">
      <div class="filter-item">
        <span class="filter-label">类型:</span>
        <el-select v-model="filters.type" placeholder="全部类型" clearable style="width: 140px">
          <el-option label="主图" value="main_image" />
          <el-option label="详情图" value="detail_image" />
          <el-option label="短文案" value="short_copy" />
          <el-option label="长文案" value="long_copy" />
        </el-select>
      </div>
      <div class="filter-item">
        <span class="filter-label">店铺:</span>
        <el-select v-model="filters.shop" placeholder="全部店铺" clearable style="width: 160px">
          <el-option v-for="shop in store.shopNames" :key="shop" :label="shop" :value="shop" />
        </el-select>
      </div>
      <div class="filter-item">
        <span class="filter-label">审核状态:</span>
        <el-select v-model="filters.auditStatus" placeholder="全部状态" clearable style="width: 140px">
          <el-option label="待审核" value="pending" />
          <el-option label="已通过" value="approved" />
          <el-option label="已拒绝" value="rejected" />
        </el-select>
      </div>
      <div class="filter-item">
        <span class="filter-label">分类:</span>
        <el-select v-model="filters.category" placeholder="全部分类" clearable style="width: 140px">
          <el-option v-for="cat in categories" :key="cat" :label="cat" :value="cat" />
        </el-select>
      </div>
      <div class="filter-item">
        <span class="filter-label">搜索:</span>
        <el-input
          v-model="filters.keyword"
          placeholder="素材名称"
          clearable
          style="width: 200px"
        />
      </div>
      <el-button type="primary" @click="handleReset">重置</el-button>
    </div>

    <div class="table-container">
      <el-table :data="filteredMaterials" stripe border height="100%">
        <el-table-column label="预览" width="120">
          <template #default="{ row }">
            <div v-if="isImageType(row.type)" class="image-preview">
              <el-image
                :src="row.content"
                :preview-src-list="[row.content]"
                fit="cover"
                style="width: 100px; height: 100px; border-radius: 4px"
              >
                <template #error>
                  <div class="image-error">
                    <el-icon :size="32"><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
            </div>
            <div v-else class="copy-preview">
              <el-icon :size="32" color="#409eff"><Document /></el-icon>
              <span class="copy-type">{{ typeText(row.type) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="素材名称" width="180" />
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="typeTagType(row.type)">{{ typeText(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column label="内容" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="isImageType(row.type)">{{ row.content }}</span>
            <span v-else>{{ row.content }}</span>
          </template>
        </el-table-column>
        <el-table-column label="关联商品" width="120">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.productIds.length }} 件</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="shop" label="店铺" width="140">
          <template #default="{ row }">
            <el-tag size="small">{{ row.shop }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="审核状态" width="100">
          <template #default="{ row }">
            <el-tag :type="auditType(row.auditStatus)">{{ auditText(row.auditStatus) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="审核备注" width="150" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row.auditRemark">{{ row.auditRemark }}</span>
            <span v-else style="color: #c0c4cc">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleView(row)">查看</el-button>
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-dropdown trigger="click" @command="(cmd: string) => handleAudit(row, cmd)">
              <el-button size="small" type="primary">
                审核
                <el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="approved" :disabled="row.auditStatus === 'approved'">
                    <el-icon><Check /></el-icon>通过
                  </el-dropdown-item>
                  <el-dropdown-item command="rejected" :disabled="row.auditStatus === 'rejected'">
                    <el-icon><Close /></el-icon>拒绝
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑素材' : '新建素材'" width="800px">
      <el-form :model="materialForm" :rules="formRules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="素材名称" prop="name">
              <el-input v-model="materialForm.name" placeholder="请输入素材名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="素材类型" prop="type">
              <el-select v-model="materialForm.type" placeholder="请选择素材类型" style="width: 100%">
                <el-option label="主图" value="main_image" />
                <el-option label="详情图" value="detail_image" />
                <el-option label="短文案" value="short_copy" />
                <el-option label="长文案" value="long_copy" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="分类" prop="category">
              <el-select v-model="materialForm.category" placeholder="请选择或输入分类" allow-create filterable style="width: 100%">
                <el-option v-for="cat in categories" :key="cat" :label="cat" :value="cat" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="店铺" prop="shop">
              <el-select v-model="materialForm.shop" placeholder="请选择店铺" style="width: 100%">
                <el-option v-for="shop in store.shopNames" :key="shop" :label="shop" :value="shop" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="素材内容" prop="content">
          <el-input
            v-if="isImageType(materialForm.type)"
            v-model="materialForm.content"
            placeholder="请输入图片URL地址"
          />
          <el-input
            v-else
            v-model="materialForm.content"
            type="textarea"
            :rows="6"
            placeholder="请输入文案内容"
          />
        </el-form-item>
        <el-form-item label="关联商品">
          <el-select
            v-model="materialForm.productIds"
            multiple
            filterable
            placeholder="选择关联商品"
            style="width: 100%"
          >
            <el-option
              v-for="product in store.products"
              :key="product.id"
              :label="`${product.sku} - ${product.title}`"
              :value="product.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="审核状态" prop="auditStatus">
          <el-radio-group v-model="materialForm.auditStatus">
            <el-radio value="pending">待审核</el-radio>
            <el-radio value="approved">已通过</el-radio>
            <el-radio value="rejected">已拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="materialForm.auditStatus !== 'pending'" label="审核备注">
          <el-input v-model="materialForm.auditRemark" type="textarea" :rows="2" placeholder="请输入审核备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveMaterial">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailDialogVisible" title="素材详情" width="700px">
      <el-descriptions v-if="currentMaterial" :column="2" border>
        <el-descriptions-item label="素材名称">{{ currentMaterial.name }}</el-descriptions-item>
        <el-descriptions-item label="素材类型">{{ typeText(currentMaterial.type) }}</el-descriptions-item>
        <el-descriptions-item label="分类">{{ currentMaterial.category }}</el-descriptions-item>
        <el-descriptions-item label="店铺">{{ currentMaterial.shop }}</el-descriptions-item>
        <el-descriptions-item label="审核状态">
          <el-tag :type="auditType(currentMaterial.auditStatus)">{{ auditText(currentMaterial.auditStatus) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="关联商品">
          <el-tag size="small" type="info">{{ currentMaterial.productIds.length }} 件</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">{{ formatDate(currentMaterial.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间" :span="2">{{ formatDate(currentMaterial.updatedAt) }}</el-descriptions-item>
        <el-descriptions-item v-if="currentMaterial.auditRemark" label="审核备注" :span="2">
          {{ currentMaterial.auditRemark }}
        </el-descriptions-item>
        <el-descriptions-item label="内容预览" :span="2">
          <div v-if="isImageType(currentMaterial.type)" class="detail-image">
            <el-image
              :src="currentMaterial.content"
              fit="contain"
              style="max-width: 100%; max-height: 400px"
            />
          </div>
          <div v-else class="detail-copy">
            <pre style="white-space: pre-wrap; margin: 0; background: #f5f7fa; padding: 12px; border-radius: 4px;">{{ currentMaterial.content }}</pre>
          </div>
        </el-descriptions-item>
        <el-descriptions-item v-if="currentMaterial.productIds.length > 0" label="关联商品列表" :span="2">
          <el-tag
            v-for="id in currentMaterial.productIds"
            :key="id"
            size="small"
            style="margin-right: 8px; margin-bottom: 4px"
          >
            {{ getProductName(id) }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="auditDialogVisible" title="审核素材" width="500px">
      <el-form :model="auditForm" label-width="100px">
        <el-form-item label="审核结果">
          <el-radio-group v-model="auditForm.status">
            <el-radio value="approved">通过</el-radio>
            <el-radio value="rejected">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核备注">
          <el-input v-model="auditForm.remark" type="textarea" :rows="3" placeholder="请输入审核备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="auditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAudit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { useMainStore } from '@/stores/main'
import type { Material } from '@/types'
import dayjs from 'dayjs'

const store = useMainStore()

const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const auditDialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const currentMaterial = ref<Material | null>(null)
const auditTarget = ref<Material | null>(null)

const filters = reactive({
  type: '',
  shop: '',
  auditStatus: '',
  category: '',
  keyword: ''
})

const materialForm = reactive({
  name: '',
  type: 'main_image' as Material['type'],
  category: '',
  content: '',
  productIds: [] as string[],
  shop: '',
  auditStatus: 'pending' as Material['auditStatus'],
  auditRemark: ''
})

const auditForm = reactive({
  status: 'approved' as Material['auditStatus'],
  remark: ''
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入素材名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择素材类型', trigger: 'change' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  content: [{ required: true, message: '请输入素材内容', trigger: 'blur' }],
  shop: [{ required: true, message: '请选择店铺', trigger: 'change' }]
}

const categories = computed(() => {
  const cats = new Set(store.materials.map(m => m.category))
  return Array.from(cats)
})

const filteredMaterials = computed(() => {
  return store.materials.filter(m => {
    if (filters.type && m.type !== filters.type) return false
    if (filters.shop && m.shop !== filters.shop) return false
    if (filters.auditStatus && m.auditStatus !== filters.auditStatus) return false
    if (filters.category && m.category !== filters.category) return false
    if (filters.keyword && !m.name.toLowerCase().includes(filters.keyword.toLowerCase())) return false
    return true
  })
})

const isImageType = (type: string) => {
  return type === 'main_image' || type === 'detail_image'
}

const typeText = (type: string) => {
  const map: Record<string, string> = {
    main_image: '主图',
    detail_image: '详情图',
    short_copy: '短文案',
    long_copy: '长文案'
  }
  return map[type] || type
}

const typeTagType = (type: string) => {
  const map: Record<string, string> = {
    main_image: 'primary',
    detail_image: 'success',
    short_copy: 'warning',
    long_copy: 'info'
  }
  return map[type] || ''
}

const auditType = (status: string) => {
  const map: Record<string, string> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return map[status] || ''
}

const auditText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return map[status] || ''
}

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

function getProductName(id: string) {
  const product = store.products.find(p => p.id === id)
  return product ? product.title : '未知商品'
}

function handleReset() {
  Object.assign(filters, {
    type: '',
    shop: '',
    auditStatus: '',
    category: '',
    keyword: ''
  })
}

function handleAdd() {
  isEdit.value = false
  Object.assign(materialForm, {
    name: '',
    type: 'main_image' as Material['type'],
    category: '',
    content: '',
    productIds: [],
    shop: store.shopNames[0] || '',
    auditStatus: 'pending' as Material['auditStatus'],
    auditRemark: ''
  })
  dialogVisible.value = true
}

function handleEdit(row: Material) {
  isEdit.value = true
  currentMaterial.value = row
  Object.assign(materialForm, {
    name: row.name,
    type: row.type,
    category: row.category,
    content: row.content,
    productIds: [...row.productIds],
    shop: row.shop,
    auditStatus: row.auditStatus,
    auditRemark: row.auditRemark || ''
  })
  dialogVisible.value = true
}

function handleView(row: Material) {
  currentMaterial.value = row
  detailDialogVisible.value = true
}

function handleAudit(row: Material, cmd: string) {
  auditTarget.value = row
  auditForm.status = cmd as Material['auditStatus']
  auditForm.remark = ''
  auditDialogVisible.value = true
}

function confirmAudit() {
  if (!auditTarget.value) return

  store.updateMaterial(auditTarget.value.id, {
    auditStatus: auditForm.status,
    auditRemark: auditForm.remark
  })

  auditDialogVisible.value = false
  ElMessage.success(`审核${auditForm.status === 'approved' ? '通过' : '拒绝'}成功`)

  store.addTask({
    title: `素材审核 - ${auditTarget.value.name}`,
    type: '素材审核',
    priority: 'medium',
    status: 'completed',
    progress: 100,
    operator: '当前用户',
    needReview: false,
    reviewed: false,
    remark: `素材${auditForm.status === 'approved' ? '已通过' : '已拒绝'}：${auditForm.remark || '无备注'}`
  })
}

async function saveMaterial() {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      if (isEdit.value && currentMaterial.value) {
        store.updateMaterial(currentMaterial.value.id, { ...materialForm })
        ElMessage.success('更新成功')
        store.addTask({
          title: `素材更新 - ${materialForm.name}`,
          type: '素材审核',
          priority: 'medium',
          status: 'completed',
          progress: 100,
          operator: '当前用户',
          needReview: true,
          reviewed: false,
          remark: '素材信息已更新'
        })
      } else {
        store.addMaterial({ ...materialForm })
        ElMessage.success('创建成功')
        store.addTask({
          title: `素材创建 - ${materialForm.name}`,
          type: '素材审核',
          priority: 'medium',
          status: 'completed',
          progress: 100,
          operator: '当前用户',
          needReview: true,
          reviewed: false,
          remark: `新建${typeText(materialForm.type)}素材，${materialForm.auditStatus === 'approved' ? '已通过' : '待审核'}`
        })
      }
      dialogVisible.value = false
    }
  })
}
</script>

<style lang="scss" scoped>
.image-preview {
  display: flex;
  justify-content: center;
  align-items: center;
}

.copy-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100px;
  background: #f5f7fa;
  border-radius: 4px;
  gap: 4px;

  .copy-type {
    font-size: 12px;
    color: #606266;
  }
}

.image-error {
  width: 100px;
  height: 100px;
  background: #f5f7fa;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
}

.detail-image {
  text-align: center;
}

.detail-copy {
  max-height: 400px;
  overflow-y: auto;
}
</style>

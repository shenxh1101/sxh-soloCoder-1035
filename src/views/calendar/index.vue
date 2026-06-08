<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">活动日历</h2>
      <div class="page-actions">
        <el-radio-group v-model="viewMode" size="default">
          <el-radio-button label="calendar">日历视图</el-radio-button>
          <el-radio-button label="list">列表视图</el-radio-button>
        </el-radio-group>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新建活动
        </el-button>
      </div>
    </div>

    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-label">活动总数</div>
        <div class="stat-value">{{ store.activityStats.total }}</div>
        <el-icon class="stat-icon" :size="28"><Calendar /></el-icon>
      </div>
      <div class="stat-card success">
        <div class="stat-label">进行中</div>
        <div class="stat-value">{{ store.activityStats.ongoing }}</div>
        <el-icon class="stat-icon" :size="28"><VideoPlay /></el-icon>
      </div>
      <div class="stat-card warning">
        <div class="stat-label">待审核</div>
        <div class="stat-value">{{ store.activityStats.pending }}</div>
        <el-icon class="stat-icon" :size="28"><Clock /></el-icon>
      </div>
      <div class="stat-card info">
        <div class="stat-label">已通过</div>
        <div class="stat-value">{{ store.activityStats.approved }}</div>
        <el-icon class="stat-icon" :size="28"><CircleCheck /></el-icon>
      </div>
    </div>

    <div v-if="viewMode === 'list'" class="content-wrapper">
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
            <el-option label="草稿" value="draft" />
            <el-option label="待审核" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
            <el-option label="进行中" value="ongoing" />
            <el-option label="已结束" value="ended" />
          </el-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">平台:</span>
          <el-select v-model="filters.platform" placeholder="全部平台" clearable style="width: 140px">
            <el-option v-for="p in platforms" :key="p" :label="p" :value="p" />
          </el-select>
        </div>
        <el-button type="primary" @click="handleReset">重置</el-button>
      </div>

      <div class="table-container">
        <el-table :data="filteredActivities" stripe border height="100%">
          <el-table-column prop="name" label="活动名称" width="200" />
          <el-table-column prop="type" label="活动类型" width="120" />
          <el-table-column prop="platform" label="平台" width="100">
            <template #default="{ row }">
              <el-tag size="small">{{ row.platform }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="shop" label="店铺" width="140">
            <template #default="{ row }">
              <el-tag size="small" type="info">{{ row.shop }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="报名时间" width="320">
            <template #default="{ row }">
              <div class="time-range">
                <div><span class="label">开始:</span> {{ row.registrationStart }}</div>
                <div><span class="label">结束:</span> {{ row.registrationEnd }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="活动时间" width="320">
            <template #default="{ row }">
              <div class="time-range">
                <div><span class="label">开始:</span> {{ row.startTime }}</div>
                <div><span class="label">结束:</span> {{ row.endTime }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="优惠规则" min-width="200" show-overflow-tooltip>
            <template #default="{ row }">
              <div>{{ row.discountRule }}</div>
            </template>
          </el-table-column>
          <el-table-column label="预留库存" width="100">
            <template #default="{ row }">
              <el-tag type="warning">{{ row.reservedStock }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="inCharge" label="负责人" width="100" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <el-button size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <div v-else class="content-wrapper">
      <el-calendar v-model="selectedDate">
        <template #date-cell="{ data }">
          <div class="calendar-cell">
            <div class="date-num">{{ data.day.split('-').slice(-1)[0] }}</div>
            <div class="activity-dots">
              <div
                v-for="(activity, index) in getActivitiesByDate(data.day)"
                :key="activity.id"
                class="activity-dot"
                :class="`dot-${activity.status}`"
                :title="activity.name"
                @click.stop="showActivityDetail(activity)"
              ></div>
            </div>
          </div>
        </template>
      </el-calendar>

      <div class="calendar-legend">
        <div class="legend-item">
          <span class="dot dot-ongoing"></span>
          <span>进行中</span>
        </div>
        <div class="legend-item">
          <span class="dot dot-approved"></span>
          <span>已通过</span>
        </div>
        <div class="legend-item">
          <span class="dot dot-pending"></span>
          <span>待审核</span>
        </div>
        <div class="legend-item">
          <span class="dot dot-ended"></span>
          <span>已结束</span>
        </div>
      </div>

      <div v-if="dayActivities.length > 0" class="day-activities">
        <h4>{{ selectedDateFormatted }} 的活动</h4>
        <el-table :data="dayActivities" size="small">
          <el-table-column prop="name" label="活动名称" />
          <el-table-column prop="type" label="类型" width="120" />
          <el-table-column prop="shop" label="店铺" width="140">
            <template #default="{ row }">
              <el-tag size="small">{{ row.shop }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="时间" width="300">
            <template #default="{ row }">
              {{ row.startTime }} ~ {{ row.endTime }}
            </template>
          </el-table-column>
          <el-table-column prop="inCharge" label="负责人" width="100" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag size="small" :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑活动' : '新建活动'" width="900px">
      <el-form :model="activityForm" :rules="formRules" ref="formRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="活动名称" prop="name">
              <el-input v-model="activityForm.name" placeholder="请输入活动名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="活动类型" prop="type">
              <el-select v-model="activityForm.type" placeholder="请选择活动类型" style="width: 100%">
                <el-option label="618大促" value="618大促" />
                <el-option label="双11狂欢" value="双11狂欢" />
                <el-option label="年货节" value="年货节" />
                <el-option label="品牌日" value="品牌日" />
                <el-option label="会员日" value="会员日" />
                <el-option label="新品首发" value="新品首发" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="平台" prop="platform">
              <el-select v-model="activityForm.platform" placeholder="请选择平台" style="width: 100%">
                <el-option label="天猫" value="天猫" />
                <el-option label="京东" value="京东" />
                <el-option label="拼多多" value="拼多多" />
                <el-option label="抖音" value="抖音" />
                <el-option label="全平台" value="全平台" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="店铺" prop="shop">
              <el-select v-model="activityForm.shop" placeholder="请选择店铺" style="width: 100%">
                <el-option v-for="shop in store.shopNames" :key="shop" :label="shop" :value="shop" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider content-position="left">报名时间</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="报名开始" prop="registrationStart">
              <el-date-picker
                v-model="activityForm.registrationStart"
                type="datetime"
                placeholder="选择日期时间"
                style="width: 100%"
                value-format="YYYY-MM-DD HH:mm"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="报名结束" prop="registrationEnd">
              <el-date-picker
                v-model="activityForm.registrationEnd"
                type="datetime"
                placeholder="选择日期时间"
                style="width: 100%"
                value-format="YYYY-MM-DD HH:mm"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider content-position="left">活动时间</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="活动开始" prop="startTime">
              <el-date-picker
                v-model="activityForm.startTime"
                type="datetime"
                placeholder="选择日期时间"
                style="width: 100%"
                value-format="YYYY-MM-DD HH:mm"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="活动结束" prop="endTime">
              <el-date-picker
                v-model="activityForm.endTime"
                type="datetime"
                placeholder="选择日期时间"
                style="width: 100%"
                value-format="YYYY-MM-DD HH:mm"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider content-position="left">活动规则</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="优惠规则" prop="discountRule">
              <el-input v-model="activityForm.discountRule" placeholder="如：满299减50，最低8折" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="最低价格" prop="minPrice">
              <el-input-number v-model="activityForm.minPrice" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="预留库存" prop="reservedStock">
              <el-input-number v-model="activityForm.reservedStock" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="负责人" prop="inCharge">
              <el-input v-model="activityForm.inCharge" placeholder="请输入负责人姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="活动状态" prop="status">
              <el-select v-model="activityForm.status" placeholder="请选择状态" style="width: 100%">
                <el-option label="草稿" value="draft" />
                <el-option label="待审核" value="pending" />
                <el-option label="已通过" value="approved" />
                <el-option label="已拒绝" value="rejected" />
                <el-option label="进行中" value="ongoing" />
                <el-option label="已结束" value="ended" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="关联商品">
          <el-select
            v-model="activityForm.productIds"
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
        <el-form-item label="备注">
          <el-input v-model="activityForm.remark" type="textarea" :rows="3" placeholder="请输入活动备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveActivity">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailDialogVisible" title="活动详情" width="700px">
      <el-descriptions v-if="currentActivity" :column="2" border>
        <el-descriptions-item label="活动名称">{{ currentActivity.name }}</el-descriptions-item>
        <el-descriptions-item label="活动类型">{{ currentActivity.type }}</el-descriptions-item>
        <el-descriptions-item label="平台">{{ currentActivity.platform }}</el-descriptions-item>
        <el-descriptions-item label="店铺">{{ currentActivity.shop }}</el-descriptions-item>
        <el-descriptions-item label="报名时间" :span="2">
          {{ currentActivity.registrationStart }} ~ {{ currentActivity.registrationEnd }}
        </el-descriptions-item>
        <el-descriptions-item label="活动时间" :span="2">
          {{ currentActivity.startTime }} ~ {{ currentActivity.endTime }}
        </el-descriptions-item>
        <el-descriptions-item label="优惠规则" :span="2">{{ currentActivity.discountRule }}</el-descriptions-item>
        <el-descriptions-item label="最低价格">¥{{ currentActivity.minPrice }}</el-descriptions-item>
        <el-descriptions-item label="预留库存">{{ currentActivity.reservedStock }} 件</el-descriptions-item>
        <el-descriptions-item label="负责人">{{ currentActivity.inCharge }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusType(currentActivity.status)">{{ statusText(currentActivity.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="关联商品" :span="2">
          <el-tag
            v-for="id in currentActivity.productIds"
            :key="id"
            size="small"
            style="margin-right: 8px"
          >
            {{ getProductName(id) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentActivity.remark || '无' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { useMainStore } from '@/stores/main'
import type { Activity } from '@/types'
import dayjs from 'dayjs'

const store = useMainStore()

const viewMode = ref<'calendar' | 'list'>('calendar')
const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const currentActivity = ref<Activity | null>(null)
const selectedDate = ref(new Date())

const filters = reactive({
  shop: '',
  status: '',
  platform: ''
})

const activityForm = reactive({
  name: '',
  type: '',
  platform: '',
  shop: '',
  startTime: '',
  endTime: '',
  registrationStart: '',
  registrationEnd: '',
  discountRule: '',
  minPrice: 0,
  reservedStock: 0,
  inCharge: '',
  status: 'draft' as Activity['status'],
  productIds: [] as string[],
  remark: ''
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择活动类型', trigger: 'change' }],
  platform: [{ required: true, message: '请选择平台', trigger: 'change' }],
  shop: [{ required: true, message: '请选择店铺', trigger: 'change' }],
  startTime: [{ required: true, message: '请选择活动开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择活动结束时间', trigger: 'change' }],
  registrationStart: [{ required: true, message: '请选择报名开始时间', trigger: 'change' }],
  registrationEnd: [{ required: true, message: '请选择报名结束时间', trigger: 'change' }],
  discountRule: [{ required: true, message: '请输入优惠规则', trigger: 'blur' }],
  inCharge: [{ required: true, message: '请输入负责人', trigger: 'blur' }]
}

const platforms = computed(() => {
  const p = new Set(store.activities.map(a => a.platform))
  return Array.from(p)
})

const filteredActivities = computed(() => {
  return store.activities.filter(a => {
    if (filters.shop && a.shop !== filters.shop) return false
    if (filters.status && a.status !== filters.status) return false
    if (filters.platform && a.platform !== filters.platform) return false
    return true
  })
})

const selectedDateFormatted = computed(() => {
  return dayjs(selectedDate.value).format('YYYY年MM月DD日')
})

const dayActivities = computed(() => {
  const dateStr = dayjs(selectedDate.value).format('YYYY-MM-DD')
  return getActivitiesByDate(dateStr)
})

function getActivitiesByDate(dateStr: string) {
  return store.activities.filter(a => {
    const start = dayjs(a.startTime).format('YYYY-MM-DD')
    const end = dayjs(a.endTime).format('YYYY-MM-DD')
    return dateStr >= start && dateStr <= end
  })
}

const statusType = (status: string) => {
  const map: Record<string, string> = {
    draft: 'info',
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    ongoing: 'primary',
    ended: 'info'
  }
  return map[status] || ''
}

const statusText = (status: string) => {
  const map: Record<string, string> = {
    draft: '草稿',
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝',
    ongoing: '进行中',
    ended: '已结束'
  }
  return map[status] || ''
}

function getProductName(id: string) {
  const product = store.products.find(p => p.id === id)
  return product ? product.title : '未知商品'
}

function showActivityDetail(activity: Activity) {
  currentActivity.value = activity
  detailDialogVisible.value = true
}

function handleAdd() {
  isEdit.value = false
  Object.assign(activityForm, {
    name: '',
    type: '',
    platform: '',
    shop: store.shopNames[0] || '',
    startTime: '',
    endTime: '',
    registrationStart: '',
    registrationEnd: '',
    discountRule: '',
    minPrice: 0,
    reservedStock: 0,
    inCharge: '',
    status: 'draft' as Activity['status'],
    productIds: [],
    remark: ''
  })
  dialogVisible.value = true
}

function handleEdit(row: Activity) {
  isEdit.value = true
  currentActivity.value = row
  Object.assign(activityForm, {
    name: row.name,
    type: row.type,
    platform: row.platform,
    shop: row.shop,
    startTime: row.startTime,
    endTime: row.endTime,
    registrationStart: row.registrationStart,
    registrationEnd: row.registrationEnd,
    discountRule: row.discountRule,
    minPrice: row.minPrice,
    reservedStock: row.reservedStock,
    inCharge: row.inCharge,
    status: row.status,
    productIds: [...row.productIds],
    remark: row.remark
  })
  dialogVisible.value = true
}

function handleDelete(row: Activity) {
  ElMessageBox.confirm('确定要删除该活动吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    store.deleteActivity(row.id)
    ElMessage.success('删除成功')
  })
}

function handleReset() {
  Object.assign(filters, {
    shop: '',
    status: '',
    platform: ''
  })
}

async function saveActivity() {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      if (isEdit.value && currentActivity.value) {
        store.updateActivity(currentActivity.value.id, { ...activityForm })
        ElMessage.success('更新成功')
        store.addTask({
          title: `活动更新 - ${activityForm.name}`,
          type: '活动报名',
          priority: 'high',
          status: 'completed',
          progress: 100,
          operator: '当前用户',
          needReview: false,
          reviewed: false,
          remark: `活动信息已更新`
        })
      } else {
        store.addActivity({ ...activityForm })
        ElMessage.success('创建成功')
        store.addTask({
          title: `活动创建 - ${activityForm.name}`,
          type: '活动报名',
          priority: 'high',
          status: 'completed',
          progress: 100,
          operator: '当前用户',
          needReview: true,
          reviewed: false,
          remark: `新建活动，预留库存 ${activityForm.reservedStock} 件`
        })
      }
      dialogVisible.value = false
    }
  })
}
</script>

<style lang="scss" scoped>
.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.time-range {
  font-size: 12px;
  line-height: 1.6;

  .label {
    color: #909399;
  }
}

.calendar-cell {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px;

  .date-num {
    font-size: 14px;
    font-weight: 500;
  }

  .activity-dots {
    display: flex;
    gap: 2px;
    margin-top: 4px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .activity-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    cursor: pointer;

    &.dot-ongoing { background: #409eff; }
    &.dot-approved { background: #67c23a; }
    &.dot-pending { background: #e6a23c; }
    &.dot-ended { background: #909399; }
    &.dot-draft { background: #909399; }
    &.dot-rejected { background: #f56c6c; }
  }
}

.calendar-legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  padding: 16px 0;
  border-top: 1px solid #ebeef5;

  .legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #606266;

    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;

      &.dot-ongoing { background: #409eff; }
      &.dot-approved { background: #67c23a; }
      &.dot-pending { background: #e6a23c; }
      &.dot-ended { background: #909399; }
    }
  }
}

.day-activities {
  margin-top: 16px;

  h4 {
    margin-bottom: 12px;
    color: #303133;
  }
}

:deep(.el-calendar__body) {
  padding: 0;
}

:deep(.el-calendar-table thead th) {
  height: 36px;
}

:deep(.el-calendar-day:hover {
  padding: 0;
}
</style>

<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">任务记录</h2>
      <div class="page-actions">
        <el-button type="primary" @click="generateDailyList">
          <el-icon><DocumentAdd /></el-icon>
          生成今日清单
        </el-button>
        <el-button @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新建任务
        </el-button>
      </div>
    </div>

    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-label">任务总数</div>
        <div class="stat-value">{{ store.taskStats.total }}</div>
        <el-icon class="stat-icon" :size="28"><List /></el-icon>
      </div>
      <div class="stat-card warning">
        <div class="stat-label">待处理</div>
        <div class="stat-value">{{ store.taskStats.pending }}</div>
        <el-icon class="stat-icon" :size="28"><Clock /></el-icon>
      </div>
      <div class="stat-card info">
        <div class="stat-label">处理中</div>
        <div class="stat-value">{{ store.taskStats.processing }}</div>
        <el-icon class="stat-icon" :size="28"><Loading /></el-icon>
      </div>
      <div class="stat-card success">
        <div class="stat-label">已完成</div>
        <div class="stat-value">{{ store.taskStats.completed }}</div>
        <el-icon class="stat-icon" :size="28"><CircleCheck /></el-icon>
      </div>
      <div class="stat-card" style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)">
        <div class="stat-label">待复核</div>
        <div class="stat-value">{{ store.taskStats.needReview }}</div>
        <el-icon class="stat-icon" :size="28"><View /></el-icon>
      </div>
    </div>

    <el-tabs v-model="activeTab" style="margin-top: 16px">
      <el-tab-pane label="全部任务" name="all">
        <div class="filter-bar">
          <div class="filter-item">
            <span class="filter-label">任务类型:</span>
            <el-select v-model="filters.type" placeholder="全部类型" clearable style="width: 140px">
              <el-option label="商品导入" value="商品导入" />
              <el-option label="批量修改" value="批量修改" />
              <el-option label="活动报名" value="活动报名" />
              <el-option label="素材审核" value="素材审核" />
              <el-option label="价格调整" value="价格调整" />
              <el-option label="库存更新" value="库存更新" />
              <el-option label="上下架操作" value="上下架操作" />
            </el-select>
          </div>
          <div class="filter-item">
            <span class="filter-label">状态:</span>
            <el-select v-model="filters.status" placeholder="全部状态" clearable style="width: 140px">
              <el-option label="待处理" value="pending" />
              <el-option label="处理中" value="processing" />
              <el-option label="已完成" value="completed" />
              <el-option label="已失败" value="failed" />
            </el-select>
          </div>
          <div class="filter-item">
            <span class="filter-label">优先级:</span>
            <el-select v-model="filters.priority" placeholder="全部优先级" clearable style="width: 140px">
              <el-option label="高" value="high" />
              <el-option label="中" value="medium" />
              <el-option label="低" value="low" />
            </el-select>
          </div>
          <div class="filter-item">
            <span class="filter-label">仅待复核:</span>
            <el-switch v-model="filters.onlyNeedReview" />
          </div>
          <div class="filter-item">
            <span class="filter-label">搜索:</span>
            <el-input v-model="filters.keyword" placeholder="任务标题" clearable style="width: 200px" />
          </div>
          <el-button type="primary" @click="handleReset">重置</el-button>
        </div>

        <div class="table-container">
          <el-table :data="filteredTasks" stripe border height="100%">
            <el-table-column label="优先级" width="80">
              <template #default="{ row }">
                <el-tag :type="priorityType(row.priority)" size="small">{{ priorityText(row.priority) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="title" label="任务标题" min-width="200" />
            <el-table-column prop="type" label="类型" width="120" />
            <el-table-column label="进度" width="180">
              <template #default="{ row }">
                <el-progress
                  :percentage="row.progress"
                  :status="progressStatus(row)"
                  :stroke-width="12"
                />
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="operator" label="操作人" width="100" />
            <el-table-column label="待复核" width="80">
              <template #default="{ row }">
                <el-tooltip v-if="row.needReview" :content="row.reviewed ? '已复核' : '待复核'" placement="top">
                  <el-icon :size="18" :color="row.reviewed ? '#67c23a' : '#e6a23c'">
                    <component :is="row.reviewed ? 'CircleCheck' : 'Warning'" />
                  </el-icon>
                </el-tooltip>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column label="创建时间" width="160">
              <template #default="{ row }">
                {{ formatDate(row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column label="更新时间" width="160">
              <template #default="{ row }">
                {{ formatDate(row.updatedAt) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="240" fixed="right">
              <template #default="{ row }">
                <el-button size="small" @click="handleView(row)">详情</el-button>
                <el-button
                  v-if="row.status === 'pending'"
                  size="small"
                  type="primary"
                  @click="startTask(row)"
                >
                  开始
                </el-button>
                <el-button
                  v-if="row.needReview && !row.reviewed"
                  size="small"
                  type="success"
                  @click="reviewTask(row)"
                >
                  复核
                </el-button>
                <el-button
                  v-if="row.status === 'failed'"
                  size="small"
                  type="warning"
                  @click="retryTask(row)"
                >
                  重试
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <el-tab-pane label="失败任务" name="failed">
        <el-alert
          :title="`共有 ${failedTasks.length} 个失败任务需要处理`"
          type="warning"
          :closable="false"
          style="margin-bottom: 16px"
        />
        <div class="table-container">
          <el-table :data="failedTasks" stripe border height="100%">
            <el-table-column prop="title" label="任务标题" min-width="200" />
            <el-table-column prop="type" label="类型" width="120" />
            <el-table-column label="失败原因" min-width="200">
              <template #default="{ row }">
                <el-tag type="danger" size="small" style="margin-bottom: 4px">{{ row.failReason }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="operator" label="操作人" width="100" />
            <el-table-column label="创建时间" width="160">
              <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button size="small" type="primary" @click="retryTask(row)">重试</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <el-tab-pane label="待复核" name="review">
        <el-alert
          :title="`共有 ${needReviewTasks.length} 个任务待复核`"
          type="warning"
          :closable="false"
          style="margin-bottom: 16px"
        />
        <div class="table-container">
          <el-table :data="needReviewTasks" stripe border height="100%">
            <el-table-column label="优先级" width="80">
              <template #default="{ row }">
                <el-tag :type="priorityType(row.priority)" size="small">{{ priorityText(row.priority) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="title" label="任务标题" min-width="200" />
            <el-table-column prop="type" label="类型" width="120" />
            <el-table-column prop="operator" label="操作人" width="100" />
            <el-table-column label="完成时间" width="160">
              <template #default="{ row }">{{ formatDate(row.completedAt || row.updatedAt) }}</template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button size="small" @click="handleView(row)">查看</el-button>
                <el-button size="small" type="success" @click="reviewTask(row)">通过</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <el-tab-pane label="每日清单" name="daily">
        <div style="margin-bottom: 16px">
          <el-date-picker
            v-model="selectedDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            style="width: 200px; margin-right: 16px"
          />
          <el-button type="primary" @click="generateDailyList">
            <el-icon><Refresh /></el-icon>
            生成清单
          </el-button>
        </div>

        <div v-if="dailyTasks.length > 0" class="daily-list">
          <el-card class="daily-card">
            <template #header>
              <div class="card-header">
                <span><strong>{{ selectedDateFormatted }}</strong> 运营清单</span>
                <el-tag :type="dailySummary.completed === dailySummary.total ? 'success' : 'warning'">
                  完成 {{ dailySummary.completed }}/{{ dailySummary.total }}
                </el-tag>
              </div>
            </template>
            <div class="daily-summary">
              <div class="summary-item">
                <span class="label">待处理:</span>
                <el-tag type="warning">{{ dailySummary.pending }}</el-tag>
              </div>
              <div class="summary-item">
                <span class="label">处理中:</span>
                <el-tag type="primary">{{ dailySummary.processing }}</el-tag>
              </div>
              <div class="summary-item">
                <span class="label">已完成:</span>
                <el-tag type="success">{{ dailySummary.completed }}</el-tag>
              </div>
              <div class="summary-item">
                <span class="label">已失败:</span>
                <el-tag type="danger">{{ dailySummary.failed }}</el-tag>
              </div>
              <div class="summary-item">
                <span class="label">待复核:</span>
                <el-tag type="warning">{{ dailySummary.needReview }}</el-tag>
              </div>
            </div>
            <el-table :data="dailyTasks" size="small">
              <el-table-column label="优先级" width="80">
                <template #default="{ row }">
                  <el-tag :type="priorityType(row.priority)" size="small">{{ priorityText(row.priority) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="title" label="任务内容" min-width="250" />
              <el-table-column prop="type" label="类型" width="120" />
              <el-table-column label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="statusType(row.status)" size="small">{{ statusText(row.status) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="进度" width="150">
                <template #default="{ row }">
                  <el-progress :percentage="row.progress" :status="progressStatus(row)" :stroke-width="10" />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150">
                <template #default="{ row }">
                  <el-button
                    v-if="row.status === 'pending'"
                    size="small"
                    type="primary"
                    @click="startTask(row)"
                  >
                    开始
                  </el-button>
                  <el-button size="small" @click="handleView(row)">详情</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>
        <el-empty v-else description="暂无当日任务清单" />
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="detailDialogVisible" title="任务详情" width="700px">
      <el-descriptions v-if="currentTask" :column="2" border>
        <el-descriptions-item label="任务标题" :span="2">{{ currentTask.title }}</el-descriptions-item>
        <el-descriptions-item label="任务类型">{{ currentTask.type }}</el-descriptions-item>
        <el-descriptions-item label="优先级">
          <el-tag :type="priorityType(currentTask.priority)">{{ priorityText(currentTask.priority) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusType(currentTask.status)">{{ statusText(currentTask.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作人">{{ currentTask.operator }}</el-descriptions-item>
        <el-descriptions-item label="进度" :span="2">
          <el-progress
            :percentage="currentTask.progress"
            :status="progressStatus(currentTask)"
            :stroke-width="14"
          />
        </el-descriptions-item>
        <el-descriptions-item v-if="currentTask.failReason" label="失败原因" :span="2">
          <el-tag type="danger">{{ currentTask.failReason }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="需要复核" :span="2">
          {{ currentTask.needReview ? (currentTask.reviewed ? '是（已复核）' : '是（待复核）') : '否' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">{{ formatDate(currentTask.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间" :span="2">{{ formatDate(currentTask.updatedAt) }}</el-descriptions-item>
        <el-descriptions-item v-if="currentTask.completedAt" label="完成时间" :span="2">
          {{ formatDate(currentTask.completedAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="任务备注" :span="2">{{ currentTask.remark || '无' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="addDialogVisible" title="新建任务" width="600px">
      <el-form :model="taskForm" :rules="formRules" ref="formRef" label-width="100px">
        <el-form-item label="任务标题" prop="title">
          <el-input v-model="taskForm.title" placeholder="请输入任务标题" />
        </el-form-item>
        <el-form-item label="任务类型" prop="type">
          <el-select v-model="taskForm.type" placeholder="请选择任务类型" style="width: 100%">
            <el-option label="商品导入" value="商品导入" />
            <el-option label="批量修改" value="批量修改" />
            <el-option label="活动报名" value="活动报名" />
            <el-option label="素材审核" value="素材审核" />
            <el-option label="价格调整" value="价格调整" />
            <el-option label="库存更新" value="库存更新" />
            <el-option label="上下架操作" value="上下架操作" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-radio-group v-model="taskForm.priority">
            <el-radio value="high">高</el-radio>
            <el-radio value="medium">中</el-radio>
            <el-radio value="low">低</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="需要复核">
          <el-switch v-model="taskForm.needReview" />
        </el-form-item>
        <el-form-item label="任务备注">
          <el-input v-model="taskForm.remark" type="textarea" :rows="3" placeholder="请输入任务备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTask">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { useMainStore } from '@/stores/main'
import type { Task } from '@/types'
import dayjs from 'dayjs'

const store = useMainStore()

const activeTab = ref('all')
const detailDialogVisible = ref(false)
const addDialogVisible = ref(false)
const formRef = ref<FormInstance>()
const currentTask = ref<Task | null>(null)
const selectedDate = ref(dayjs().format('YYYY-MM-DD'))

const filters = reactive({
  type: '',
  status: '',
  priority: '',
  onlyNeedReview: false,
  keyword: ''
})

const taskForm = reactive({
  title: '',
  type: '',
  priority: 'medium' as Task['priority'],
  needReview: false,
  remark: ''
})

const formRules: FormRules = {
  title: [{ required: true, message: '请输入任务标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择任务类型', trigger: 'change' }]
}

const selectedDateFormatted = computed(() => {
  return dayjs(selectedDate.value).format('YYYY年MM月DD日')
})

const filteredTasks = computed(() => {
  return store.tasks.filter(t => {
    if (filters.type && t.type !== filters.type) return false
    if (filters.status && t.status !== filters.status) return false
    if (filters.priority && t.priority !== filters.priority) return false
    if (filters.onlyNeedReview && (!t.needReview || t.reviewed)) return false
    if (filters.keyword && !t.title.toLowerCase().includes(filters.keyword.toLowerCase())) return false
    return true
  })
})

const failedTasks = computed(() => {
  return store.tasks.filter(t => t.status === 'failed')
})

const needReviewTasks = computed(() => {
  return store.tasks.filter(t => t.needReview && !t.reviewed)
})

const dailyTasks = computed(() => {
  const dateStr = selectedDate.value
  return store.tasks.filter(t => {
    const taskDate = dayjs(t.createdAt).format('YYYY-MM-DD')
    return taskDate === dateStr
  })
})

const dailySummary = computed(() => {
  const tasks = dailyTasks.value
  return {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    processing: tasks.filter(t => t.status === 'processing').length,
    failed: tasks.filter(t => t.status === 'failed').length,
    needReview: tasks.filter(t => t.needReview && !t.reviewed).length
  }
})

const priorityType = (priority: string) => {
  const map: Record<string, string> = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return map[priority] || ''
}

const priorityText = (priority: string) => {
  const map: Record<string, string> = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return map[priority] || ''
}

const statusType = (status: string) => {
  const map: Record<string, string> = {
    pending: 'warning',
    processing: 'primary',
    completed: 'success',
    failed: 'danger'
  }
  return map[status] || ''
}

const statusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    completed: '已完成',
    failed: '已失败'
  }
  return map[status] || ''
}

const progressStatus = (task: Task) => {
  if (task.status === 'failed') return 'exception'
  if (task.status === 'completed') return 'success'
  if (task.progress === 100) return 'success'
  return undefined
}

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

function handleReset() {
  Object.assign(filters, {
    type: '',
    status: '',
    priority: '',
    onlyNeedReview: false,
    keyword: ''
  })
}

function handleView(row: Task) {
  currentTask.value = row
  detailDialogVisible.value = true
}

function handleAdd() {
  Object.assign(taskForm, {
    title: '',
    type: '',
    priority: 'medium' as Task['priority'],
    needReview: false,
    remark: ''
  })
  addDialogVisible.value = true
}

async function saveTask() {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      store.addTask({
        ...taskForm,
        status: 'pending',
        progress: 0,
        operator: '当前用户',
        reviewed: false
      })
      ElMessage.success('任务创建成功')
      addDialogVisible.value = false
    }
  })
}

function startTask(row: Task) {
  store.updateTask(row.id, {
    status: 'processing',
    progress: 0
  })
  ElMessage.success('任务已开始处理')

  const timer = setInterval(() => {
    const task = store.tasks.find(t => t.id === row.id)
    if (task && task.status === 'processing') {
      const newProgress = Math.min(task.progress + 20, 100)
      store.updateTask(row.id, { progress: newProgress })
      if (newProgress >= 100) {
        store.updateTask(row.id, { status: 'completed' })
        clearInterval(timer)
        ElMessage.success(`任务「${row.title}」处理完成`)
      }
    } else {
      clearInterval(timer)
    }
  }, 1000)
}

function reviewTask(row: Task) {
  ElMessageBox.confirm('确定要通过该任务的复核吗？', '复核确认', {
    confirmButtonText: '通过',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    store.updateTask(row.id, { reviewed: true })
    ElMessage.success('复核通过')
  })
}

function retryTask(row: Task) {
  ElMessageBox.confirm('确定要重试该任务吗？', '重试确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    store.updateTask(row.id, {
      status: 'pending',
      progress: 0,
      failReason: ''
    })
    ElMessage.success('任务已重置，可以重新开始')
  })
}

function generateDailyList() {
  const todayTasks = store.tasks.filter(t => {
    const taskDate = dayjs(t.createdAt).format('YYYY-MM-DD')
    return taskDate === selectedDate.value
  })

  if (todayTasks.length > 0) {
    ElMessage.info(`今日已有 ${todayTasks.length} 个任务`)
    return
  }

  const dailyItems = [
    { type: '商品导入', title: '检查今日新品导入', priority: 'high' as const },
    { type: '价格调整', title: '检查商品价格是否异常', priority: 'medium' as const },
    { type: '库存更新', title: '更新热销商品库存', priority: 'high' as const },
    { type: '素材审核', title: '审核待处理素材', priority: 'medium' as const },
    { type: '活动报名', title: '检查活动报名进度', priority: 'medium' as const },
    { type: '上下架操作', title: '上下架待处理商品', priority: 'low' as const }
  ]

  dailyItems.forEach(item => {
    store.addTask({
      title: item.title,
      type: item.type,
      priority: item.priority,
      status: 'pending',
      progress: 0,
      operator: '当前用户',
      needReview: item.priority === 'high',
      reviewed: false,
      remark: '每日运营清单自动生成'
    })
  })

  ElMessage.success('今日运营清单已生成，共 6 个任务')
}
</script>

<style lang="scss" scoped>
.daily-list {
  flex: 1;
  overflow-y: auto;
}

.daily-card {
  :deep(.el-card__header) {
    padding: 16px 20px;
    background: #f5f7fa;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.daily-summary {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 6px;

  .summary-item {
    display: flex;
    align-items: center;
    gap: 8px;

    .label {
      color: #606266;
    }
  }
}
</style>

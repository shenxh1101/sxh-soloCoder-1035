import { useMainStore } from '@/stores/main'
import { Product, Activity, Material, Task } from '@/types'
import dayjs from 'dayjs'

export function generateMockData() {
  const store = useMainStore()

  if (store.products.length > 0) return

  const shops = ['天猫旗舰店', '京东自营店', '拼多多旗舰店', '抖音旗舰店']
  const categories = ['手机数码', '家用电器', '服装鞋包', '美妆护肤', '食品饮料', '家居用品']
  const statuses: Product['status'][] = ['on_sale', 'off_sale', 'pending']

  const productTitles = [
    '2024新款智能手机 12+256GB 全网通5G',
    '无线蓝牙耳机 降噪长续航 运动跑步',
    '家用空气净化器 除甲醛PM2.5 智能款',
    '纯棉男士T恤 夏季新款 宽松休闲',
    '保湿面霜 补水滋润 敏感肌可用',
    '进口零食大礼包 组合装 节日送礼',
    '北欧风格沙发 科技布面料 三人位',
    '智能手表 运动健康监测 多功能',
    '儿童学习桌 可升降 带书架',
    '厨房不粘锅具套装 燃气电磁炉通用',
    '女士真皮手提包 时尚单肩斜挎',
    '男士运动鞋 透气轻便 跑步健身',
    '高清投影仪 家用办公 4K超清',
    '全自动洗衣机 10公斤大容量 变频',
    '有机大米 5kg装 东北五常大米'
  ]

  const sellingPoints = [
    '限时特惠 买一送一',
    '官方正品 全国联保',
    '新品首发 限量抢购',
    '爆款热卖 销量过万',
    '品质保证 7天无理由',
    '会员专享 额外95折',
    '顺丰包邮 次日达',
    '下单立减 满299减50'
  ]

  for (let i = 0; i < 30; i++) {
    const price = Math.floor(Math.random() * 2000) + 50
    const product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
      sku: `SKU${String(10000 + i)}`,
      title: productTitles[i % productTitles.length],
      sellingPoint: sellingPoints[i % sellingPoints.length],
      category: categories[i % categories.length],
      price,
      originalPrice: Math.floor(price * 1.3),
      stock: Math.floor(Math.random() * 500),
      reservedStock: Math.floor(Math.random() * 50),
      status: statuses[i % statuses.length],
      shop: shops[i % shops.length],
      image: `https://picsum.photos/seed/${i + 1}/100/100`,
      isAbnormal: Math.random() > 0.8,
      abnormalReason: Math.random() > 0.8 ? '价格异常' : undefined
    }
    store.addProduct(product)
  }

  const activityTypes = ['618大促', '双11狂欢', '年货节', '品牌日', '会员日', '新品首发']
  const platforms = ['天猫', '京东', '拼多多', '抖音', '全平台']
  const activityStatuses: Activity['status'][] = ['draft', 'pending', 'approved', 'ongoing', 'ended']
  const persons = ['张三', '李四', '王五', '赵六', '钱七']

  for (let i = 0; i < 15; i++) {
    const startDate = dayjs().add(i - 5, 'day')
    const endDate = startDate.add(3 + Math.floor(Math.random() * 7), 'day')
    const activity: Omit<Activity, 'id' | 'createdAt'> = {
      name: `${activityTypes[i % activityTypes.length]}${i + 1}期`,
      type: activityTypes[i % activityTypes.length],
      platform: platforms[i % platforms.length],
      shop: shops[i % shops.length],
      startTime: startDate.format('YYYY-MM-DD HH:mm'),
      endTime: endDate.format('YYYY-MM-DD HH:mm'),
      registrationStart: startDate.subtract(10, 'day').format('YYYY-MM-DD HH:mm'),
      registrationEnd: startDate.subtract(3, 'day').format('YYYY-MM-DD HH:mm'),
      discountRule: `满${100 + i * 50}减${20 + i * 10}，最低8折`,
      minPrice: 10 + Math.floor(Math.random() * 100),
      reservedStock: 50 + Math.floor(Math.random() * 200),
      inCharge: persons[i % persons.length],
      status: activityStatuses[i % activityStatuses.length],
      productIds: store.products.slice(0, 5 + (i % 5)).map(p => p.id),
      remark: `活动${i + 1}备注信息`
    }
    store.addActivity(activity)
  }

  const materialTypes: Material['type'][] = ['main_image', 'detail_image', 'short_copy', 'long_copy']
  const materialCategories = ['主图', '详情页', '短文案', '长文案', '海报', '短视频脚本']
  const auditStatuses: Material['auditStatus'][] = ['pending', 'approved', 'rejected']

  for (let i = 0; i < 20; i++) {
    const material: Omit<Material, 'id' | 'createdAt' | 'updatedAt'> = {
      name: `素材${i + 1} - ${materialCategories[i % materialCategories.length]}`,
      type: materialTypes[i % materialTypes.length],
      category: materialCategories[i % materialCategories.length],
      content: i < 10
        ? `https://picsum.photos/seed/mat${i + 1}/800/800`
        : `这是${materialCategories[i % materialCategories.length]}的文案内容，突出产品卖点和优惠信息，吸引用户点击购买。${i + 1}`,
      productIds: store.products.slice(0, 3 + (i % 3)).map(p => p.id),
      shop: shops[i % shops.length],
      auditStatus: auditStatuses[i % auditStatuses.length],
      auditRemark: i % 3 === 2 ? '需要调整色调' : undefined
    }
    store.addMaterial(material)
  }

  const taskTypes = ['商品导入', '批量修改', '活动报名', '素材审核', '价格调整', '库存更新', '上下架操作']
  const priorities: Task['priority'][] = ['high', 'medium', 'low']
  const taskStatuses: Task['status'][] = ['pending', 'processing', 'completed', 'failed']

  for (let i = 0; i < 25; i++) {
    const task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
      title: `${taskTypes[i % taskTypes.length]} - 第${i + 1}批`,
      type: taskTypes[i % taskTypes.length],
      relatedId: i < 10 ? store.products[i]?.id : undefined,
      priority: priorities[i % priorities.length],
      status: taskStatuses[i % taskStatuses.length],
      progress: i % 4 === 2 ? 100 : (i % 4 === 3 ? 0 : Math.floor(Math.random() * 100)),
      operator: persons[i % persons.length],
      failReason: i % 4 === 3 ? '接口调用超时，请重试' : undefined,
      needReview: Math.random() > 0.6,
      reviewed: false,
      remark: `任务${i + 1}的详细说明和注意事项`,
      completedAt: i % 4 === 2 ? dayjs().subtract(i, 'hour').toISOString() : undefined
    }
    store.addTask(task)
  }
}

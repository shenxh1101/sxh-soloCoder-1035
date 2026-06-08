import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import { Product } from '@/types'

export function parseExcelFile(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        resolve(jsonData)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = reject
    reader.readAsBinaryString(file)
  })
}

export function parseCsvFile(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        resolve(results.data as any[])
      },
      error: reject
    })
  })
}

export async function parseImportFile(file: File): Promise<any[]> {
  const ext = file.name.split('.').pop()?.toLowerCase()

  if (ext === 'xlsx' || ext === 'xls') {
    return parseExcelFile(file)
  } else if (ext === 'csv') {
    return parseCsvFile(file)
  } else {
    throw new Error('不支持的文件格式，请上传 Excel 或 CSV 文件')
  }
}

const fieldMapping: Record<string, string[]> = {
  sku: ['sku', 'SKU', '商品编码', '款号'],
  title: ['title', '商品标题', '标题', '商品名称', '名称'],
  sellingPoint: ['sellingPoint', '卖点', '销售卖点', '副标题'],
  category: ['category', '分类', '商品分类', '类目'],
  price: ['price', '价格', '售价', '现价'],
  originalPrice: ['originalPrice', '原价', '划线价'],
  stock: ['stock', '库存', '现有库存', '库存数量'],
  reservedStock: ['reservedStock', '预留库存', '活动库存'],
  status: ['status', '状态', '商品状态', '上下架状态'],
  shop: ['shop', '店铺', '所属店铺', '店铺名称'],
  image: ['image', '图片', '主图', '图片链接']
}

function mapField(row: any, targetField: string): any {
  const possibleFields = fieldMapping[targetField] || [targetField]
  for (const field of possibleFields) {
    if (row[field] !== undefined && row[field] !== null && row[field] !== '') {
      return row[field]
    }
  }
  return undefined
}

export function transformToProducts(data: any[], defaultShop: string): Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[] {
  return data
    .filter(row => Object.values(row).some(v => v !== undefined && v !== null && v !== ''))
    .map((row, index) => {
      const status = mapField(row, 'status')
      let mappedStatus: Product['status'] = 'pending'
      if (typeof status === 'string') {
        const s = status.toLowerCase()
        if (s.includes('上架') || s.includes('on') || s.includes('sale')) mappedStatus = 'on_sale'
        else if (s.includes('下架') || s.includes('off')) mappedStatus = 'off_sale'
      }

      return {
        sku: mapField(row, 'sku') || `SKU${Date.now()}${index}`,
        title: mapField(row, 'title') || `商品${index + 1}`,
        sellingPoint: mapField(row, 'sellingPoint') || '',
        category: mapField(row, 'category') || '未分类',
        price: Number(mapField(row, 'price')) || 0,
        originalPrice: Number(mapField(row, 'originalPrice')) || Number(mapField(row, 'price')) || 0,
        stock: Number(mapField(row, 'stock')) || 0,
        reservedStock: Number(mapField(row, 'reservedStock')) || 0,
        status: mappedStatus,
        shop: mapField(row, 'shop') || defaultShop,
        image: mapField(row, 'image') || '',
        isAbnormal: false
      }
    })
}

export function exportToExcel(data: any[], fileName: string) {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
  XLSX.writeFile(workbook, `${fileName}.xlsx`)
}

export function exportToCsv(data: any[], fileName: string) {
  const csv = Papa.unparse(data)
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${fileName}.csv`
  link.click()
}

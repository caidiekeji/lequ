<template>
  <div class="page">
    <div class="page-header">
      <h1>订单管理</h1>
      <div class="header-actions">
        <input v-model="search" type="text" placeholder="搜索订单号..." class="search-input" />
        <select v-model="statusFilter" class="filter-select">
          <option value="">全部状态</option>
          <option value="pending">待支付</option>
          <option value="paid">已支付</option>
          <option value="cancelled">已取消</option>
        </select>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">¥{{ formatPrice(stats.totalAmount) }}</div>
        <div class="stat-label">总销售额</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.totalOrders }}</div>
        <div class="stat-label">总订单数</div>
      </div>
      <div class="stat-card accent">
        <div class="stat-value">{{ stats.paidOrders }}</div>
        <div class="stat-label">已支付</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.pendingOrders }}</div>
        <div class="stat-label">待支付</div>
      </div>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>订单号</th>
            <th>用户</th>
            <th>套餐</th>
            <th>金额</th>
            <th>支付方式</th>
            <th>创建时间</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in filteredOrders" :key="order.id">
            <td class="mono">{{ order.order_no }}</td>
            <td>{{ order.user_email || '-' }}</td>
            <td>{{ order.plan_name || '-' }}</td>
            <td class="price">¥{{ formatPrice(order.amount) }}</td>
            <td>{{ paymentMethodText(order.payment_method) }}</td>
            <td>{{ formatDate(order.created_at) }}</td>
            <td>
              <span :class="['status-badge', order.status]">{{ statusText(order.status) }}</span>
            </td>
            <td>
              <button class="btn-link" @click="viewOrder(order.id)">详情</button>
              <button v-if="order.status === 'pending'" class="btn-confirm-sm" @click.stop="confirmOrder(order)">确认收款</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="filteredOrders.length === 0" class="empty-state">暂无订单数据</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/api/request'

const router = useRouter()
const orders = ref([])
const stats = ref({ totalAmount: 0, totalOrders: 0, paidOrders: 0, pendingOrders: 0 })
const search = ref('')
const statusFilter = ref('')
const loading = ref(false)

const filteredOrders = computed(() => {
  return orders.value.filter(order => {
    const matchSearch = !search.value || order.order_no?.includes(search.value)
    const matchStatus = !statusFilter.value || order.status === statusFilter.value
    return matchSearch && matchStatus
  })
})

onMounted(() => {
  fetchOrders()
  fetchStats()
})

async function fetchOrders() {
  loading.value = true
  try {
    const res = await request.get('/admin/orders')
    orders.value = res.data?.list || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function fetchStats() {
  try {
    const res = await request.get('/admin/orders/stats')
    stats.value = res.data || {}
  } catch (e) {
    console.error(e)
  }
}

function formatPrice(amount) {
  return (amount / 100).toFixed(2)
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

function paymentMethodText(method) {
  const map = { wechat: '微信', alipay: '支付宝', unionpay: '云闪付', manual: '手动确认' }
  return map[method] || '-'
}

function statusText(status) {
  const map = { pending: '待支付', paid: '已支付', cancelled: '已取消' }
  return map[status] || status
}

function viewOrder(id) {
  router.push(`/orders/${id}`)
}

async function confirmOrder(order) {
  if (!confirm(`确认订单 ${order.order_no} 已收款？`)) return
  try {
    await request.post(`/admin/orders/${order.id}/confirm`)
    alert('已确认收款')
    fetchOrders()
    fetchStats()
  } catch (e) {
    alert(e.message)
  }
}
</script>

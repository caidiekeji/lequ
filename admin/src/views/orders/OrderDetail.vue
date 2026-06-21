<template>
  <div class="page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">← 返回</button>
      <h1>订单详情</h1>
    </div>

    <div v-if="loading" class="loading">加载中...</div>

    <template v-else-if="order">
      <div class="detail-grid">
        <div class="detail-card">
          <h3>订单信息</h3>
          <div class="info-row">
            <span class="label">订单号</span>
            <span class="value mono">{{ order.order_no }}</span>
          </div>
          <div class="info-row">
            <span class="label">状态</span>
            <span :class="['status-badge', order.status]">{{ statusText(order.status) }}</span>
          </div>
          <div class="info-row">
            <span class="label">金额</span>
            <span class="value price">¥{{ formatPrice(order.amount) }}</span>
          </div>
          <div class="info-row">
            <span class="label">支付方式</span>
            <span class="value">{{ paymentMethodText(order.payment_method) }}</span>
          </div>
          <div class="info-row">
            <span class="label">支付流水号</span>
            <span class="value mono">{{ order.payment_no || '-' }}</span>
          </div>
          <div class="info-row">
            <span class="label">创建时间</span>
            <span class="value">{{ formatDateTime(order.created_at) }}</span>
          </div>
          <div class="info-row">
            <span class="label">支付时间</span>
            <span class="value">{{ formatDateTime(order.paid_at) || '-' }}</span>
          </div>
        </div>

        <div class="detail-card">
          <h3>关联信息</h3>
          <div class="info-row">
            <span class="label">用户</span>
            <span class="value">{{ order.user_email || '-' }}</span>
          </div>
          <div class="info-row">
            <span class="label">套餐</span>
            <span class="value">{{ order.plan_name || '-' }}</span>
          </div>
          <div class="info-row">
            <span class="label">关联授权</span>
            <span class="value">
              <router-link v-if="order.license_id" :to="`/licenses/${order.license_id}`" class="link">
                查看授权
              </router-link>
              <span v-else>-</span>
            </span>
          </div>
          <div class="info-row">
            <span class="label">备注</span>
            <span class="value">{{ order.remark || '-' }}</span>
          </div>
          <div v-if="order.status === 'pending'" class="action-row">
            <button class="btn-confirm" @click="confirmPayment">确认已收款</button>
            <button class="btn-cancel" @click="cancelOrder">取消订单</button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import request from '@/api/request'

const route = useRoute()
const order = ref(null)
const loading = ref(true)

onMounted(() => {
  fetchOrderDetail()
})

async function fetchOrderDetail() {
  try {
    const res = await request.get(`/admin/orders/${route.params.id}`)
    order.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function confirmPayment() {
  if (!confirm('确认该订单已收款？系统将自动为用户分配授权码。')) return
  try {
    await request.post(`/admin/orders/${order.value.id}/confirm`)
    alert('已确认收款，授权码已分配')
    fetchOrderDetail()
  } catch (e) {
    alert(e.message)
  }
}

async function cancelOrder() {
  if (!confirm('确认取消该订单？')) return
  try {
    await request.post(`/admin/orders/${order.value.id}/cancel`)
    alert('订单已取消')
    fetchOrderDetail()
  } catch (e) {
    alert(e.message)
  }
}

function formatPrice(amount) {
  return (amount / 100).toFixed(2)
}

function formatDateTime(dateStr) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleString('zh-CN')
}

function paymentMethodText(method) {
  const map = { wechat: '微信', alipay: '支付宝', unionpay: '云闪付', manual: '手动确认' }
  return map[method] || '-'
}

function statusText(status) {
  const map = { pending: '待支付', paid: '已支付', cancelled: '已取消' }
  return map[status] || status
}
</script>

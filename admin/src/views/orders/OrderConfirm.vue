<template>
  <div class="page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">← 返回</button>
      <h1>订单处理</h1>
    </div>

    <div v-if="!order" class="form-card" style="margin-bottom:24px">
      <h3>查询订单</h3>
      <div class="form-group">
        <label>订单号</label>
        <input v-model="searchOrderNo" type="text" placeholder="输入订单号" @keyup.enter="fetchOrder" />
      </div>
      <button class="btn-primary" @click="fetchOrder">查询</button>
    </div>

    <template v-if="order">
      <div class="detail-grid" style="margin-bottom:24px">
        <div class="detail-card">
          <h3>订单信息</h3>
          <div class="info-row"><span class="label">订单号</span><span class="value mono">{{ order.order_no }}</span></div>
          <div class="info-row"><span class="label">用户</span><span class="value">{{ order.user_email || '-' }}</span></div>
          <div class="info-row"><span class="label">套餐</span><span class="value">{{ order.plan_name || '-' }}</span></div>
          <div class="info-row"><span class="label">金额</span><span class="value price">¥{{ formatPrice(order.amount) }}</span></div>
          <div class="info-row"><span class="label">状态</span><span :class="['status-badge', order.status]">{{ statusText(order.status) }}</span></div>
        </div>
      </div>

      <div class="form-card" style="margin-bottom:24px">
        <h3>收款确认</h3>
        <p class="desc">手动确认用户已转账/汇款后，标记订单为已支付，系统将自动分配授权码。</p>
        <button v-if="order.status === 'pending'" class="btn-confirm" @click="confirmPayment">确认已收款</button>
        <div v-else-if="order.status === 'paid'" class="status-bar ok">该订单已完成支付</div>
        <div v-else class="status-bar warn">订单状态：{{ order.status }}</div>
      </div>

      <div class="detail-grid">
        <div class="form-card">
          <h3>退款处理</h3>
          <p class="desc">对已支付的订单发起退款。</p>
          <div v-if="order.status === 'paid'">
            <div class="form-group">
              <label>退款金额（元）</label>
              <input v-model.number="refundAmount" type="number" :max="formatPrice(order.amount)" min="0" step="0.01" />
            </div>
            <div class="form-group">
              <label>退款原因</label>
              <input v-model="refundReason" type="text" placeholder="选填" />
            </div>
            <button class="btn-cancel" @click="handleRefund">提交退款</button>
          </div>
          <div v-else class="status-bar warn">仅已支付订单可退款</div>
        </div>

        <div class="form-card">
          <h3>改价</h3>
          <p class="desc">修改待支付订单的金额。</p>
          <div v-if="order.status === 'pending'">
            <div class="form-group">
              <label>新金额（元）</label>
              <input v-model.number="newPrice" type="number" min="0" step="0.01" />
            </div>
            <button class="btn-secondary" @click="handlePriceChange">更新价格</button>
          </div>
          <div v-else class="status-bar warn">仅待支付订单可改价</div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ordersApi from '@/api/orders'

const searchOrderNo = ref('')
const order = ref(null)
const refundAmount = ref(0)
const refundReason = ref('')
const newPrice = ref(0)

async function fetchOrder() {
  try {
    const res = await ordersApi.detail(searchOrderNo.value)
    order.value = res.data
    refundAmount.value = (order.value.amount || 0) / 100
    newPrice.value = (order.value.amount || 0) / 100
  } catch (e) {
    alert(e.message)
  }
}

async function confirmPayment() {
  if (!confirm(`确认订单 ${order.value.order_no} 已收款？`)) return
  try {
    await ordersApi.confirm(order.value.id)
    alert('已确认收款')
    order.value.status = 'paid'
  } catch (e) {
    alert(e.message)
  }
}

async function handleRefund() {
  if (!refundAmount.value || refundAmount.value <= 0) { alert('请输入退款金额'); return }
  if (!confirm(`确认退款 ¥${refundAmount.value.toFixed(2)}？`)) return
  try {
    await ordersApi.refund(order.value.id, { amount: Math.round(refundAmount.value * 100), reason: refundReason.value })
    alert('退款已提交')
    fetchOrder()
  } catch (e) {
    alert(e.message)
  }
}

async function handlePriceChange() {
  if (!newPrice.value || newPrice.value <= 0) { alert('请输入有效金额'); return }
  if (!confirm(`确认将价格改为 ¥${newPrice.value.toFixed(2)}？`)) return
  try {
    await ordersApi.updatePrice(order.value.id, { amount: Math.round(newPrice.value * 100) })
    alert('价格已更新')
    fetchOrder()
  } catch (e) {
    alert(e.message)
  }
}

function formatPrice(amount) {
  return ((amount || 0) / 100).toFixed(2)
}

function statusText(s) {
  const map = { pending: '待支付', paid: '已支付', cancelled: '已取消', refunded: '已退款' }
  return map[s] || s
}
</script>

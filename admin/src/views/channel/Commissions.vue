<template>
  <div class="page">
    <div class="page-header" style="justify-content:space-between">
      <h1>佣金结算</h1>
      <button class="btn-primary" @click="batchSettle">批量结算</button>
    </div>

    <div class="stats-grid">
      <div class="stat-card accent">
        <div class="stat-value">¥{{ formatPrice(stats.total) }}</div>
        <div class="stat-label">总佣金</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">¥{{ formatPrice(stats.pending) }}</div>
        <div class="stat-label">待结算</div>
      </div>
      <div class="stat-card accent">
        <div class="stat-value">¥{{ formatPrice(stats.settled) }}</div>
        <div class="stat-label">已结算</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.channel_count }}</div>
        <div class="stat-label">渠道商数</div>
      </div>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead><tr><th><input type="checkbox" v-model="selectAll" @change="toggleAll" /></th><th>渠道商</th><th>订单号</th><th>金额</th><th>佣金</th><th>比例</th><th>状态</th><th>时间</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="c in commissions" :key="c.id">
            <td><input type="checkbox" :value="c.id" v-model="selectedIds" :disabled="c.status === 'settled'" /></td>
            <td>{{ c.channel_name || '-' }}</td>
            <td class="mono">{{ c.order_no || '-' }}</td>
            <td class="price">¥{{ formatPrice(c.order_amount) }}</td>
            <td class="price">¥{{ formatPrice(c.amount) }}</td>
            <td>{{ c.rate ?? 0 }}%</td>
            <td><span :class="['status-badge', c.status === 'settled' ? 'active' : 'pending']">{{ c.status === 'settled' ? '已结算' : '待结算' }}</span></td>
            <td>{{ formatDate(c.created_at) }}</td>
            <td>
              <button v-if="c.status !== 'settled'" class="btn-confirm-sm" @click="settleOne(c)">结算</button>
              <span v-else style="color:#94a3b8;font-size:13px">-</span>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!commissions.length" class="empty-state">暂无佣金数据</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import channelsApi from '@/api/channels'

const commissions = ref([])
const stats = ref({ total: 0, pending: 0, settled: 0, channel_count: 0 })
const selectedIds = ref([])
const selectAll = ref(false)

onMounted(() => { fetchData() })

async function fetchData() {
  try {
    const [r, s] = await Promise.all([
      channelsApi.commissions(),
      channelsApi.list(),
    ])
    commissions.value = r.data || []
    const chs = s.data || []
    const total = commissions.value.reduce((sum, c) => sum + (c.amount || 0), 0)
    const pending = commissions.value.filter(c => c.status !== 'settled').reduce((sum, c) => sum + (c.amount || 0), 0)
    const settled = commissions.value.filter(c => c.status === 'settled').reduce((sum, c) => sum + (c.amount || 0), 0)
    stats.value = { total, pending, settled, channel_count: chs.length }
  } catch (e) { console.error(e) }
}

function toggleAll() {
  if (selectAll.value) {
    selectedIds.value = commissions.value.filter(c => c.status !== 'settled').map(c => c.id)
  } else {
    selectedIds.value = []
  }
}

async function settleOne(c) {
  if (!confirm(`确认结算 ${c.channel_name} 的佣金 ¥${formatPrice(c.amount)}？`)) return
  try { await channelsApi.settle(c.id); fetchData() }
  catch (e) { alert(e.message) }
}

async function batchSettle() {
  if (!selectedIds.value.length) { alert('请选择待结算项'); return }
  if (!confirm(`确认批量结算 ${selectedIds.value.length} 笔佣金？`)) return
  try { await channelsApi.batchSettle(selectedIds.value); selectedIds.value = []; fetchData() }
  catch (e) { alert(e.message) }
}

function formatPrice(amount) { return ((amount || 0) / 100).toFixed(2) }
function formatDate(d) { return d ? new Date(d).toLocaleDateString('zh-CN') : '-' }
</script>

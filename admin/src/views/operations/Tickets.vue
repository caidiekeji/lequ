<template>
  <div class="page">
    <div class="page-header" style="justify-content:space-between">
      <h1>工单管理</h1>
      <div class="header-actions">
        <select v-model="statusFilter" class="filter-select">
          <option value="">全部状态</option>
          <option value="open">待处理</option>
          <option value="processing">处理中</option>
          <option value="closed">已关闭</option>
        </select>
      </div>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead><tr><th>编号</th><th>标题</th><th>用户</th><th>状态</th><th>优先级</th><th>创建时间</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="t in filteredTickets" :key="t.id">
            <td class="mono">#{{ t.id }}</td>
            <td style="font-weight:600;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" :title="t.title">{{ t.title }}</td>
            <td>{{ t.user_email || '-' }}</td>
            <td><span :class="['status-badge', ticketStatusClass(t.status)]">{{ ticketStatusText(t.status) }}</span></td>
            <td><span :class="['status-badge', priorityClass(t.priority)]">{{ priorityText(t.priority) }}</span></td>
            <td>{{ formatDate(t.created_at) }}</td>
            <td>
              <button class="btn-link" @click="openTicket(t)">查看</button>
              <button v-if="t.status !== 'closed'" class="btn-link danger" @click="closeTicket(t)">关闭</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!filteredTickets.length" class="empty-state">暂无工单</div>
    </div>

    <div v-if="selectedTicket" class="modal-overlay" @click.self="selectedTicket = null">
      <div class="modal-card">
        <div class="modal-header">
          <h3>{{ selectedTicket.title }}</h3>
          <button class="modal-close" @click="selectedTicket = null">&times;</button>
        </div>
        <div class="modal-body">
          <div class="info-row"><span class="label">用户</span><span class="value">{{ selectedTicket.user_email || '-' }}</span></div>
          <div class="info-row"><span class="label">状态</span><span :class="['status-badge', ticketStatusClass(selectedTicket.status)]">{{ ticketStatusText(selectedTicket.status) }}</span></div>
          <div style="margin:16px 0;padding:16px;background:#f8fafc;border-radius:8px;font-size:14px;color:#334155;white-space:pre-wrap">{{ selectedTicket.content }}</div>

          <div v-if="(selectedTicket.replies || []).length" style="margin-top:16px">
            <h4 style="font-size:14px;font-weight:700;margin-bottom:12px">回复记录</h4>
            <div v-for="r in selectedTicket.replies" :key="r.id" style="padding:12px;background:#f8fafc;border-radius:8px;margin-bottom:8px;font-size:13px">
              <div style="display:flex;justify-content:space-between;color:#94a3b8;margin-bottom:4px">
                <span>{{ r.admin_name || '用户' }}</span>
                <span>{{ formatDateTime(r.created_at) }}</span>
              </div>
              <div style="color:#334155">{{ r.content }}</div>
            </div>
          </div>

          <div v-if="selectedTicket.status !== 'closed'" style="margin-top:16px">
            <textarea v-model="replyContent" rows="3" placeholder="输入回复内容..." style="width:100%;padding:10px 14px;background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:14px;resize:vertical"></textarea>
            <div style="margin-top:8px;display:flex;gap:8px">
              <button class="btn-primary" @click="submitReply">回复</button>
              <button class="btn-secondary" @click="closeTicket(selectedTicket)">关闭工单</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import operationsApi from '@/api/operations'

const tickets = ref([])
const statusFilter = ref('')
const selectedTicket = ref(null)
const replyContent = ref('')

const filteredTickets = computed(() => {
  return tickets.value.filter(t => !statusFilter.value || t.status === statusFilter.value)
})

onMounted(() => { fetchTickets() })

async function fetchTickets() {
  try { const r = await operationsApi.tickets(); tickets.value = r.data?.list || r.data || [] }
  catch (e) { console.error(e) }
}

async function openTicket(t) {
  try {
    const r = await operationsApi.ticketDetail(t.id)
    selectedTicket.value = r.data
    replyContent.value = ''
  } catch (e) { alert(e.message) }
}

async function submitReply() {
  if (!replyContent.value.trim()) return
  try {
    await operationsApi.replyTicket(selectedTicket.value.id, { content: replyContent.value })
    replyContent.value = ''
    openTicket(selectedTicket.value)
  } catch (e) { alert(e.message) }
}

async function closeTicket(t) {
  if (!confirm('确认关闭该工单？')) return
  try {
    await operationsApi.closeTicket(t.id)
    selectedTicket.value = null
    fetchTickets()
  } catch (e) { alert(e.message) }
}

function formatDate(d) { return d ? new Date(d).toLocaleDateString('zh-CN') : '-' }
function formatDateTime(d) { return d ? new Date(d).toLocaleString('zh-CN') : '-' }
function ticketStatusClass(s) { return { open: 'pending', processing: 'pending', closed: 'cancelled' }[s] || '' }
function ticketStatusText(s) { return { open: '待处理', processing: '处理中', closed: '已关闭' }[s] || s }
function priorityClass(p) { return { high: 'expired', medium: 'pending', low: 'active' }[p] || '' }
function priorityText(p) { return { high: '高', medium: '中', low: '低' }[p] || p }
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-card {
  background: #fff;
  border-radius: 16px;
  width: 560px;
  max-width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
}

.modal-header h3 {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
}

.modal-close:hover { background: #f1f5f9; color: #0f172a; }

.modal-body {
  padding: 24px;
}
</style>

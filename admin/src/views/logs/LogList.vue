<template>
  <div class="page">
    <h1 style="font-size:24px;font-weight:800;letter-spacing:-0.5px;margin-bottom:24px">操作日志</h1>
    <div class="table-container">
      <table class="data-table">
        <thead><tr><th>时间</th><th>操作</th><th>授权码</th><th>门店</th><th>详情</th></tr></thead>
        <tbody>
          <tr v-for="log in logs" :key="log.id">
            <td>{{ formatDateTime(log.created_at) }}</td>
            <td><span :class="['status-badge', log.action === 'activate' ? 'active' : log.action === 'revoke' ? 'revoked' : '']">{{ actionText(log.action) }}</span></td>
            <td class="mono" style="font-size:12px">{{ log.license_key || '-' }}</td>
            <td>{{ log.store_name || '-' }}</td>
            <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" :title="log.detail">{{ log.detail || '-' }}</td>
          </tr>
        </tbody>
      </table>
      <div v-if="!logs.length" class="empty-state">暂无日志</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '@/api/request'

const logs = ref([])

onMounted(async () => {
  try { const r = await request.get('/admin/logs'); logs.value = r.data?.list || [] }
  catch (e) { console.error(e) }
})

function formatDateTime(d) { return d ? new Date(d).toLocaleString('zh-CN') : '-' }
function actionText(a) { return { activate: '激活', revoke: '吊销', heartbeat: '心跳' }[a] || a }
</script>

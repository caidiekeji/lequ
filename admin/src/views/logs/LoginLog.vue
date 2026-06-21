<template>
  <div class="page">
    <div class="page-header" style="justify-content:space-between">
      <h1>登录日志</h1>
      <div class="header-actions">
        <input v-model="search" type="text" placeholder="搜索用户名..." class="search-input" />
      </div>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead><tr><th>时间</th><th>用户名</th><th>IP 地址</th><th>User Agent</th><th>结果</th></tr></thead>
        <tbody>
          <tr v-for="log in filteredLogs" :key="log.id">
            <td>{{ formatDateTime(log.created_at) }}</td>
            <td style="font-weight:600">{{ log.account || '-' }}</td>
            <td class="mono">{{ log.ip || '-' }}</td>
            <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" :title="log.user_agent">{{ log.user_agent || '-' }}</td>
            <td>
              <span :class="['status-badge', log.status === 'success' ? 'active' : 'expired']">{{ log.status === 'success' ? '成功' : '失败' }}</span>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!filteredLogs.length" class="empty-state">暂无登录日志</div>
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <button class="btn-secondary" :disabled="page <= 1" @click="page--">上一页</button>
      <span class="page-info">第 {{ page }} / {{ totalPages }} 页</span>
      <button class="btn-secondary" :disabled="page >= totalPages" @click="page++">下一页</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import settingsApi from '@/api/settings'

const logs = ref([])
const search = ref('')
const page = ref(1)
const totalPages = ref(1)
const pageSize = 20

const filteredLogs = computed(() => {
  return logs.value.filter(l => !search.value || l.account?.includes(search.value))
})

onMounted(() => { fetchLogs() })
watch(page, () => { fetchLogs() })

async function fetchLogs() {
  try {
    const r = await settingsApi.loginLogs({ page: page.value, page_size: pageSize })
    logs.value = r.data?.list || []
    totalPages.value = Math.ceil((r.data?.total || 0) / pageSize) || 1
  } catch (e) { console.error(e) }
}

function formatDateTime(d) { return d ? new Date(d).toLocaleString('zh-CN') : '-' }
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
}

.page-info {
  font-size: 14px;
  color: #64748b;
}
</style>

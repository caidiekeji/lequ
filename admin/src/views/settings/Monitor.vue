<template>
  <div class="page">
    <h1 style="font-size:24px;font-weight:800;letter-spacing:-0.5px;margin-bottom:24px">系统监控</h1>

    <div v-if="loading" class="loading">加载中...</div>

    <template v-else>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">{{ monitor.cpu || 0 }}%</div>
          <div class="stat-label">CPU 使用率</div>
        </div>
        <div class="stat-card accent">
          <div class="stat-value">{{ monitor.memory || 0 }}%</div>
          <div class="stat-label">内存使用率</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ monitor.disk || 0 }}%</div>
          <div class="stat-label">磁盘使用率</div>
        </div>
        <div class="stat-card accent">
          <div class="stat-value">{{ formatUptime(monitor.uptime) }}</div>
          <div class="stat-label">运行时间</div>
        </div>
      </div>

      <div class="detail-grid">
        <div class="detail-card">
          <h3>API 状态</h3>
          <div v-for="api in apis" :key="api.name" class="info-row">
            <span class="label">{{ api.name }}</span>
            <span :class="['status-badge', api.status === 'ok' ? 'active' : 'expired']">{{ api.status === 'ok' ? '正常' : '异常' }}</span>
          </div>
        </div>
        <div class="detail-card">
          <h3>服务器信息</h3>
          <div class="info-row"><span class="label">Node 版本</span><span class="value">{{ monitor.node_version || '-' }}</span></div>
          <div class="info-row"><span class="label">平台</span><span class="value">{{ monitor.platform || '-' }}</span></div>
          <div class="info-row"><span class="label">CPU 核数</span><span class="value">{{ monitor.cpu_cores || '-' }}</span></div>
          <div class="info-row"><span class="label">总内存</span><span class="value">{{ formatBytes(monitor.total_memory) }}</span></div>
        </div>
      </div>

      <div class="detail-card" style="margin-top:20px">
        <h3>请求统计（近24小时）</h3>
        <div class="stats-grid" style="margin-bottom:0">
          <div class="stat-card">
            <div class="stat-value">{{ monitor.requests_24h || 0 }}</div>
            <div class="stat-label">总请求数</div>
          </div>
          <div class="stat-card accent">
            <div class="stat-value">{{ monitor.avg_response_time || 0 }}ms</div>
            <div class="stat-label">平均响应时间</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ monitor.error_rate || 0 }}%</div>
            <div class="stat-label">错误率</div>
          </div>
          <div class="stat-card accent">
            <div class="stat-value">{{ monitor.active_connections || 0 }}</div>
            <div class="stat-label">活跃连接数</div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import settingsApi from '@/api/settings'

const loading = ref(true)
const monitor = ref({})
const apis = ref([])

onMounted(async () => {
  try {
    const r = await settingsApi.monitor()
    monitor.value = r.data || {}
    apis.value = r.data?.apis || []
  } catch (e) { console.error(e) }
  finally { loading.value = false }
})

function formatUptime(seconds) {
  if (!seconds) return '-'
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  if (d > 0) return `${d}天${h}小时`
  return `${h}小时`
}

function formatBytes(bytes) {
  if (!bytes) return '-'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB'
  return (bytes / 1073741824).toFixed(1) + ' GB'
}
</script>

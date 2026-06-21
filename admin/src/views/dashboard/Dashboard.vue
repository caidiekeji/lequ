<template>
  <div class="page">
    <h1 class="page-title">仪表盘</h1>

    <div class="stats-grid">
      <div class="stat-card accent">
        <div class="stat-value">¥{{ formatPrice(summary.today_gmv) }}</div>
        <div class="stat-label">今日 GMV</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ summary.new_users }}</div>
        <div class="stat-label">新增用户</div>
      </div>
      <div class="stat-card accent">
        <div class="stat-value">{{ summary.new_licenses }}</div>
        <div class="stat-label">新增授权</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ summary.active_instances }}</div>
        <div class="stat-label">活跃实例</div>
      </div>
    </div>

    <div class="detail-grid" style="margin-bottom:24px">
      <div class="detail-card">
        <h3>近 30 天 GMV 趋势</h3>
        <div class="bar-chart">
          <div v-for="(item, i) in trends" :key="i" class="bar-col">
            <div class="bar-value">¥{{ formatPrice(item.value) }}</div>
            <div class="bar" :style="{ height: barHeight(item.value) + '%' }" :title="item.date"></div>
            <div class="bar-label">{{ formatShortDate(item.date) }}</div>
          </div>
        </div>
        <div v-if="!trends.length" class="empty-state" style="padding:40px 0">暂无数据</div>
      </div>
      <div class="detail-card">
        <h3>待办事项</h3>
        <div v-if="todos.length">
          <div v-for="(t, i) in todos" :key="i" class="todo-item">
            <span :class="['todo-dot', t.type || 'info']"></span>
            <span class="todo-text">{{ t.text }}</span>
            <span v-if="t.count" class="todo-count">{{ t.count }}</span>
          </div>
        </div>
        <div v-else class="empty-state" style="padding:40px 0">暂无待办</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import dashboardApi from '@/api/dashboard'

const summary = ref({ today_gmv: 0, new_users: 0, new_licenses: 0, active_instances: 0 })
const trends = ref([])
const todos = ref([])

onMounted(async () => {
  try {
    const [s, t, todo] = await Promise.all([
      dashboardApi.summary(),
      dashboardApi.trends({ days: 30 }),
      dashboardApi.todos(),
    ])
    if (s.data) Object.assign(summary.value, s.data)
    trends.value = t.data || []
    todos.value = todo.data || []
  } catch (e) {
    console.error(e)
  }
})

function formatPrice(amount) {
  return ((amount || 0) / 100).toFixed(0)
}

function formatShortDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function barHeight(value) {
  const max = Math.max(...trends.map(i => i.value), 1)
  return ((value || 0) / max) * 100
}
</script>

<style scoped>
.page-title {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: #0f172a;
  margin-bottom: 24px;
}

.bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 160px;
  padding: 20px 0 0;
}

.bar-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  min-width: 0;
}

.bar {
  width: 100%;
  max-width: 28px;
  background: linear-gradient(to top, #2563eb, #60a5fa);
  border-radius: 4px 4px 0 0;
  min-height: 2px;
  transition: height 0.4s ease;
  cursor: pointer;
}

.bar:hover {
  opacity: 0.8;
}

.bar-value {
  font-size: 9px;
  color: #64748b;
  margin-bottom: 4px;
  white-space: nowrap;
  transform: rotate(-30deg);
  transform-origin: bottom left;
}

.bar-label {
  font-size: 9px;
  color: #94a3b8;
  margin-top: 4px;
  white-space: nowrap;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #f1f5f9;
}

.todo-item:last-child {
  border-bottom: none;
}

.todo-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.todo-dot.info { background: #3b82f6; }
.todo-dot.warning { background: #f59e0b; }
.todo-dot.danger { background: #ef4444; }

.todo-text {
  flex: 1;
  font-size: 13px;
  color: #334155;
}

.todo-count {
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  background: #ef4444;
  padding: 1px 8px;
  border-radius: 100px;
}
</style>

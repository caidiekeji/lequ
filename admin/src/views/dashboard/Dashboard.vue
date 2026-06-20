<template>
  <div class="dashboard">
    <h1 class="page-title">仪表盘</h1>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-value">{{ stats.total_licenses }}</div><div class="stat-label">授权码总数</div></div>
      <div class="stat-card active"><div class="stat-value">{{ stats.active_licenses }}</div><div class="stat-label">活跃授权码</div></div>
      <div class="stat-card"><div class="stat-value">{{ stats.total_instances }}</div><div class="stat-label">激活实例总数</div></div>
      <div class="stat-card active"><div class="stat-value">{{ stats.active_instances }}</div><div class="stat-label">活跃实例</div></div>
      <div class="stat-card"><div class="stat-value">{{ stats.today_activations }}</div><div class="stat-label">今日激活</div></div>
      <div class="stat-card"><div class="stat-value">{{ stats.weekly_activations }}</div><div class="stat-label">近 7 天激活</div></div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import request from '../../api/request'
const stats = ref({ total_licenses:0, active_licenses:0, total_instances:0, active_instances:0, today_activations:0, weekly_activations:0, edition_stats:[] })
onMounted(async () => {
  try { const res = await request.get('/dashboard'); stats.value = res.data } catch (err) { console.error(err.message) }
})
</script>
<style scoped>
.dashboard{max-width:1000px}
.page-title{font-size:22px;margin-bottom:24px;color:#1a1a2e}
.stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.stat-card{background:#fff;border-radius:10px;padding:24px;box-shadow:0 1px 4px rgba(0,0,0,.06);text-align:center}
.stat-card.active{border-top:3px solid #4fc3f7}
.stat-value{font-size:32px;font-weight:700;color:#1a1a2e}
.stat-label{font-size:13px;color:#888;margin-top:6px}
</style>
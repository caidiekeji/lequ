<template>
  <div class="page">
    <h1 style="font-size:24px;font-weight:800;letter-spacing:-0.5px;margin-bottom:24px">数据分析</h1>

    <!-- 访问统计 -->
    <div class="stats-grid">
      <div class="stat-card accent">
        <div class="stat-value">{{ visits.total }}</div>
        <div class="stat-label">总访问量</div>
      </div>
      <div class="stat-card accent">
        <div class="stat-value">{{ visits.today }}</div>
        <div class="stat-label">今日访问</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ visits.week }}</div>
        <div class="stat-label">近7天访问</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ editionStats.length }}</div>
        <div class="stat-label">产品版本数</div>
      </div>
    </div>

    <!-- 访问趋势 & 页面热度 -->
    <div class="detail-grid" style="margin-bottom:20px">
      <div class="detail-card">
        <h3>近7天访问趋势</h3>
        <div v-for="d in visitsByDay" :key="d.date" class="info-row">
          <span class="label">{{ d.date }}</span>
          <span class="value" style="font-weight:600">{{ d.visits }} 次访问 / {{ d.uv }} UV</span>
        </div>
        <div v-if="!visitsByDay.length" class="empty-state" style="padding:20px">暂无数据</div>
      </div>
      <div class="detail-card">
        <h3>页面热度（近7天）</h3>
        <div v-for="p in visitsByPage" :key="p.path" class="info-row">
          <span class="label mono">{{ p.path }}</span>
          <span class="value">{{ p.visits }} 次 / {{ p.uv }} UV</span>
        </div>
        <div v-if="!visitsByPage.length" class="empty-state" style="padding:20px">暂无数据</div>
      </div>
    </div>

    <!-- 来源 & 收入 -->
    <div class="detail-grid">
      <div class="detail-card">
        <h3>访问来源（近7天）</h3>
        <div v-for="r in topReferers" :key="r.referer" class="info-row">
          <span class="label" style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" :title="r.referer">{{ formatReferer(r.referer) }}</span>
          <span class="value">{{ r.cnt }} 次</span>
        </div>
        <div v-if="!topReferers.length" class="empty-state" style="padding:20px">暂无数据（直接访问为主）</div>
      </div>
      <div class="detail-card">
        <h3>版本分布</h3>
        <div v-for="e in editionStats" :key="e.product_edition" class="info-row">
          <span class="label">{{ editionText(e.product_edition) }}</span>
          <span class="value" style="font-weight:600">{{ e.cnt }} 个授权</span>
        </div>
        <div v-if="!editionStats.length" class="empty-state" style="padding:20px">暂无数据</div>
      </div>
    </div>

    <!-- 收入趋势 -->
    <div class="detail-card" style="margin-top:20px">
      <h3>近30天收入</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-top:12px">
        <div v-for="r in revenueByDay.slice(-14)" :key="r.date" style="padding:12px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0">
          <div style="font-size:12px;color:#64748b;margin-bottom:4px">{{ r.date }}</div>
          <div style="font-size:18px;font-weight:700;color:#0f172a">¥{{ (r.revenue/100).toFixed(0) }}</div>
          <div style="font-size:12px;color:#94a3b8">{{ r.orders }} 笔订单</div>
        </div>
      </div>
      <div v-if="!revenueByDay.length" class="empty-state">暂无收入数据</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import request from '@/api/request'

const revenueByDay = ref([])
const editionStats = ref([])
const recentActivations = ref([])
const visitsData = ref({ total: 0, today: 0, week: 0, byDay: [], byPage: [], topReferers: [] })

const visits = computed(() => visitsData.value)
const visitsByDay = computed(() => (visitsData.value.byDay || []).slice(-7))
const visitsByPage = computed(() => visitsData.value.byPage || [])
const topReferers = computed(() => visitsData.value.topReferers || [])

onMounted(async () => {
  try {
    const r = await request.get('/admin/analytics')
    revenueByDay.value = r.data?.revenueByDay || []
    editionStats.value = r.data?.editionStats || []
    recentActivations.value = r.data?.recentActivations || []
    visitsData.value = r.data?.visits || {}
  } catch (e) { console.error(e) }
})

function editionText(c) { return { basic: '基础版', pro: '专业版', enterprise: '企业版' }[c] || c }

function formatReferer(url) {
  if (!url) return '-'
  try { return new URL(url).hostname } catch { return url.substring(0, 40) }
}
</script>

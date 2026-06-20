<template>
  <div class="license-detail">
    <div class="page-header"><router-link to="/licenses" class="back-link">&larr; 返回列表</router-link><button v-if="detail.status==='active'" @click="handleRevoke" class="revoke-btn">吊销此授权码</button></div>
    <div class="info-card">
      <h2 class="card-title">授权码信息</h2>
      <div class="info-grid">
        <div class="info-item"><span class="info-label">授权码</span><span class="info-value license-key">{{ detail.license_key }}</span></div>
        <div class="info-item"><span class="info-label">版本</span><span class="info-value">{{ editionLabel(detail.product_edition) }}</span></div>
        <div class="info-item"><span class="info-label">状态</span><span :class="'status-tag status-'+detail.status">{{ statusLabel(detail.status) }}</span></div>
        <div class="info-item"><span class="info-label">客户</span><span class="info-value">{{ detail.customer_name||'-' }}</span></div>
        <div class="info-item"><span class="info-label">激活次数</span><span class="info-value">{{ detail.max_stores===-1?'不限':detail.max_stores }}</span></div>
        <div class="info-item"><span class="info-label">终端数</span><span class="info-value">{{ detail.max_terminals===-1?'不限':detail.max_terminals }}</span></div>
        <div class="info-item"><span class="info-label">有效期</span><span class="info-value">{{ formatDate(detail.valid_from) }} ~ {{ formatDate(detail.valid_until) }}</span></div>
        <div class="info-item" v-if="detail.note"><span class="info-label">备注</span><span class="info-value">{{ detail.note }}</span></div>
        <div class="info-item"><span class="info-label">创建时间</span><span class="info-value">{{ formatDateTime(detail.created_at) }}</span></div>
      </div>
    </div>
    <div class="info-card">
      <h2 class="card-title">激活实例（{{ instances.length }}）</h2>
      <div v-if="instances.length===0" class="empty-hint">暂无激活实例</div>
      <div v-for="inst in instances" :key="inst.id" class="instance-item">
        <div class="instance-header"><span class="instance-name">{{ inst.store_name }}</span><span :class="'status-tag status-'+inst.status">{{ inst.status }}</span></div>
        <div class="instance-info"><span>ID: {{ inst.instance_id.substring(0,8) }}...</span><span>激活: {{ formatDateTime(inst.activated_at) }}</span><span>心跳: {{ formatDateTime(inst.last_heartbeat) }}</span></div>
      </div>
    </div>
    <div class="info-card">
      <h2 class="card-title">审计日志</h2>
      <div v-if="logs.length===0" class="empty-hint">暂无记录</div>
      <div v-for="log in logs" :key="log.id" class="audit-item">
        <span class="audit-action">{{ log.action }}</span>
        <span class="audit-time">{{ formatDateTime(log.created_at) }}</span>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import request from '../../api/request'
const route = useRoute(); const router = useRouter()
const detail = ref({}); const instances = ref([]); const logs = ref([])
const editionMap = { basic:'基础版', standard:'标准版', premium:'高级版', enterprise:'企业版' }
const statusMap = { active:'活跃', revoked:'已吊销', expired:'已过期' }
function editionLabel(k) { return editionMap[k]||k }
function statusLabel(k) { return statusMap[k]||k }
function formatDate(d) { return d?new Date(d).toLocaleDateString('zh-CN'):'-' }
function formatDateTime(d) { return d?new Date(d).toLocaleString('zh-CN'):'-' }
async function handleRevoke() {
  if (!confirm('确定吊销？所有关联实例将停用')) return
  try { await request.post('/licenses/'+detail.value.id+'/revoke'); loadDetail() }
  catch(err) { alert('吊销失败: '+err.message) }
}
async function loadDetail() {
  try {
    const res = await request.get('/licenses/'+route.params.id)
    detail.value = res.data
    instances.value = res.data.instances||[]
    logs.value = res.data.audit_logs||[]
  } catch(err) { router.push('/licenses') }
}
onMounted(loadDetail)
</script>
<style scoped>
.license-detail{max-width:900px}
.page-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}
.back-link{color:#0f3460;text-decoration:none;font-size:14px}
.revoke-btn{padding:6px 18px;background:#ffebee;color:#c62828;border:1px solid #ef9a9a;border-radius:6px;font-size:13px;cursor:pointer}
.info-card{background:#fff;border-radius:10px;padding:24px;margin-bottom:20px;box-shadow:0 1px 4px rgba(0,0,0,.06)}
.card-title{font-size:16px;color:#1a1a2e;margin-bottom:20px;padding-bottom:12px;border-bottom:1px solid #eee}
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.info-item{display:flex;flex-direction:column;gap:4px}
.info-label{font-size:12px;color:#aaa}
.info-value{font-size:14px;color:#333}
.license-key{font-family:monospace;font-size:16px;font-weight:700;color:#0f3460;letter-spacing:1px}
.status-tag{display:inline-block;padding:2px 10px;border-radius:12px;font-size:12px;width:fit-content}
.status-active{background:#e8f5e9;color:#2e7d32}
.status-revoked{background:#ffebee;color:#c62828}
.status-expired{background:#fff3e0;color:#e65100}
.empty-hint{text-align:center;color:#aaa;padding:20px}
.instance-item{padding:16px;background:#f8f9fa;border-radius:8px;margin-bottom:12px}
.instance-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
.instance-name{font-size:15px;font-weight:600}
.instance-info{display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:12px;color:#888}
.audit-item{display:flex;align-items:center;gap:16px;padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:13px}
.audit-action{font-weight:600;color:#0f3460;min-width:100px}
.audit-time{color:#888}
</style>
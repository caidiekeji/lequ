<template>
  <div class="page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">← 返回</button>
      <h1>授权详情</h1>
    </div>

    <div v-if="loading" class="loading">加载中...</div>

    <template v-else-if="license">
      <div class="detail-grid">
        <div class="detail-card">
          <h3>授权信息</h3>
          <div class="info-row"><span class="label">授权码</span><span class="value mono">{{ license.license_key }}</span></div>
          <div class="info-row"><span class="label">版本</span><span class="value">{{ editionText(license.product_edition) }}</span></div>
          <div class="info-row"><span class="label">状态</span><span :class="['status-badge', license.status]">{{ statusText(license.status) }}</span></div>
          <div class="info-row"><span class="label">门店数</span><span class="value">{{ license.max_stores }}</span></div>
          <div class="info-row"><span class="label">终端数</span><span class="value">{{ license.max_terminals }}</span></div>
          <div class="info-row"><span class="label">有效期</span><span class="value">{{ formatDate(license.valid_from) }} ~ {{ formatDate(license.valid_until) }}</span></div>
          <div class="info-row"><span class="label">创建时间</span><span class="value">{{ formatDateTime(license.created_at) }}</span></div>
        </div>
        <div class="detail-card">
          <h3>客户信息</h3>
          <div class="info-row"><span class="label">客户名称</span><span class="value">{{ license.customer_name || '-' }}</span></div>
          <div class="info-row"><span class="label">联系方式</span><span class="value">{{ license.customer_contact || '-' }}</span></div>
          <div class="info-row"><span class="label">备注</span><span class="value">{{ license.note || '-' }}</span></div>
        </div>
      </div>

      <div style="margin-top:24px">
        <h3 style="font-size:16px;font-weight:700;margin-bottom:12px">激活实例</h3>
        <div class="table-container">
          <table class="data-table">
            <thead><tr><th>门店</th><th>实例 ID</th><th>激活时间</th><th>最后心跳</th><th>状态</th></tr></thead>
            <tbody>
              <tr v-for="inst in license.instances" :key="inst.id">
                <td>{{ inst.store_name }}</td>
                <td class="mono">{{ inst.instance_id?.substring(0, 8) }}...</td>
                <td>{{ formatDateTime(inst.activated_at) }}</td>
                <td>{{ formatDateTime(inst.last_heartbeat) }}</td>
                <td><span :class="['status-badge', inst.status]">{{ inst.status === 'active' ? '活跃' : '已吊销' }}</span></td>
              </tr>
            </tbody>
          </table>
          <div v-if="!license.instances?.length" class="empty-state">暂无激活实例</div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import request from '@/api/request'

const route = useRoute()
const license = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await request.get(`/licenses/${route.params.id}`)
    license.value = res.data
  } catch (e) { console.error(e) }
  finally { loading.value = false }
})

function formatDate(d) { return d ? new Date(d).toLocaleDateString('zh-CN') : '-' }
function formatDateTime(d) { return d ? new Date(d).toLocaleString('zh-CN') : '-' }
function editionText(c) { return { basic: '基础版', pro: '专业版', enterprise: '企业版' }[c] || c }
function statusText(s) { return { active: '活跃', expired: '过期', revoked: '已吊销' }[s] || s }
</script>

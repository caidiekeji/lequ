<template>
  <div class="page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">← 返回</button>
      <h1>用户详情</h1>
    </div>
    <div v-if="loading" class="loading">加载中...</div>
    <template v-else-if="user">
      <div class="detail-grid">
        <div class="detail-card">
          <h3>用户信息</h3>
          <div class="info-row"><span class="label">昵称</span><span class="value">{{ user.nickname || '-' }}</span></div>
          <div class="info-row"><span class="label">邮箱</span><span class="value">{{ user.email }}</span></div>
          <div class="info-row"><span class="label">手机</span><span class="value">{{ user.phone || '-' }}</span></div>
          <div class="info-row"><span class="label">公司</span><span class="value">{{ user.company || '-' }}</span></div>
          <div class="info-row"><span class="label">标签</span><span class="value">
            <span v-for="t in user.tags" :key="t" class="tag">{{ t }}</span>
            <span v-if="!user.tags?.length">-</span>
          </span></div>
          <div class="info-row"><span class="label">注册时间</span><span class="value">{{ formatDateTime(user.created_at) }}</span></div>
          <div class="info-row"><span class="label">最后登录</span><span class="value">{{ formatDateTime(user.last_login) || '-' }}</span></div>
        </div>
        <div class="detail-card">
          <h3>授权列表</h3>
          <div v-for="lic in user.licenses" :key="lic.id" class="info-row">
            <router-link :to="`/licenses/${lic.id}`" class="value mono link" style="text-decoration:none">{{ lic.license_key }}</router-link>
            <span :class="['status-badge', lic.status]">{{ lic.status === 'active' ? '活跃' : lic.status }}</span>
          </div>
          <div v-if="!user.licenses?.length" class="empty-state" style="padding:20px">暂无授权</div>
        </div>
      </div>

      <div style="margin-top:24px">
        <h3 style="font-size:16px;font-weight:700;margin-bottom:12px">最近订单</h3>
        <div class="table-container">
          <table class="data-table">
            <thead><tr><th>订单号</th><th>套餐</th><th>金额</th><th>状态</th><th>支付方式</th><th>时间</th></tr></thead>
            <tbody>
              <tr v-for="o in user.orders" :key="o.id">
                <td class="mono">{{ o.order_no }}</td>
                <td>{{ o.plan_name }}</td>
                <td class="price">¥{{ (o.amount/100).toFixed(2) }}</td>
                <td><span :class="['status-badge', o.status]">{{ {pending:'待支付',paid:'已支付',cancelled:'已取消'}[o.status] }}</span></td>
                <td>{{ paymentMethodText(o.payment_method) }}</td>
                <td>{{ formatDate(o.created_at) }}</td>
              </tr>
            </tbody>
          </table>
          <div v-if="!user.orders?.length" class="empty-state">暂无订单</div>
        </div>
      </div>

      <div style="margin-top:24px">
        <h3 style="font-size:16px;font-weight:700;margin-bottom:12px">操作日志</h3>
        <div class="detail-card">
          <div v-for="log in user.operation_logs" :key="log.id" class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <div class="timeline-header">
                <span class="timeline-action">{{ log.action }}</span>
                <span class="timeline-time">{{ formatDateTime(log.created_at) }}</span>
              </div>
              <div class="timeline-detail">{{ log.detail || '-' }}</div>
            </div>
          </div>
          <div v-if="!user.operation_logs?.length" class="empty-state">暂无操作日志</div>
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
const user = ref(null)
const loading = ref(true)

onMounted(async () => {
  try { const r = await request.get(`/admin/users/${route.params.id}`); user.value = r.data }
  catch (e) { console.error(e) }
  finally { loading.value = false }
})

function formatDate(d) { return d ? new Date(d).toLocaleDateString('zh-CN') : '-' }
function formatDateTime(d) { return d ? new Date(d).toLocaleString('zh-CN') : '-' }
function paymentMethodText(m) { return { wechat: '微信', alipay: '支付宝', unionpay: '云闪付', manual: '手动' }[m] || '-' }
</script>

<style scoped>
.tag {
  display: inline-block;
  padding: 2px 8px;
  background: #eff6ff;
  color: #2563eb;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  margin-right: 4px;
}

.timeline-item {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}

.timeline-item:last-child { border-bottom: none; }

.timeline-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2563eb;
  flex-shrink: 0;
  margin-top: 6px;
}

.timeline-content { flex: 1; }

.timeline-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2px;
}

.timeline-action {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
}

.timeline-time {
  font-size: 12px;
  color: #94a3b8;
}

.timeline-detail {
  font-size: 13px;
  color: #64748b;
}
</style>

<template>
  <div class="page">
    <div class="page-header" style="justify-content:space-between">
      <h1>授权管理</h1>
      <div class="header-actions">
        <input v-model="search" type="text" placeholder="搜索授权码..." class="search-input" />
        <select v-model="statusFilter" class="filter-select">
          <option value="">全部状态</option>
          <option value="active">活跃</option>
          <option value="expired">过期</option>
          <option value="revoked">已吊销</option>
        </select>
        <router-link to="/licenses/create" class="btn-primary" style="text-decoration:none">创建授权</router-link>
      </div>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>授权码</th>
            <th>版本</th>
            <th>门店数</th>
            <th>到期时间</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="lic in filteredLicenses" :key="lic.id">
            <td class="mono">{{ lic.license_key }}</td>
            <td>{{ editionText(lic.product_edition) }}</td>
            <td>{{ lic.max_stores }}</td>
            <td>{{ formatDate(lic.valid_until) }}</td>
            <td>
              <span :class="['status-badge', lic.status]">{{ statusText(lic.status) }}</span>
            </td>
            <td>
              <button class="btn-link" @click="viewLicense(lic.id)">详情</button>
              <button v-if="lic.status === 'active'" class="btn-link danger" @click="revokeLicense(lic)">吊销</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="filteredLicenses.length === 0" class="empty-state">暂无授权数据</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/api/request'

const router = useRouter()
const licenses = ref([])
const search = ref('')
const statusFilter = ref('')

const filteredLicenses = computed(() => {
  return licenses.value.filter(lic => {
    const matchSearch = !search.value || lic.license_key?.includes(search.value)
    const matchStatus = !statusFilter.value || lic.status === statusFilter.value
    return matchSearch && matchStatus
  })
})

onMounted(() => { fetchLicenses() })

async function fetchLicenses() {
  try {
    const res = await request.get('/licenses')
    licenses.value = res.data?.list || []
  } catch (e) {
    console.error(e)
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

function editionText(code) {
  const map = { basic: '基础版', pro: '专业版', enterprise: '企业版' }
  return map[code] || code
}

function statusText(status) {
  const map = { active: '活跃', expired: '过期', revoked: '已吊销' }
  return map[status] || status
}

function viewLicense(id) { router.push(`/licenses/${id}`) }

async function revokeLicense(lic) {
  if (!confirm(`确认吊销授权码 ${lic.license_key}？`)) return
  try {
    await request.post(`/licenses/${lic.id}/revoke`)
    alert('已吊销')
    fetchLicenses()
  } catch (e) {
    alert(e.message)
  }
}
</script>

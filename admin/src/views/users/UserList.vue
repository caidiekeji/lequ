<template>
  <div class="page">
    <div class="page-header" style="justify-content:space-between">
      <h1>用户管理</h1>
      <div class="header-actions">
        <button class="btn-secondary" @click="exportUsers">导出</button>
        <input v-model="search" type="text" placeholder="搜索用户..." class="search-input" @keyup.enter="fetchUsers" />
        <select v-model="statusFilter" class="filter-select" @change="fetchUsers">
          <option value="">全部状态</option>
          <option value="active">正常</option>
          <option value="disabled">禁用</option>
        </select>
      </div>
    </div>

    <div v-if="selectedIds.length" class="batch-bar">
      已选 {{ selectedIds.length }} 项
      <button class="btn-primary" @click="batchOp('enable')">批量启用</button>
      <button class="btn-cancel" @click="batchOp('disable')">批量禁用</button>
      <button class="btn-secondary" @click="selectedIds = []">取消选择</button>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th><input type="checkbox" v-model="selectAll" @change="toggleAll" /></th>
            <th>用户</th>
            <th>邮箱</th>
            <th>手机号</th>
            <th>公司</th>
            <th>注册时间</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td><input type="checkbox" :value="user.id" v-model="selectedIds" /></td>
            <td>
              <div class="user-cell">
                <div class="user-avatar">{{ user.nickname?.charAt(0) || user.email?.charAt(0) }}</div>
                <span>{{ user.nickname || user.email?.split('@')[0] }}</span>
              </div>
            </td>
            <td>{{ user.email }}</td>
            <td>{{ user.phone || '-' }}</td>
            <td>{{ user.company || '-' }}</td>
            <td>{{ formatDate(user.created_at) }}</td>
            <td>
              <span :class="['status-badge', user.status === 'active' ? 'active' : 'expired']">{{ user.status === 'active' ? '正常' : '禁用' }}</span>
            </td>
            <td>
              <button class="btn-link" @click="viewUser(user.id)">详情</button>
              <button class="btn-link" @click="toggleUser(user)">{{ user.status === 'active' ? '禁用' : '启用' }}</button>
              <button class="btn-link" @click="resetPwd(user)">重置密码</button>
              <button class="btn-link" @click="showTagEditor(user)">标签</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="users.length === 0" class="empty-state">暂无用户数据</div>
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <button class="btn-secondary" :disabled="page <= 1" @click="page--">上一页</button>
      <span class="page-info">第 {{ page }} / {{ totalPages }} 页（共 {{ total }} 条）</span>
      <button class="btn-secondary" :disabled="page >= totalPages" @click="page++">下一页</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import usersApi from '@/api/users'

const router = useRouter()
const users = ref([])
const search = ref('')
const statusFilter = ref('')
const page = ref(1)
const totalPages = ref(1)
const total = ref(0)
const pageSize = 20
const selectedIds = ref([])
const selectAll = ref(false)

onMounted(() => { fetchUsers() })
watch(page, () => { fetchUsers() })

async function fetchUsers() {
  try {
    const params = { page: page.value, page_size: pageSize }
    if (search.value) params.keyword = search.value
    if (statusFilter.value) params.status = statusFilter.value
    const res = await usersApi.list(params)
    users.value = res.data?.list || []
    total.value = res.data?.total || 0
    totalPages.value = Math.ceil(total.value / pageSize) || 1
    selectedIds.value = []
    selectAll.value = false
  } catch (e) {
    console.error(e)
  }
}

function toggleAll() {
  selectedIds.value = selectAll.value ? users.value.map(u => u.id) : []
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

function viewUser(id) {
  router.push(`/users/${id}`)
}

async function toggleUser(user) {
  const newStatus = user.status === 'active' ? 'disabled' : 'active'
  try {
    await usersApi.updateStatus(user.id, newStatus)
    fetchUsers()
  } catch (e) { alert(e.message) }
}

async function resetPwd(user) {
  if (!confirm(`确认重置用户 ${user.email} 的密码？`)) return
  try {
    const r = await usersApi.resetPassword(user.id)
    alert(`密码已重置为: ${r.data?.password || '请查看返回数据'}`)
  } catch (e) { alert(e.message) }
}

function showTagEditor(user) {
  const tags = prompt('请输入标签（逗号分隔）：', (user.tags || []).join(','))
  if (tags !== null) {
    usersApi.setTags(user.id, { tags: tags.split(',').map(t => t.trim()).filter(Boolean) })
      .then(() => fetchUsers())
      .catch(e => alert(e.message))
  }
}

async function batchOp(action) {
  if (!selectedIds.value.length) { alert('请先选择用户'); return }
  const msg = action === 'enable' ? '批量启用' : '批量禁用'
  if (!confirm(`确认${msg} ${selectedIds.value.length} 个用户？`)) return
  try {
    await usersApi.batchOp({ user_ids: selectedIds.value, action })
    fetchUsers()
  } catch (e) { alert(e.message) }
}

async function exportUsers() {
  try {
    const r = await usersApi.export({})
    const url = window.URL.createObjectURL(new Blob([JSON.stringify(r.data)]))
    const a = document.createElement('a')
    a.href = url
    a.download = `users_${Date.now()}.json`
    a.click()
    window.URL.revokeObjectURL(url)
  } catch (e) { alert(e.message) }
}
</script>

<style scoped>
.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.batch-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 10px;
  margin-bottom: 16px;
  font-size: 14px;
  color: #1e40af;
  font-weight: 500;
}

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

<template>
  <div class="page">
    <div class="page-header" style="justify-content:space-between">
      <h1>角色权限管理</h1>
      <button class="btn-primary" @click="showCreate = true">创建角色</button>
    </div>

    <div v-if="showCreate" class="form-card" style="margin-bottom:24px">
      <h3>{{ editingRole ? '编辑角色' : '创建角色' }}</h3>
      <form @submit.prevent="saveRole">
        <div class="form-group"><label>角色名称</label><input v-model="form.name" required placeholder="如：运营专员" /></div>
        <div class="form-group"><label>角色编码</label><input v-model="form.code" required :disabled="!!editingRole" placeholder="如：operator" /></div>
        <div class="form-group"><label>描述</label><textarea v-model="form.description" rows="2" placeholder="选填"></textarea></div>
        <div style="margin:20px 0 12px">
          <h4 style="font-size:14px;font-weight:700;color:#0f172a;margin-bottom:12px">权限设置</h4>
          <div v-for="group in permissionGroups" :key="group.key" class="perm-group">
            <div class="perm-group-header">
              <label class="perm-group-label">{{ group.label }}</label>
              <button type="button" class="btn-link" @click="toggleGroup(group)">{{ isGroupAllSelected(group) ? '取消全选' : '全选' }}</button>
            </div>
            <div class="perm-checkboxes">
              <label v-for="perm in group.permissions" :key="perm.code" class="perm-checkbox">
                <input type="checkbox" :value="perm.code" v-model="form.permissions" />
                <span>{{ perm.label }}</span>
              </label>
            </div>
          </div>
        </div>
        <div class="action-row">
          <button type="submit" class="btn-primary" :disabled="submitting">{{ submitting ? '保存中...' : '保存' }}</button>
          <button type="button" class="btn-secondary" @click="cancelEdit">取消</button>
        </div>
      </form>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead><tr><th>角色名称</th><th>编码</th><th>描述</th><th>权限数</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="role in roles" :key="role.id">
            <td style="font-weight:600">{{ role.name }}</td>
            <td class="mono">{{ role.code }}</td>
            <td>{{ role.description || '-' }}</td>
            <td>{{ (role.permissions || []).length }}</td>
            <td>
              <button class="btn-link" @click="editRole(role)">编辑</button>
              <button v-if="role.code !== 'super_admin'" class="btn-link danger" @click="deleteRole(role)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import settingsApi from '@/api/settings'

const roles = ref([])
const showCreate = ref(false)
const editingRole = ref(null)
const submitting = ref(false)
const form = ref({ name: '', code: '', description: '', permissions: [] })

const permissionGroups = [
  {
    key: 'dashboard', label: '仪表盘',
    permissions: [
      { code: 'dashboard:view', label: '查看仪表盘' },
    ],
  },
  {
    key: 'users', label: '用户管理',
    permissions: [
      { code: 'users:list', label: '查看用户' },
      { code: 'users:detail', label: '查看详情' },
      { code: 'users:edit', label: '编辑用户' },
      { code: 'users:delete', label: '删除用户' },
    ],
  },
  {
    key: 'licenses', label: '授权管理',
    permissions: [
      { code: 'licenses:list', label: '查看授权' },
      { code: 'licenses:create', label: '创建授权' },
      { code: 'licenses:revoke', label: '吊销授权' },
      { code: 'licenses:edit', label: '编辑授权' },
    ],
  },
  {
    key: 'orders', label: '订单管理',
    permissions: [
      { code: 'orders:list', label: '查看订单' },
      { code: 'orders:detail', label: '查看详情' },
      { code: 'orders:confirm', label: '确认收款' },
      { code: 'orders:refund', label: '退款处理' },
      { code: 'orders:edit', label: '改价' },
    ],
  },
  {
    key: 'plans', label: '套餐管理',
    permissions: [
      { code: 'plans:list', label: '查看套餐' },
      { code: 'plans:create', label: '创建套餐' },
      { code: 'plans:edit', label: '编辑套餐' },
      { code: 'plans:delete', label: '删除套餐' },
    ],
  },
  {
    key: 'operations', label: '运营管理',
    permissions: [
      { code: 'notices:manage', label: '管理公告' },
      { code: 'templates:manage', label: '管理通知模板' },
      { code: 'tickets:manage', label: '管理工单' },
    ],
  },
  {
    key: 'channel', label: '渠道管理',
    permissions: [
      { code: 'channels:list', label: '查看渠道' },
      { code: 'channels:edit', label: '编辑渠道' },
      { code: 'commissions:list', label: '查看佣金' },
      { code: 'commissions:settle', label: '结算佣金' },
    ],
  },
  {
    key: 'settings', label: '系统设置',
    permissions: [
      { code: 'admins:manage', label: '管理员管理' },
      { code: 'roles:manage', label: '角色管理' },
      { code: 'config:manage', label: '系统配置' },
      { code: 'payment:manage', label: '支付配置' },
    ],
  },
  {
    key: 'logs', label: '日志查看',
    permissions: [
      { code: 'logs:view', label: '查看操作日志' },
      { code: 'logs:login', label: '查看登录日志' },
    ],
  },
]

onMounted(() => { fetchRoles() })

async function fetchRoles() {
  try { const r = await settingsApi.roles(); roles.value = r.data || [] }
  catch (e) { console.error(e) }
}

function isGroupAllSelected(group) {
  return group.permissions.every(p => form.value.permissions.includes(p.code))
}

function toggleGroup(group) {
  const codes = group.permissions.map(p => p.code)
  if (isGroupAllSelected(group)) {
    form.value.permissions = form.value.permissions.filter(c => !codes.includes(c))
  } else {
    const existing = new Set(form.value.permissions)
    codes.forEach(c => existing.add(c))
    form.value.permissions = Array.from(existing)
  }
}

function editRole(role) {
  editingRole.value = role
  form.value = { name: role.name, code: role.code, description: role.description || '', permissions: [...(role.permissions || [])] }
  showCreate.value = true
}

function cancelEdit() {
  showCreate.value = false
  editingRole.value = null
  form.value = { name: '', code: '', description: '', permissions: [] }
}

async function saveRole() {
  submitting.value = true
  try {
    if (editingRole.value) await settingsApi.updateRole(editingRole.value.id, form.value)
    else await settingsApi.createRole(form.value)
    cancelEdit()
    fetchRoles()
  } catch (e) { alert(e.message) }
  finally { submitting.value = false }
}

async function deleteRole(role) {
  if (!confirm(`确认删除角色 ${role.name}？`)) return
  try { await settingsApi.deleteRole(role.id); fetchRoles() }
  catch (e) { alert(e.message) }
}
</script>

<style scoped>
.perm-group {
  margin-bottom: 16px;
  padding: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.perm-group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.perm-group-label {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}

.perm-checkboxes {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.perm-checkbox {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 13px;
  color: #334155;
  cursor: pointer;
  transition: all 0.2s;
}

.perm-checkbox:hover {
  border-color: #2563eb;
  background: #eff6ff;
}

.perm-checkbox input {
  accent-color: #2563eb;
}
</style>

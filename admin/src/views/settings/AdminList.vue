<template>
  <div class="page">
    <div class="page-header" style="justify-content:space-between">
      <h1>管理员管理</h1>
      <button class="btn-primary" @click="showAdd = !showAdd">{{ showAdd ? '取消' : '添加管理员' }}</button>
    </div>

    <div v-if="showAdd" class="form-card" style="margin-bottom:24px">
      <h3>添加管理员</h3>
      <form @submit.prevent="addAdmin">
        <div class="form-group"><label>用户名</label><input v-model="newAdmin.username" required placeholder="用户名" /></div>
        <div class="form-group"><label>密码</label><input v-model="newAdmin.password" type="password" required placeholder="密码" /></div>
        <div class="form-group"><label>角色</label>
          <select v-model="newAdmin.role">
            <option value="admin">管理员</option>
            <option value="super_admin">超级管理员</option>
          </select>
        </div>
        <div class="action-row"><button type="submit" class="btn-primary">创建</button></div>
      </form>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead><tr><th>用户名</th><th>角色</th><th>状态</th><th>最后登录</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="a in admins" :key="a.id">
            <td style="font-weight:600">{{ a.username }}</td>
            <td>{{ a.role === 'super_admin' ? '超级管理员' : '管理员' }}</td>
            <td><span :class="['status-badge', a.status]">{{ a.status === 'active' ? '正常' : '禁用' }}</span></td>
            <td>{{ a.last_login ? new Date(a.last_login).toLocaleString('zh-CN') : '-' }}</td>
            <td>
              <button v-if="a.role !== 'super_admin'" class="btn-link danger" @click="deleteAdmin(a)">删除</button>
              <span v-else style="color:#94a3b8;font-size:13px">-</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '@/api/request'

const admins = ref([])
const showAdd = ref(false)
const newAdmin = ref({ username: '', password: '', role: 'admin' })

onMounted(() => { fetchAdmins() })

async function fetchAdmins() {
  try { const r = await request.get('/admin/admins'); admins.value = r.data || [] }
  catch (e) { console.error(e) }
}

async function addAdmin() {
  try {
    await request.post('/admin/admins', newAdmin.value)
    showAdd.value = false
    newAdmin.value = { username: '', password: '', role: 'admin' }
    fetchAdmins()
  } catch (e) { alert(e.message) }
}

async function deleteAdmin(a) {
  if (!confirm(`确认删除管理员 ${a.username}？`)) return
  try { await request.delete(`/admin/admins/${a.id}`); fetchAdmins() }
  catch (e) { alert(e.message) }
}
</script>

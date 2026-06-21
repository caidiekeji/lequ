<template>
  <div class="page">
    <div class="page-header" style="justify-content:space-between">
      <h1>公告管理</h1>
      <button class="btn-primary" @click="showForm = true">发布公告</button>
    </div>

    <div v-if="showForm" class="form-card" style="margin-bottom:24px">
      <h3>{{ editingNotice ? '编辑公告' : '发布公告' }}</h3>
      <form @submit.prevent="saveNotice">
        <div class="form-group"><label>标题</label><input v-model="form.title" required placeholder="公告标题" /></div>
        <div class="form-group"><label>内容</label><textarea v-model="form.content" rows="4" required placeholder="公告内容"></textarea></div>
        <div class="form-group">
          <label>类型</label>
          <select v-model="form.type">
            <option value="info">普通</option>
            <option value="warning">警告</option>
            <option value="important">重要</option>
          </select>
        </div>
        <div class="form-group">
          <label class="toggle">
            <input type="checkbox" v-model="form.active" />
            <span class="toggle-slider"></span>
            <span class="toggle-label">启用</span>
          </label>
        </div>
        <div class="action-row">
          <button type="submit" class="btn-primary" :disabled="submitting">{{ submitting ? '保存中...' : '保存' }}</button>
          <button type="button" class="btn-secondary" @click="cancelForm">取消</button>
        </div>
      </form>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead><tr><th>标题</th><th>类型</th><th>状态</th><th>创建时间</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="n in notices" :key="n.id">
            <td style="font-weight:600">{{ n.title }}</td>
            <td><span :class="['status-badge', noticeTypeClass(n.type)]">{{ noticeTypeText(n.type) }}</span></td>
            <td><span :class="['status-badge', n.active ? 'active' : '']">{{ n.active ? '启用' : '停用' }}</span></td>
            <td>{{ formatDate(n.created_at) }}</td>
            <td>
              <button class="btn-link" @click="editNotice(n)">编辑</button>
              <button class="btn-link" @click="toggleNotice(n)">{{ n.active ? '停用' : '启用' }}</button>
              <button class="btn-link danger" @click="deleteNotice(n)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import operationsApi from '@/api/operations'

const notices = ref([])
const showForm = ref(false)
const editingNotice = ref(null)
const submitting = ref(false)
const form = ref({ title: '', content: '', type: 'info', active: true })

onMounted(() => { fetchNotices() })

async function fetchNotices() {
  try { const r = await operationsApi.notices(); notices.value = r.data || [] }
  catch (e) { console.error(e) }
}

function editNotice(n) {
  editingNotice.value = n
  form.value = { title: n.title, content: n.content, type: n.type || 'info', active: n.active }
  showForm.value = true
}

function cancelForm() {
  showForm.value = false
  editingNotice.value = null
  form.value = { title: '', content: '', type: 'info', active: true }
}

async function saveNotice() {
  submitting.value = true
  try {
    if (editingNotice.value) await operationsApi.updateNotice(editingNotice.value.id, form.value)
    else await operationsApi.createNotice(form.value)
    cancelForm()
    fetchNotices()
  } catch (e) { alert(e.message) }
  finally { submitting.value = false }
}

async function toggleNotice(n) {
  try { await operationsApi.toggleNotice(n.id); fetchNotices() }
  catch (e) { alert(e.message) }
}

async function deleteNotice(n) {
  if (!confirm(`确认删除公告「${n.title}」？`)) return
  try { await operationsApi.deleteNotice(n.id); fetchNotices() }
  catch (e) { alert(e.message) }
}

function formatDate(d) { return d ? new Date(d).toLocaleDateString('zh-CN') : '-' }
function noticeTypeClass(t) { return { info: 'pending', warning: 'pending', important: 'expired' }[t] || '' }
function noticeTypeText(t) { return { info: '普通', warning: '警告', important: '重要' }[t] || t }
</script>

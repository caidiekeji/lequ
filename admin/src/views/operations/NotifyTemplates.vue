<template>
  <div class="page">
    <div class="page-header" style="justify-content:space-between">
      <h1>通知模板</h1>
      <button class="btn-primary" @click="showForm = true">添加模板</button>
    </div>

    <div v-if="showForm" class="form-card" style="margin-bottom:24px">
      <h3>{{ editingTemplate ? '编辑模板' : '添加模板' }}</h3>
      <form @submit.prevent="saveTemplate">
        <div class="form-group"><label>模板名称</label><input v-model="form.name" required placeholder="如：订单支付成功通知" /></div>
        <div class="form-group"><label>模板编码</label><input v-model="form.code" required :disabled="!!editingTemplate" placeholder="如：order_paid" /></div>
        <div class="form-group"><label>通知渠道</label>
          <select v-model="form.channel" required>
            <option value="email">邮件</option>
            <option value="sms">短信</option>
            <option value="webhook">Webhook</option>
          </select>
        </div>
        <div class="form-group"><label>模板内容</label><textarea v-model="form.content" rows="5" required placeholder="支持 {{变量}} 语法"></textarea></div>
        <div class="form-group"><label>描述</label><input v-model="form.description" type="text" placeholder="选填" /></div>
        <div class="action-row">
          <button type="submit" class="btn-primary" :disabled="submitting">{{ submitting ? '保存中...' : '保存' }}</button>
          <button type="button" class="btn-secondary" @click="cancelForm">取消</button>
        </div>
      </form>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead><tr><th>名称</th><th>编码</th><th>渠道</th><th>描述</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="t in templates" :key="t.id">
            <td style="font-weight:600">{{ t.name }}</td>
            <td class="mono">{{ t.code }}</td>
            <td>{{ channelText(t.channel) }}</td>
            <td>{{ t.description || '-' }}</td>
            <td>
              <button class="btn-link" @click="editTemplate(t)">编辑</button>
              <button class="btn-link danger" @click="deleteTemplate(t)">删除</button>
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

const templates = ref([])
const showForm = ref(false)
const editingTemplate = ref(null)
const submitting = ref(false)
const form = ref({ name: '', code: '', channel: 'email', content: '', description: '' })

onMounted(() => { fetchTemplates() })

async function fetchTemplates() {
  try { const r = await operationsApi.notifyTemplates(); templates.value = r.data || [] }
  catch (e) { console.error(e) }
}

function editTemplate(t) {
  editingTemplate.value = t
  form.value = { name: t.name, code: t.code, channel: t.channel, content: t.content, description: t.description || '' }
  showForm.value = true
}

function cancelForm() {
  showForm.value = false
  editingTemplate.value = null
  form.value = { name: '', code: '', channel: 'email', content: '', description: '' }
}

async function saveTemplate() {
  submitting.value = true
  try {
    if (editingTemplate.value) await operationsApi.updateNotifyTemplate(editingTemplate.value.id, form.value)
    else await operationsApi.createNotifyTemplate(form.value)
    cancelForm()
    fetchTemplates()
  } catch (e) { alert(e.message) }
  finally { submitting.value = false }
}

async function deleteTemplate(t) {
  if (!confirm(`确认删除模板「${t.name}」？`)) return
  try { await operationsApi.deleteNotifyTemplate(t.id); fetchTemplates() }
  catch (e) { alert(e.message) }
}

function channelText(c) { return { email: '邮件', sms: '短信', webhook: 'Webhook' }[c] || c }
</script>

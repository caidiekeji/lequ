<template>
  <div class="page">
    <div class="page-header" style="justify-content:space-between">
      <h1>渠道商管理</h1>
      <button class="btn-primary" @click="showForm = true">添加渠道商</button>
    </div>

    <div v-if="showForm" class="form-card" style="margin-bottom:24px">
      <h3>{{ editingChannel ? '编辑渠道商' : '添加渠道商' }}</h3>
      <form @submit.prevent="saveChannel">
        <div class="form-group"><label>名称</label><input v-model="form.name" required placeholder="渠道商名称" /></div>
        <div class="form-group"><label>联系人</label><input v-model="form.contact_name" placeholder="联系人" /></div>
        <div class="form-group"><label>联系电话</label><input v-model="form.contact_phone" placeholder="手机号" /></div>
        <div class="form-group"><label>佣金比例 (%)</label><input v-model.number="form.commission_rate" type="number" min="0" max="100" step="0.1" placeholder="0" /></div>
        <div class="form-group"><label>备注</label><textarea v-model="form.remark" rows="2" placeholder="选填"></textarea></div>
        <div class="action-row">
          <button type="submit" class="btn-primary" :disabled="submitting">{{ submitting ? '保存中...' : '保存' }}</button>
          <button type="button" class="btn-secondary" @click="cancelForm">取消</button>
        </div>
      </form>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead><tr><th>名称</th><th>联系人</th><th>电话</th><th>佣金比例</th><th>累计佣金</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="c in channels" :key="c.id">
            <td style="font-weight:600">{{ c.name }}</td>
            <td>{{ c.contact_name || '-' }}</td>
            <td>{{ c.contact_phone || '-' }}</td>
            <td>{{ c.commission_rate ?? 0 }}%</td>
            <td class="price">¥{{ formatPrice(c.total_commission) }}</td>
            <td><span :class="['status-badge', c.status === 'active' ? 'active' : '']">{{ c.status === 'active' ? '启用' : '停用' }}</span></td>
            <td>
              <button class="btn-link" @click="editChannel(c)">编辑</button>
              <button class="btn-link" @click="toggleChannel(c)">{{ c.status === 'active' ? '停用' : '启用' }}</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import channelsApi from '@/api/channels'

const channels = ref([])
const showForm = ref(false)
const editingChannel = ref(null)
const submitting = ref(false)
const form = ref({ name: '', contact_name: '', contact_phone: '', commission_rate: 0, remark: '' })

onMounted(() => { fetchChannels() })

async function fetchChannels() {
  try { const r = await channelsApi.list(); channels.value = r.data || [] }
  catch (e) { console.error(e) }
}

function editChannel(c) {
  editingChannel.value = c
  form.value = { name: c.name, contact_name: c.contact_name || '', contact_phone: c.contact_phone || '', commission_rate: c.commission_rate || 0, remark: c.remark || '' }
  showForm.value = true
}

function cancelForm() {
  showForm.value = false
  editingChannel.value = null
  form.value = { name: '', contact_name: '', contact_phone: '', commission_rate: 0, remark: '' }
}

async function saveChannel() {
  submitting.value = true
  try {
    if (editingChannel.value) await channelsApi.update(editingChannel.value.id, form.value)
    else await channelsApi.create(form.value)
    cancelForm()
    fetchChannels()
  } catch (e) { alert(e.message) }
  finally { submitting.value = false }
}

async function toggleChannel(c) {
  const newStatus = c.status === 'active' ? 'disabled' : 'active'
  try { await channelsApi.updateStatus(c.id, newStatus); fetchChannels() }
  catch (e) { alert(e.message) }
}

function formatPrice(amount) { return ((amount || 0) / 100).toFixed(2) }
</script>

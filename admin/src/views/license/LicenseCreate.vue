<template>
  <div class="page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">← 返回</button>
      <h1>创建授权</h1>
    </div>
    <div class="form-card">
      <form @submit.prevent="createLicense">
        <div class="form-group">
          <label>产品版本</label>
          <select v-model="form.product_edition" required>
            <option value="basic">基础版</option>
            <option value="pro">专业版</option>
            <option value="enterprise">企业版</option>
          </select>
        </div>
        <div class="form-group">
          <label>有效天数</label>
          <input v-model.number="form.valid_days" type="number" min="1" required placeholder="365" />
        </div>
        <div class="form-group">
          <label>客户名称</label>
          <input v-model="form.customer_name" type="text" placeholder="选填" />
        </div>
        <div class="form-group">
          <label>客户联系方式</label>
          <input v-model="form.customer_contact" type="text" placeholder="选填" />
        </div>
        <div class="form-group">
          <label>备注</label>
          <textarea v-model="form.note" rows="3" placeholder="选填"></textarea>
        </div>
        <div class="action-row">
          <button type="submit" class="btn-primary" :disabled="submitting">{{ submitting ? '创建中...' : '创建授权' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/api/request'

const router = useRouter()
const submitting = ref(false)
const form = ref({ product_edition: 'basic', valid_days: 365, customer_name: '', customer_contact: '', note: '' })

async function createLicense() {
  submitting.value = true
  try {
    await request.post('/licenses', form.value)
    alert('授权码创建成功')
    router.push('/licenses')
  } catch (e) { alert(e.message) }
  finally { submitting.value = false }
}
</script>

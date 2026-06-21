<template>
  <div class="page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">← 返回</button>
      <h1>{{ isEdit ? '编辑套餐' : '创建套餐' }}</h1>
    </div>
    <div class="form-card">
      <form @submit.prevent="savePlan">
        <div class="form-group"><label>套餐名称</label><input v-model="form.name" required placeholder="基础版" /></div>
        <div class="form-group"><label>编码</label><input v-model="form.code" required :disabled="isEdit" placeholder="basic" /></div>
        <div class="form-group"><label>价格（分）</label><input v-model.number="form.price" type="number" required placeholder="9900" /></div>
        <div class="form-group"><label>原价（分）</label><input v-model.number="form.original_price" type="number" placeholder="12900" /></div>
        <div class="form-group"><label>有效天数</label><input v-model.number="form.duration_days" type="number" required placeholder="365" /></div>
        <div class="form-group"><label>最大门店数</label><input v-model.number="form.max_stores" type="number" placeholder="1" /></div>
        <div class="form-group"><label>最大终端数</label><input v-model.number="form.max_terminals" type="number" placeholder="1" /></div>
        <div class="form-group"><label>描述</label><textarea v-model="form.description" rows="3" placeholder="选填"></textarea></div>
        <div class="action-row">
          <button type="submit" class="btn-primary" :disabled="submitting">{{ submitting ? '保存中...' : '保存' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import request from '@/api/request'

const route = useRoute()
const router = useRouter()
const isEdit = computed(() => !!route.params.id)
const submitting = ref(false)
const form = ref({ name: '', code: '', price: 0, original_price: 0, duration_days: 365, max_stores: 1, max_terminals: 1, description: '' })

onMounted(async () => {
  if (isEdit.value) {
    try { const r = await request.get(`/admin/plans/${route.params.id}`); if (r.data) Object.assign(form.value, r.data) }
    catch (e) { console.error(e) }
  }
})

async function savePlan() {
  submitting.value = true
  try {
    if (isEdit.value) await request.put(`/admin/plans/${route.params.id}`, form.value)
    else await request.post('/admin/plans', form.value)
    router.push('/plans')
  } catch (e) { alert(e.message) }
  finally { submitting.value = false }
}
</script>

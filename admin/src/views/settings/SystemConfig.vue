<template>
  <div class="page">
    <h1 style="font-size:24px;font-weight:800;letter-spacing:-0.5px;margin-bottom:24px">系统配置</h1>
    <div class="form-card">
      <form @submit.prevent="saveConfig">
        <div class="form-group"><label>站点名称</label><input v-model="form.site_name" type="text" /></div>
        <div class="form-group"><label>站点描述</label><textarea v-model="form.site_description" rows="3"></textarea></div>
        <div class="form-group"><label>联系邮箱</label><input v-model="form.contact_email" type="email" /></div>
        <div class="form-group"><label>客服电话</label><input v-model="form.contact_phone" type="tel" /></div>
        <div class="form-group"><label>备案号</label><input v-model="form.icp_number" type="text" /></div>
        <div class="action-row"><button type="submit" class="btn-primary">保存配置</button></div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '@/api/request'

const form = ref({ site_name: 'ShouYinPOS', site_description: '专业的店铺收银管理系统', contact_email: '', contact_phone: '', icp_number: '' })

onMounted(async () => {
  try { const r = await request.get('/admin/config'); if (r.data) Object.assign(form.value, r.data) }
  catch (e) { console.error(e) }
})

async function saveConfig() {
  try { await request.put('/admin/config', form.value); alert('配置已保存') }
  catch (e) { alert(e.message) }
}
</script>

<template>
  <div class="page">
    <h1 style="font-size:24px;font-weight:800;letter-spacing:-0.5px;margin-bottom:24px">通知配置</h1>
    <div class="form-card">
      <form @submit.prevent="saveConfig">
        <div class="form-group">
          <label>发件人邮箱</label>
          <input v-model="form.sender_email" type="email" placeholder="noreply@yourdomain.com" />
          <span class="hint">用于发送系统通知的邮箱地址，使用 MailChannels 发送</span>
        </div>
        <div class="form-group">
          <label>发件人名称</label>
          <input v-model="form.sender_name" type="text" placeholder="ShouYinPOS" />
        </div>
        <div class="form-group" style="margin-top:16px;padding-top:16px;border-top:1px solid #f1f5f9">
          <label>SMTP 主机（可选）</label>
          <input v-model="form.smtp_host" type="text" placeholder="smtp.example.com" />
          <span class="hint">留空则使用 MailChannels 免费发信</span>
        </div>
        <div class="form-group">
          <label>SMTP 端口</label>
          <input v-model="form.smtp_port" type="number" placeholder="587" />
        </div>
        <div class="form-group">
          <label>SMTP 用户名</label>
          <input v-model="form.smtp_user" type="text" />
        </div>
        <div class="form-group">
          <label>SMTP 密码</label>
          <input v-model="form.smtp_pass" type="password" />
        </div>
        <div class="form-group" style="margin-top:16px;padding-top:16px;border-top:1px solid #f1f5f9">
          <label>是否启用邮件通知</label>
          <label class="switch">
            <input v-model="form.enabled" type="checkbox" true-value="1" false-value="0" />
            <span class="slider"></span>
          </label>
        </div>
        <div class="form-group" style="display:flex;gap:12px">
          <label>验证令牌（测试发送）</label>
          <input v-model="testEmail" type="email" placeholder="输入测试邮箱" style="flex:1" />
          <button type="button" class="btn-secondary" @click="testSend" :disabled="testing">{{ testing ? '发送中...' : '测试发送' }}</button>
        </div>
        <div class="action-row"><button type="submit" class="btn-primary">保存配置</button></div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '@/api/request'

const form = ref({ sender_email: '', sender_name: 'ShouYinPOS', smtp_host: '', smtp_port: 587, smtp_user: '', smtp_pass: '', enabled: '1' })
const testEmail = ref('')
const testing = ref(false)

onMounted(async () => {
  try {
    const r = await request.get('/admin/config/notify')
    if (r.data) Object.assign(form.value, r.data)
  } catch (e) { console.error(e) }
})

async function saveConfig() {
  try {
    await request.put('/admin/config/notify', form.value)
    alert('通知配置已保存')
  } catch (e) { alert(e.message) }
}

async function testSend() {
  if (!testEmail.value) { alert('请输入测试邮箱'); return }
  testing.value = true
  try {
    const r = await request.post('/admin/config/notify/test', { email: testEmail.value })
    alert(r.message || '测试邮件已发送')
  } catch (e) { alert(e.message || '发送失败') }
  testing.value = false
}
</script>

<style scoped>
.page { max-width: 640px }
.form-card { background: #fff; border-radius: 12px; padding: 28px; box-shadow: 0 1px 3px rgba(0,0,0,.06) }
.form-group { margin-bottom: 20px }
.form-group label { display: block; font-size: 14px; font-weight: 600; color: #0f172a; margin-bottom: 6px }
.form-group input, .form-group textarea {
  width: 100%; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 8px;
  font-size: 14px; background: #fff; transition: border-color 0.2s; box-sizing: border-box
}
.form-group input:focus, .form-group textarea:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,.1) }
.hint { display: block; font-size: 12px; color: #94a3b8; margin-top: 4px }
.action-row { margin-top: 24px }
.btn-primary {
  padding: 10px 24px; background: #0f172a; color: #fff; border: none; border-radius: 8px;
  font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s
}
.btn-primary:hover { background: #1e293b }
.btn-secondary {
  padding: 10px 20px; background: #fff; color: #0f172a; border: 1px solid #e2e8f0; border-radius: 8px;
  font-size: 14px; font-weight: 500; cursor: pointer; white-space: nowrap
}
.btn-secondary:hover { background: #f8fafc; border-color: #cbd5e1 }
.btn-secondary[disabled] { opacity: 0.6; cursor: not-allowed }
.switch { position: relative; display: inline-block; width: 44px; height: 24px; cursor: pointer }
.switch input { position: absolute; opacity: 0; width: 0; height: 0 }
.slider {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: #cbd5e1; border-radius: 12px; transition: 0.3s
}
.slider::before {
  content: ''; position: absolute; width: 18px; height: 18px; left: 3px; bottom: 3px;
  background: #fff; border-radius: 50%; transition: 0.3s
}
.switch input:checked + .slider { background: #2563eb }
.switch input:checked + .slider::before { transform: translateX(20px) }
</style>

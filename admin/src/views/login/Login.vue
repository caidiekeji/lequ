<template>
  <div class="login-page">
    <div class="login-card">
      <h1 class="login-title">授权管理系统</h1>
      <p class="login-subtitle">收银系统许可证管理平台</p>
      <form @submit.prevent="handleLogin">
        <div class="form-group"><label>用户名</label><input v-model="username" type="text" placeholder="请输入用户名" required /></div>
        <div class="form-group"><label>密码</label><input v-model="password" type="password" placeholder="请输入密码" required /></div>
        <p v-if="error" class="error-msg">{{ error }}</p>
        <button type="submit" class="login-btn" :disabled="loading">{{ loading ? '登录中...' : '登录' }}</button>
      </form>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import request from '../../api/request'
const router = useRouter()
const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
async function handleLogin() {
  error.value = ''; loading.value = true
  try {
    const res = await request.post('/auth/login', { username: username.value, password: password.value })
    localStorage.setItem('shouquan_token', res.data.token)
    localStorage.setItem('shouquan_admin', JSON.stringify(res.data.admin))
    router.push('/')
  } catch (err) { error.value = err.message }
  finally { loading.value = false }
}
</script>
<style scoped>
.login-page{min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)}
.login-card{background:#fff;border-radius:12px;padding:40px;width:400px;box-shadow:0 20px 60px rgba(0,0,0,.3)}
.login-title{font-size:24px;text-align:center;color:#1a1a2e;margin-bottom:8px}
.login-subtitle{text-align:center;color:#888;font-size:14px;margin-bottom:32px}
.form-group{margin-bottom:20px}
.form-group label{display:block;font-size:14px;color:#555;margin-bottom:6px}
.form-group input{width:100%;padding:10px 14px;border:1px solid #ddd;border-radius:8px;font-size:14px;outline:0}
.form-group input:focus{border-color:#0f3460}
.error-msg{color:#e74c3c;font-size:13px;margin-bottom:12px}
.login-btn{width:100%;padding:12px;background:#0f3460;color:#fff;border:none;border-radius:8px;font-size:16px;cursor:pointer}
.login-btn:hover{background:#1a1a2e}
.login-btn:disabled{opacity:.6;cursor:not-allowed}
</style>
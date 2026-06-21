<template>
  <div class="login-page">
    <div class="login-left">
      <div class="brand">
        <svg viewBox="0 0 30 30" fill="none" class="brand-logo"><rect width="30" height="30" rx="7" fill="#2563eb"/><text x="4.5" y="21.5" fill="#fff" font-size="18" font-weight="800" font-family="system-ui">S</text></svg>
        <span class="brand-name">ShouYin<span class="accent">POS</span></span>
      </div>
      <div class="brand-content">
        <h1>授权管理<br><span class="accent">系统</span></h1>
        <p>收银系统许可证管理平台。统一管理授权码、实例状态和客户信息。</p>
      </div>
      <div class="brand-footer">
        <span>Built on Cloudflare Workers</span>
      </div>
    </div>
    <div class="login-right">
      <div class="login-card">
        <h2>登录</h2>
        <p class="login-hint">使用管理员账号登录后台</p>
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="username">用户名</label>
            <input id="username" v-model="username" type="text" placeholder="请输入用户名" required autocomplete="username" />
          </div>
          <div class="form-group">
            <label for="password">密码</label>
            <input id="password" v-model="password" type="password" placeholder="请输入密码" required autocomplete="current-password" />
          </div>
          <p v-if="error" class="error-msg">{{ error }}</p>
          <button type="submit" class="login-btn" :disabled="loading">
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </form>
        <div class="login-footer">
          <a href="/">返回官网</a>
        </div>
      </div>
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
  error.value = ''
  loading.value = true
  try {
    const res = await request.post('/auth/login', {
      username: username.value,
      password: password.value,
    })
    localStorage.setItem('shouquan_token', res.data.token)
    localStorage.setItem('shouquan_admin', JSON.stringify(res.data.admin))
    router.push('/')
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100dvh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #ffffff;
  font-family: 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif;
}

.login-left {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 40px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%);
}

.login-left::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 600px 500px at 30% 50%, rgba(37, 99, 235, 0.06), transparent 70%);
  pointer-events: none;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  z-index: 1;
}
.brand-logo { width: 32px; height: 32px; }
.brand-name { font-size: 18px; font-weight: 800; color: #0f172a; letter-spacing: -0.3px; }
.brand-name .accent { color: #2563eb; }

.brand-content {
  position: relative;
  z-index: 1;
  max-width: 380px;
}
.brand-content h1 {
  font-size: 42px;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -2px;
  color: #0f172a;
  margin-bottom: 16px;
}
.brand-content .accent { color: #2563eb; }
.brand-content p {
  font-size: 15px;
  color: #64748b;
  line-height: 1.7;
}

.brand-footer { position: relative; z-index: 1; }
.brand-footer span { font-size: 12px; color: #94a3b8; }

.login-right {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: #ffffff;
}

.login-card { width: 100%; max-width: 360px; }

.login-card h2 {
  font-size: 26px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.5px;
  margin-bottom: 6px;
}

.login-hint {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 32px;
}

.form-group { margin-bottom: 20px; }

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 8px;
}

.form-group input {
  width: 100%;
  padding: 11px 14px;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  color: #0f172a;
  outline: none;
  transition: all 0.2s;
}

.form-group input::placeholder { color: #94a3b8; }

.form-group input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  background: #ffffff;
}

.error-msg {
  color: #dc2626;
  font-size: 13px;
  margin-bottom: 16px;
  padding: 10px 14px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
}

.login-btn {
  width: 100%;
  padding: 12px 20px;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}

.login-btn:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.login-btn:active {
  transform: translateY(0) scale(0.98);
}

.login-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.login-footer {
  margin-top: 28px;
  text-align: center;
}

.login-footer a {
  font-size: 13px;
  color: #64748b;
  text-decoration: none;
  transition: color 0.2s;
}

.login-footer a:hover { color: #2563eb; }

@media (max-width: 768px) {
  .login-page { grid-template-columns: 1fr; }
  .login-left { display: none; }
}
</style>

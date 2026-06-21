<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="brand">
          <svg viewBox="0 0 30 30" fill="none" class="brand-logo"><rect width="30" height="30" rx="7" fill="#2563eb"/><text x="4.5" y="21.5" fill="#fff" font-size="18" font-weight="800" font-family="system-ui">S</text></svg>
          <h2>ShouYinPOS</h2>
        </div>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/dashboard" class="nav-item" active-class="active">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
          仪表盘
        </router-link>
        <router-link to="/users" class="nav-item" active-class="active">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          用户管理
        </router-link>
        <router-link to="/licenses" class="nav-item" active-class="active">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="3"/><path d="M7 7h10M7 12h6M7 17h8"/></svg>
          授权管理
        </router-link>
        <router-link to="/orders" class="nav-item" active-class="active">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          订单管理
        </router-link>
        <router-link to="/plans" class="nav-item" active-class="active">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
          套餐管理
        </router-link>

        <!-- 运营管理 -->
        <div class="nav-group">
          <div class="nav-group-title" @click="expanded.operations = !expanded.operations">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            <span>运营管理</span>
            <span class="arrow" :class="{ open: expanded.operations }">▾</span>
          </div>
          <div v-show="expanded.operations" class="nav-sub">
            <router-link to="/operations/notices" class="nav-item sub" active-class="active">公告管理</router-link>
            <router-link to="/operations/notify-templates" class="nav-item sub" active-class="active">通知模板</router-link>
            <router-link to="/operations/tickets" class="nav-item sub" active-class="active">工单管理</router-link>
          </div>
        </div>

        <!-- 渠道管理 -->
        <div class="nav-group">
          <div class="nav-group-title" @click="expanded.channel = !expanded.channel">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16M4 4h16v12H4z"/><path d="M9 16v-4h6v4"/></svg>
            <span>渠道管理</span>
            <span class="arrow" :class="{ open: expanded.channel }">▾</span>
          </div>
          <div v-show="expanded.channel" class="nav-sub">
            <router-link to="/channel/channels" class="nav-item sub" active-class="active">渠道商</router-link>
            <router-link to="/channel/commissions" class="nav-item sub" active-class="active">佣金结算</router-link>
          </div>
        </div>

        <router-link to="/analytics" class="nav-item" active-class="active">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          数据分析
        </router-link>
        <div class="nav-divider"></div>

        <!-- 系统设置 -->
        <div class="nav-group">
          <div class="nav-group-title" @click="expanded.settings = !expanded.settings">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            <span>系统设置</span>
            <span class="arrow" :class="{ open: expanded.settings }">▾</span>
          </div>
          <div v-show="expanded.settings" class="nav-sub">
            <router-link to="/settings/admins" class="nav-item sub" active-class="active">管理员</router-link>
            <router-link to="/settings/roles" class="nav-item sub" active-class="active">角色权限</router-link>
            <router-link to="/settings/payment" class="nav-item sub" active-class="active">支付配置</router-link>
            <router-link to="/settings/notify" class="nav-item sub" active-class="active">通知配置</router-link>
            <router-link to="/settings/config" class="nav-item sub" active-class="active">系统设置</router-link>
            <router-link to="/settings/monitor" class="nav-item sub" active-class="active">系统监控</router-link>
          </div>
        </div>

        <!-- 日志查看 -->
        <div class="nav-group">
          <div class="nav-group-title" @click="expanded.logs = !expanded.logs">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            <span>日志查看</span>
            <span class="arrow" :class="{ open: expanded.logs }">▾</span>
          </div>
          <div v-show="expanded.logs" class="nav-sub">
            <router-link to="/logs" class="nav-item sub" active-class="active">操作日志</router-link>
            <router-link to="/logs/login" class="nav-item sub" active-class="active">登录日志</router-link>
          </div>
        </div>
      </nav>
      <div class="sidebar-footer">
        <div class="admin-info">
          <div class="admin-avatar">{{ adminInitial }}</div>
          <div class="admin-meta">
            <span class="admin-name">{{ adminName }}</span>
            <span class="admin-role">管理员</span>
          </div>
        </div>
        <button @click="handleLogout" class="logout-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
    </aside>
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const expanded = reactive({ operations: false, channel: false, settings: false, logs: false })

const adminName = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('shouquan_admin') || '{}').username || '管理员'
  } catch {
    return '管理员'
  }
})

const adminInitial = computed(() => {
  return adminName.value.charAt(0).toUpperCase()
})

function handleLogout() {
  localStorage.removeItem('shouquan_token')
  localStorage.removeItem('shouquan_admin')
  router.push('/login')
}
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100dvh;
  background: #f1f5f9;
  font-family: 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif;
}

.sidebar {
  width: 240px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  border-right: 1px solid #e2e8f0;
  box-shadow: 1px 0 3px rgba(0, 0, 0, 0.04);
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #f1f5f9;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-logo {
  width: 32px;
  height: 32px;
}

.sidebar-header h2 {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.3px;
}

.sidebar-nav {
  flex: 1;
  padding: 12px 8px;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  color: #64748b;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s;
  margin-bottom: 2px;
}

.nav-item:hover {
  color: #0f172a;
  background: #f8fafc;
}

.nav-item.active {
  color: #2563eb;
  background: #eff6ff;
  font-weight: 600;
}

.nav-item.active svg {
  color: #2563eb;
}

.nav-group-title {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 2px;
}

.nav-group-title:hover {
  color: #0f172a;
  background: #f8fafc;
}

.nav-group-title .arrow {
  margin-left: auto;
  font-size: 10px;
  transition: transform 0.2s;
}

.nav-group-title .arrow.open {
  transform: rotate(180deg);
}

.nav-sub {
  padding-left: 8px;
  margin-bottom: 4px;
}

.nav-sub .nav-item.sub {
  font-size: 13px;
  padding: 8px 12px;
  margin-bottom: 1px;
}

.nav-divider {
  height: 1px;
  background: #f1f5f9;
  margin: 8px 12px;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.admin-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.admin-avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
}

.admin-meta {
  display: flex;
  flex-direction: column;
}

.admin-name {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
}

.admin-role {
  font-size: 11px;
  color: #94a3b8;
}

.logout-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: #94a3b8;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.05);
}

.main-content {
  flex: 1;
  padding: 28px 32px;
  overflow-y: auto;
  background: #f1f5f9;
}

.main-content > * {
  max-width: 1200px;
}
</style>

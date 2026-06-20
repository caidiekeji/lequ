<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="sidebar-header"><h2>授权管理</h2></div>
      <nav class="sidebar-nav">
        <router-link to="/dashboard" class="nav-item" active-class="active"><span class="nav-icon">&#9632;</span> 仪表盘</router-link>
        <router-link to="/licenses" class="nav-item" active-class="active"><span class="nav-icon">&#9632;</span> 授权码管理</router-link>
        <router-link to="/licenses/create" class="nav-item" active-class="active"><span class="nav-icon">&#9632;</span> 创建授权码</router-link>
      </nav>
      <div class="sidebar-footer">
        <span class="admin-name">{{ adminName }}</span>
        <button @click="handleLogout" class="logout-btn">退出</button>
      </div>
    </aside>
    <main class="main-content"><router-view /></main>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const adminName = computed(() => {
  try { return JSON.parse(localStorage.getItem('shouquan_admin') || '{}').username || '管理员' } catch { return '管理员' }
})
function handleLogout() {
  localStorage.removeItem('shouquan_token')
  localStorage.removeItem('shouquan_admin')
  router.push('/login')
}
</script>
<style scoped>
.layout{display:flex;min-height:100vh}
.sidebar{width:220px;background:#1a1a2e;color:#fff;display:flex;flex-direction:column;flex-shrink:0}
.sidebar-header{padding:24px 20px;border-bottom:1px solid rgba(255,255,255,.1)}
.sidebar-header h2{font-size:18px;font-weight:600}
.sidebar-nav{flex:1;padding:12px 0}
.nav-item{display:flex;align-items:center;gap:10px;padding:12px 20px;color:rgba(255,255,255,.7);text-decoration:none;font-size:14px;border-left:3px solid transparent}
.nav-item:hover{color:#fff;background:rgba(255,255,255,.05)}
.nav-item.active{color:#fff;background:rgba(255,255,255,.1);border-left-color:#4fc3f7}
.nav-icon{font-size:10px}
.sidebar-footer{padding:16px 20px;border-top:1px solid rgba(255,255,255,.1);display:flex;align-items:center;justify-content:space-between}
.admin-name{font-size:13px;color:rgba(255,255,255,.6)}
.logout-btn{padding:4px 12px;background:rgba(255,255,255,.1);color:#fff;border:1px solid rgba(255,255,255,.2);border-radius:4px;font-size:12px;cursor:pointer}
.main-content{flex:1;padding:24px;overflow-y:auto}
</style>
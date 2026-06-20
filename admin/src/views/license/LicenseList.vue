<template>
  <div class="license-list">
    <div class="page-header"><h1 class="page-title">授权码管理</h1><router-link to="/licenses/create" class="create-btn">+ 创建授权码</router-link></div>
    <div class="filter-bar">
      <input v-model="keyword" placeholder="搜索授权码或客户名..." class="search-input" @keyup.enter="search" />
      <select v-model="statusFilter" class="status-select" @change="search"><option value="">全部</option><option value="active">活跃</option><option value="revoked">已吊销</option><option value="expired">已过期</option></select>
      <button @click="search" class="search-btn">搜索</button>
    </div>
    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>授权码</th><th>版本</th><th>状态</th><th>激活数</th><th>有效期</th><th>创建时间</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-if="list.length===0"><td colspan="7" class="empty-cell">暂无数据</td></tr>
          <tr v-for="item in list" :key="item.id">
            <td class="license-key-cell">{{ item.license_key }}</td>
            <td>{{ editionLabel(item.product_edition) }}</td>
            <td><span :class="'status-tag status-'+item.status">{{ statusLabel(item.status) }}</span></td>
            <td>{{ item.instance_count }}</td>
            <td>{{ formatDate(item.valid_until) }}</td>
            <td>{{ formatDate(item.created_at) }}</td>
            <td>
              <router-link :to="'/licenses/'+item.id" class="action-link">详情</router-link>
              <button v-if="item.status==='active'" @click="handleRevoke(item)" class="action-btn danger">吊销</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="pagination" v-if="total>pageSize">
      <button :disabled="page<=1" @click="changePage(page-1)">上一页</button>
      <span class="page-info">第 {{ page }}/{{ totalPages }} 页（共 {{ total }} 条）</span>
      <button :disabled="page>=totalPages" @click="changePage(page+1)">下一页</button>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import request from '../../api/request'
const list = ref([]); const total = ref(0); const page = ref(1); const pageSize = ref(20)
const keyword = ref(''); const statusFilter = ref('')
const totalPages = computed(() => Math.ceil(total.value/pageSize.value))
const editionMap = { basic:'基础版', standard:'标准版', premium:'高级版', enterprise:'企业版' }
const statusMap = { active:'活跃', revoked:'已吊销', expired:'已过期' }
function editionLabel(k) { return editionMap[k]||k }
function statusLabel(k) { return statusMap[k]||k }
function formatDate(d) { return d?new Date(d).toLocaleDateString('zh-CN'):'-' }
async function loadList() {
  try {
    const res = await request.get('/licenses', { page: page.value, pageSize: pageSize.value, status: statusFilter.value||undefined, keyword: keyword.value||undefined })
    list.value = res.data.list; total.value = res.data.total
  } catch(err) { console.error(err.message) }
}
function search() { page.value=1; loadList() }
function changePage(p) { page.value=p; loadList() }
async function handleRevoke(item) {
  if (!confirm('确定吊销 '+item.license_key+'？')) return
  try { await request.post('/licenses/'+item.id+'/revoke'); loadList() }
  catch(err) { alert('吊销失败: '+err.message) }
}
onMounted(loadList)
</script>
<style scoped>
.license-list{max-width:1100px}
.page-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}
.page-title{font-size:22px;color:#1a1a2e}
.create-btn{padding:8px 20px;background:#0f3460;color:#fff;border-radius:6px;text-decoration:none;font-size:14px}
.filter-bar{display:flex;gap:10px;margin-bottom:16px}
.search-input{flex:1;padding:8px 14px;border:1px solid #ddd;border-radius:6px;font-size:14px;outline:0}
.search-input:focus{border-color:#0f3460}
.status-select{padding:8px 12px;border:1px solid #ddd;border-radius:6px;font-size:14px}
.search-btn{padding:8px 20px;background:#0f3460;color:#fff;border:none;border-radius:6px;cursor:pointer}
.table-wrap{background:#fff;border-radius:10px;box-shadow:0 1px 4px rgba(0,0,0,.06);overflow:hidden}
.table{width:100%;border-collapse:collapse;font-size:14px}
.table th{padding:14px 16px;text-align:left;background:#f8f9fa;color:#555;font-weight:600;border-bottom:1px solid #eee}
.table td{padding:14px 16px;border-bottom:1px solid #f0f0f0}
.empty-cell{text-align:center;color:#aaa;padding:40px}
.license-key-cell{font-family:monospace;font-weight:600;color:#0f3460}
.status-tag{padding:2px 10px;border-radius:12px;font-size:12px}
.status-active{background:#e8f5e9;color:#2e7d32}
.status-revoked{background:#ffebee;color:#c62828}
.status-expired{background:#fff3e0;color:#e65100}
.action-link{color:#0f3460;text-decoration:none;font-size:13px;margin-right:8px}
.action-btn.danger{background:#ffebee;color:#c62828;border:none;border-radius:4px;font-size:12px;padding:2px 10px;cursor:pointer}
.pagination{display:flex;align-items:center;justify-content:center;gap:16px;margin-top:20px}
.pagination button{padding:6px 16px;border:1px solid #ddd;background:#fff;border-radius:6px;font-size:13px;cursor:pointer}
.pagination button:disabled{opacity:.4;cursor:default}
.page-info{font-size:13px;color:#888}
</style>
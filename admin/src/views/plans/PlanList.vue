<template>
  <div class="page">
    <div class="page-header" style="justify-content:space-between">
      <h1>套餐管理</h1>
      <router-link to="/plans/create" class="btn-primary" style="text-decoration:none">创建套餐</router-link>
    </div>
    <div class="table-container">
      <table class="data-table">
        <thead><tr><th>名称</th><th>编码</th><th>价格</th><th>原价</th><th>有效期</th><th>门店</th><th>终端</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="plan in plans" :key="plan.id">
            <td style="font-weight:600">{{ plan.name }}</td>
            <td class="mono">{{ plan.code }}</td>
            <td class="price">¥{{ (plan.price/100).toFixed(0) }}</td>
            <td style="color:#94a3b8;text-decoration:line-through">¥{{ (plan.original_price/100).toFixed(0) }}</td>
            <td>{{ plan.duration_days }}天</td>
            <td>{{ plan.max_stores }}</td>
            <td>{{ plan.max_terminals }}</td>
            <td><span :class="['status-badge', plan.status]">{{ plan.status === 'active' ? '启用' : '停用' }}</span></td>
            <td><router-link :to="`/plans/${plan.id}/edit`" class="btn-link">编辑</router-link></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '@/api/request'

const plans = ref([])

onMounted(async () => {
  try { const r = await request.get('/admin/plans'); plans.value = r.data || [] }
  catch (e) { console.error(e) }
})
</script>

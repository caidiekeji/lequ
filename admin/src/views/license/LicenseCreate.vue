<template>
  <div class="license-create">
    <h1 class="page-title">创建授权码</h1>
    <div class="form-card">
      <form @submit.prevent="handleSubmit">
        <div class="form-group"><label>产品版本 <span class="required">*</span></label>
          <select v-model="form.product_edition" class="form-select">
            <option value="basic">基础版 - 1终端 / 5000商品 / 2000会员</option>
            <option value="standard">标准版 - 3终端 / 10000商品 / 5000会员</option>
            <option value="premium">高级版 - 10终端 / 50000商品 / 20000会员</option>
            <option value="enterprise">企业版 - 不限终端/不限商品/不限会员</option>
          </select>
        </div>
        <div class="form-group"><label>有效天数 <span class="required">*</span></label>
          <div class="days-options">
            <button v-for="d in dayOptions" :key="d.value" type="button" :class="['days-btn',{active:form.valid_days===d.value}]" @click="form.valid_days=d.value">{{ d.label }}</button>
          </div>
          <input v-model.number="form.valid_days" type="number" min="1" class="form-input days-input" placeholder="自定义天数" />
        </div>
        <div class="form-group">
          <label class="toggle-label" @click="showAdvanced=!showAdvanced">{{ showAdvanced?'收起':'展开' }}高级选项 <span class="toggle-icon">{{ showAdvanced?'▲':'▼' }}</span></label>
        </div>
        <div v-if="showAdvanced" class="advanced-section">
          <div class="form-row">
            <div class="form-group"><label>客户名称</label><input v-model="form.customer_name" class="form-input" placeholder="客户名称" /></div>
            <div class="form-group"><label>联系方式</label><input v-model="form.customer_contact" class="form-input" placeholder="手机/邮箱" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>最大激活次数</label><input v-model.number="form.max_stores" type="number" min="1" class="form-input" /></div>
            <div class="form-group"><label>最大终端数 (-1不限)</label><input v-model.number="form.max_terminals" type="number" min="-1" class="form-input" /></div>
          </div>
          <div class="form-group"><label>备注</label><input v-model="form.note" class="form-input" placeholder="用途说明" /></div>
        </div>
        <p v-if="error" class="error-msg">{{ error }}</p>
        <div class="form-actions">
          <button type="submit" class="submit-btn" :disabled="submitting">{{ submitting?'生成中...':'生成授权码' }}</button>
          <router-link to="/licenses" class="cancel-btn">取消</router-link>
        </div>
      </form>
    </div>
    <div v-if="result" class="result-card">
      <h3>授权码生成成功</h3>
      <div class="result-key">{{ result.license_key }}</div>
      <div class="result-info"><span>版本：{{ editionLabel(result.product_edition) }}</span><span>有效期至：{{ formatDate(result.valid_until) }}</span></div>
      <button @click="copyKey" class="copy-btn">复制授权码</button>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive } from 'vue'
import request from '../../api/request'
const showAdvanced = ref(false); const error = ref(''); const submitting = ref(false); const result = ref(null)
const form = reactive({ product_edition:'standard', valid_days:365, max_stores:1, max_terminals:null, max_products:null, max_members:null, note:'', customer_name:'', customer_contact:'' })
const dayOptions = [{label:'30天',value:30},{label:'90天',value:90},{label:'180天',value:180},{label:'365天',value:365},{label:'730天',value:730},{label:'永久',value:36500}]
const editionMap = { basic:'基础版', standard:'标准版', premium:'高级版', enterprise:'企业版' }
function editionLabel(k) { return editionMap[k]||k }
function formatDate(d) { return d?new Date(d).toLocaleDateString('zh-CN'):'-' }
async function handleSubmit() {
  error.value = ''
  if (!form.product_edition || !form.valid_days || form.valid_days<1) { error.value='请填写完整信息'; return }
  submitting.value = true
  try {
    const res = await request.post('/licenses', {
      product_edition: form.product_edition, valid_days: form.valid_days,
      max_stores: form.max_stores||undefined, max_terminals: form.max_terminals??undefined,
      max_products: form.max_products??undefined, max_members: form.max_members??undefined,
      note: form.note||undefined, customer_name: form.customer_name||undefined, customer_contact: form.customer_contact||undefined,
    })
    result.value = res.data
  } catch(err) { error.value=err.message }
  finally { submitting.value=false }
}
function copyKey() { if(result.value) { navigator.clipboard.writeText(result.value.license_key); alert('已复制') } }
</script>
<style scoped>
.license-create{max-width:700px}
.page-title{font-size:22px;margin-bottom:24px;color:#1a1a2e}
.form-card{background:#fff;border-radius:10px;padding:28px;box-shadow:0 1px 4px rgba(0,0,0,.06)}
.form-group{margin-bottom:20px}
.form-group label{display:block;font-size:14px;color:#555;margin-bottom:8px;font-weight:600}
.required{color:#e74c3c}
.form-select,.form-input{width:100%;padding:10px 14px;border:1px solid #ddd;border-radius:8px;font-size:14px;outline:0}
.form-select:focus,.form-input:focus{border-color:#0f3460}
.days-options{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px}
.days-btn{padding:6px 16px;border:1px solid #ddd;background:#fff;border-radius:6px;font-size:13px;cursor:pointer}
.days-btn.active{background:#0f3460;color:#fff;border-color:#0f3460}
.days-input{width:160px}
.toggle-label{cursor:pointer;color:#0f3460;font-weight:500}
.advanced-section{padding:20px;background:#f8f9fa;border-radius:8px;margin-bottom:20px}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.error-msg{color:#e74c3c;font-size:13px;margin-bottom:12px}
.form-actions{display:flex;gap:12px;align-items:center}
.submit-btn{padding:10px 28px;background:#0f3460;color:#fff;border:none;border-radius:8px;font-size:15px;cursor:pointer}
.submit-btn:disabled{opacity:.6}
.cancel-btn{color:#888;text-decoration:none;font-size:14px}
.result-card{margin-top:24px;background:#e8f5e9;border-radius:10px;padding:28px;text-align:center}
.result-card h3{font-size:18px;color:#2e7d32;margin-bottom:16px}
.result-key{font-family:monospace;font-size:24px;font-weight:700;color:#1a1a2e;letter-spacing:2px;margin-bottom:12px}
.result-info{display:flex;gap:20px;justify-content:center;font-size:13px;color:#555;margin-bottom:16px}
.copy-btn{padding:8px 24px;background:#2e7d32;color:#fff;border:none;border-radius:6px;font-size:14px;cursor:pointer}
</style>
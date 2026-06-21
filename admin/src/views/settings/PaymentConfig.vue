<template>
  <div class="page">
    <h1 style="font-size:24px;font-weight:800;letter-spacing:-0.5px;margin-bottom:24px">支付配置</h1>

    <div v-if="loading" class="loading">加载中...</div>

    <template v-else>
      <div class="tabs">
        <button :class="{ active: tab === 'general' }" @click="tab = 'general'">通用设置</button>
        <button :class="{ active: tab === 'wechat' }" @click="tab = 'wechat'">微信支付</button>
        <button :class="{ active: tab === 'alipay' }" @click="tab = 'alipay'">支付宝</button>
        <button :class="{ active: tab === 'unionpay' }" @click="tab = 'unionpay'">云闪付</button>
        <button :class="{ active: tab === 'manual' }" @click="tab = 'manual'">手动确认</button>
      </div>

      <!-- 通用设置 -->
      <div v-show="tab === 'general'" class="form-card">
        <h3>支付方式</h3>
        <p class="desc">启用或禁用支付方式，用户在支付时将看到已启用的选项。</p>
        <div class="toggle-group">
          <label class="toggle"><input type="checkbox" v-model="config.wechat_enabled" /><span class="toggle-slider"></span><span class="toggle-label">微信支付</span></label>
          <label class="toggle"><input type="checkbox" v-model="config.alipay_enabled" /><span class="toggle-slider"></span><span class="toggle-label">支付宝</span></label>
          <label class="toggle"><input type="checkbox" v-model="config.unionpay_enabled" /><span class="toggle-slider"></span><span class="toggle-label">云闪付</span></label>
          <label class="toggle"><input type="checkbox" v-model="config.manual_enabled" /><span class="toggle-slider"></span><span class="toggle-label">手动确认（转账/汇款后管理员确认）</span></label>
        </div>
        <div class="form-group" style="margin-top:20px">
          <label>支付回调域名</label>
          <input v-model="config.callback_domain" type="text" placeholder="https://www.lequ.pw" />
          <span class="hint">微信/支付宝/云闪付回调通知地址的基础域名</span>
        </div>
      </div>

      <!-- 微信支付 -->
      <div v-show="tab === 'wechat'" class="form-card">
        <h3>微信支付配置</h3>
        <p class="desc">接入微信支付需要在 <a href="https://pay.weixin.qq.com" target="_blank">微信支付商户平台</a> 注册商户号。</p>
        <div class="form-group"><label>商户号 (mch_id)</label><input v-model="config.wechat_mch_id" type="text" placeholder="1900000001" /></div>
        <div class="form-group"><label>API 密钥</label><input v-model="config.wechat_api_key" type="password" placeholder="API Key" /></div>
        <div class="form-group"><label>AppID</label><input v-model="config.wechat_app_id" type="text" placeholder="wx1234567890" /></div>
        <div class="form-group"><label>回调通知 URL</label><input disabled :value="config.callback_domain + '/api/orders/callback/wechat'" class="disabled-input" /><span class="hint">在微信支付商户平台配置此地址</span></div>
        <div class="status-bar" :class="config.wechat_configured ? 'ok' : 'warn'">{{ config.wechat_configured ? '已配置' : '未配置完整' }}</div>
      </div>

      <!-- 支付宝 -->
      <div v-show="tab === 'alipay'" class="form-card">
        <h3>支付宝配置</h3>
        <p class="desc">接入支付宝需要在 <a href="https://open.alipay.com" target="_blank">支付宝开放平台</a> 创建应用。</p>
        <div class="form-group"><label>应用 AppID</label><input v-model="config.alipay_app_id" type="text" placeholder="2021000000000001" /></div>
        <div class="form-group"><label>应用私钥</label><textarea v-model="config.alipay_private_key" rows="3" placeholder="MIIEvg..."></textarea></div>
        <div class="form-group"><label>支付宝公钥</label><textarea v-model="config.alipay_public_key" rows="3" placeholder="MIIBIj..."></textarea></div>
        <div class="form-group"><label>签名方式</label><select v-model="config.alipay_sign_type"><option value="RSA2">RSA2（推荐）</option><option value="RSA">RSA</option></select></div>
        <div class="form-group"><label>回调通知 URL</label><input disabled :value="config.callback_domain + '/api/orders/callback/alipay'" class="disabled-input" /><span class="hint">在支付宝应用配置中设置此地址</span></div>
        <div class="status-bar" :class="config.alipay_configured ? 'ok' : 'warn'">{{ config.alipay_configured ? '已配置' : '未配置完整' }}</div>
      </div>

      <!-- 云闪付 -->
      <div v-show="tab === 'unionpay'" class="form-card">
        <h3>云闪付配置</h3>
        <p class="desc">接入云闪付需要在 <a href="https://open.unionpay.com" target="_blank">银联开放平台</a> 注册商户。支持银联在线支付、云闪付 APP 扫码支付。</p>
        <div class="form-group"><label>商户号 (mch_id)</label><input v-model="config.unionpay_mch_id" type="text" placeholder="777290058110097" /></div>
        <div class="form-group"><label>商户证书序列号</label><input v-model="config.unionpay_cert_serial" type="text" placeholder="证书序列号" /></div>
        <div class="form-group"><label>商户私钥</label><textarea v-model="config.unionpay_private_key" rows="3" placeholder="MIIEvg...（PEM 格式）"></textarea></div>
        <div class="form-group"><label>银联公钥</label><textarea v-model="config.unionpay_public_key" rows="3" placeholder="MIIBIj...（银联验证签名用）"></textarea></div>
        <div class="form-group">
          <label>环境</label>
          <select v-model="config.unionpay_env">
            <option value="sandbox">测试环境</option>
            <option value="production">正式环境</option>
          </select>
        </div>
        <div class="form-group"><label>前台回调 URL（用户支付完成后跳转）</label><input v-model="config.unionpay_return_url" type="text" :placeholder="config.callback_domain + '/pay/success'" /></div>
        <div class="form-group"><label>后台回调 URL（银联通知支付结果）</label><input disabled :value="config.callback_domain + '/api/orders/callback/unionpay'" class="disabled-input" /><span class="hint">在银联商户后台配置此地址</span></div>
        <div class="status-bar" :class="config.unionpay_configured ? 'ok' : 'warn'">{{ config.unionpay_configured ? '已配置' : '未配置完整' }}</div>
      </div>

      <!-- 手动确认 -->
      <div v-show="tab === 'manual'" class="form-card">
        <h3>手动确认设置</h3>
        <p class="desc">用户转账/汇款后，管理员在后台手动确认订单。</p>
        <div class="form-group"><label>收款信息展示</label><textarea v-model="config.manual_payment_info" rows="4" placeholder="请将款项汇至以下账户：&#10;开户行：XX银行&#10;户名：XX公司&#10;账号：1234 5678 9012 3456"></textarea><span class="hint">用户发起支付后展示的收款信息</span></div>
        <div class="form-group"><label>自动确认超时（小时）</label><input v-model.number="config.manual_expire_hours" type="number" min="1" max="72" placeholder="24" /></div>
      </div>

      <div class="save-bar">
        <button class="btn-primary" @click="saveConfig" :disabled="saving">{{ saving ? '保存中...' : '保存配置' }}</button>
        <span v-if="saved" class="saved-msg">已保存</span>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import request from '@/api/request'

const tab = ref('general')
const loading = ref(true)
const saving = ref(false)
const saved = ref(false)

const config = reactive({
  wechat_enabled: false,
  alipay_enabled: false,
  unionpay_enabled: false,
  manual_enabled: true,
  callback_domain: 'https://www.lequ.pw',
  // 微信
  wechat_mch_id: '',
  wechat_api_key: '',
  wechat_app_id: '',
  wechat_configured: false,
  // 支付宝
  alipay_app_id: '',
  alipay_private_key: '',
  alipay_public_key: '',
  alipay_sign_type: 'RSA2',
  alipay_configured: false,
  // 云闪付
  unionpay_mch_id: '',
  unionpay_cert_serial: '',
  unionpay_private_key: '',
  unionpay_public_key: '',
  unionpay_env: 'sandbox',
  unionpay_return_url: '',
  unionpay_configured: false,
  // 手动确认
  manual_payment_info: '',
  manual_expire_hours: 24,
})

onMounted(async () => {
  try {
    const res = await request.get('/admin/payment-config')
    if (res.data) Object.assign(config, res.data)
    config.wechat_configured = !!(config.wechat_mch_id && config.wechat_api_key)
    config.alipay_configured = !!(config.alipay_app_id && config.alipay_private_key)
    config.unionpay_configured = !!(config.unionpay_mch_id && config.unionpay_private_key)
  } catch (e) { console.error(e) }
  finally { loading.value = false }
})

async function saveConfig() {
  saving.value = true
  saved.value = false
  try {
    await request.put('/admin/payment-config', { ...config })
    config.wechat_configured = !!(config.wechat_mch_id && config.wechat_api_key)
    config.alipay_configured = !!(config.alipay_app_id && config.alipay_private_key)
    config.unionpay_configured = !!(config.unionpay_mch_id && config.unionpay_private_key)
    saved.value = true
    setTimeout(() => { saved.value = false }, 3000)
  } catch (e) { alert(e.message) }
  finally { saving.value = false }
}
</script>

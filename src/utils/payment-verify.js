/**
 * 支付回调签名验证（微信 V3 + 支付宝 RSA2 + 云闪付）
 *
 * 修复缺陷 #1：现有 pay-callback.js 仅解析 order_no，无任何签名校验，
 * 任意伪造即可让 pending 订单变 paid 并自动发牌（资金损失）。
 *
 * 设计原则（失败关闭）：
 * - 未配置商户证书/密钥 → 一律视为验签失败（拒绝），绝不发牌。
 * - 任何验签步骤异常 → 拒绝。
 * - 第三方异常返回 SUCCESS（避免重复回调），本系统异常返回 FAIL（要求重试）。
 *
 * 商户密钥来源：system_config 表 key='payment_config'，由后台「支付配置」维护。
 */

import { importRsaPublicKeyPem, rsaVerify, aesGcmDecrypt, timingSafeEqual } from '../utils.js'

// ============ 微信支付 V3 ============

/**
 * 验证微信支付 V3 回调
 * 流程：
 *   1. 用「微信支付平台证书公钥」校验 Wechatpay-Signature（SHA256withRSA）
 *   2. 校验 Wechatpay-Timestamp ±5 分钟
 *   3. AES-256-GCM 解密 resource.ciphertext 得到交易明文
 *
 * @param {Object} headers - 请求头（小写键）
 * @param {string} rawBody - 原始请求体
 * @param {Object} conf - payment_config（需含 wechat_apiv3_key、wechat_platform_cert_pem）
 * @returns {Promise<{ok:boolean, trade?:Object, reason?:string}>}
 */
export async function verifyWechatV3(headers, rawBody, conf) {
  const certPem = conf && conf.wechat_platform_cert_pem
  const apiv3Key = conf && conf.wechat_apiv3_key
  if (!certPem || !apiv3Key) {
    return { ok: false, reason: 'wechat_cert_or_key_not_configured' }
  }

  const signature = headers['wechatpay-signature']
  const timestamp = headers['wechatpay-timestamp']
  const nonce = headers['wechatpay-nonce']
  const serial = headers['wechatpay-serial']
  if (!signature || !timestamp || !nonce || !serial) {
    return { ok: false, reason: 'missing_wechat_headers' }
  }

  // 时间戳偏差校验
  const ts = parseInt(timestamp)
  const now = Math.floor(Date.now() / 1000)
  if (!ts || Math.abs(now - ts) > 300) {
    return { ok: false, reason: 'timestamp_out_of_window' }
  }

  // 拼接验签串：timestamp\nnonce\nbody\n
  const signedString = `${timestamp}\n${nonce}\n${rawBody}\n`
  const ok = await rsaVerify(certPem, signedString, signature, 'SHA-256')
  if (!ok) {
    return { ok: false, reason: 'signature_mismatch' }
  }

  // 解密 resource
  let parsed
  try {
    parsed = JSON.parse(rawBody)
  } catch (e) {
    return { ok: false, reason: 'invalid_json_body' }
  }

  const resource = parsed.resource
  if (!resource || !resource.ciphertext) {
    return { ok: false, reason: 'missing_resource' }
  }

  let trade
  try {
    const plaintext = await aesGcmDecrypt(
      apiv3Key,
      resource.associated_data || '',
      resource.nonce,
      resource.ciphertext
    )
    trade = JSON.parse(plaintext)
  } catch (e) {
    return { ok: false, reason: 'decrypt_failed' }
  }

  return { ok: true, trade }
}

// ============ 支付宝 RSA2 ============

/**
 * 验证支付宝回调（form 形式，按字典序拼参数 + RSA2 验签）
 *
 * @param {Object} params - URLSearchParams 解析出的 key→value
 * @param {string} alipayPublicKeyPem - 支付宝公钥 PEM
 * @returns {Promise<{ok:boolean, trade?:Object, reason?:string}>}
 */
export async function verifyAlipayRSA2(params, alipayPublicKeyPem) {
  if (!alipayPublicKeyPem) {
    return { ok: false, reason: 'alipay_public_key_not_configured' }
  }

  const sign = params.get('sign')
  const signType = params.get('sign_type')
  if (!sign || signType !== 'RSA2') {
    return { ok: false, reason: 'missing_or_unsupported_sign' }
  }

  // 按 key 字典序升序拼接，排除 sign / sign_type，空值不参与，以 & 与 = 连接
  const sortedKeys = Array.from(params.keys())
    .filter(k => k !== 'sign' && k !== 'sign_type')
    .filter(k => params.get(k) !== '' && params.get(k) != null)
    .sort()
  const signString = sortedKeys.map(k => `${k}=${params.get(k)}`).join('&')

  const ok = await rsaVerify(alipayPublicKeyPem, signString, sign, 'SHA-256')
  if (!ok) {
    return { ok: false, reason: 'signature_mismatch' }
  }

  // 组装 trade 标准字段
  const trade = {
    out_trade_no: params.get('out_trade_no'),
    trade_no: params.get('trade_no'),
    total_amount: params.get('total_amount'), // 元（字符串），需转分
    trade_status: params.get('trade_status'),
    app_id: params.get('app_id'),
  }

  return { ok: true, trade }
}

// ============ 云闪付（占位，需按银联规范实现） ============

/**
 * 云闪付验签：银联规范需用银联公钥验证 SDK 报文签名。
 * 此处先实现占位 + 失败关闭，等接入真实银联证书后补全。
 */
export async function verifyUnionpay(params, conf) {
  return { ok: false, reason: 'unionpay_verify_not_implemented' }
}

// ============ 金额一致性校验 ============

/**
 * 金额一致性校验（核心：防伪造回调金额）
 * @param {number} orderAmount - 订单金额（分）
 * @param {number} callbackAmountFen - 回调金额（分）
 * @returns {boolean}
 */
export function verifyAmount(orderAmount, callbackAmountFen) {
  const a = parseInt(orderAmount)
  const b = parseInt(callbackAmountFen)
  if (Number.isNaN(a) || Number.isNaN(b)) return false
  return timingSafeEqual(String(a), String(b))
}

/**
 * 元（字符串）→ 分（整数），用于支付宝 total_amount
 */
export function yuanToFen(yuan) {
  const n = parseFloat(yuan)
  if (Number.isNaN(n)) return NaN
  return Math.round(n * 100)
}

/**
 * 工具函数模块
 * 使用 Web Crypto API 实现密码哈希、JWT 签发/验证、授权码生成、支付验签原语。
 * Cloudflare Workers 环境兼容（无 Node.js 依赖）。
 */

// 密码哈希迭代轮数。新密码用 CURRENT，老密码（2 段格式）按 100000 验证后建议迁移。
const PBKDF2_ITERATIONS_LEGACY = 100000
const PBKDF2_ITERATIONS_CURRENT = 250000

// ==================== 密码哈希（PBKDF2 + SHA-256） ====================

/**
 * 对密码进行哈希（PBKDF2 + salt）
 * 存储格式: `${iterations}:${saltHex}:${hashHex}`（3 段）。
 * 老格式 `saltHex:hashHex`（2 段）视为 100000 轮，由 verifyPassword 兼容。
 * @param {string} password - 明文密码
 * @returns {Promise<string>}
 */
export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const saltStr = bufferToHex(salt)
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS_CURRENT, hash: 'SHA-256' }, key, 256)
  const hashStr = bufferToHex(new Uint8Array(bits))
  return PBKDF2_ITERATIONS_CURRENT + ':' + saltStr + ':' + hashStr
}

/**
 * 验证密码与哈希是否匹配（常量时间比较，兼容新旧两种格式）
 * @param {string} password - 明文密码
 * @param {string} stored - 存储的哈希字符串
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(password, stored) {
  const parts = String(stored).split(':')
  let iterations, saltHex, hashHex
  if (parts.length === 3) {
    iterations = parseInt(parts[0]) || PBKDF2_ITERATIONS_LEGACY
    saltHex = parts[1]
    hashHex = parts[2]
  } else if (parts.length === 2) {
    iterations = PBKDF2_ITERATIONS_LEGACY
    saltHex = parts[0]
    hashHex = parts[1]
  } else {
    return false
  }
  try {
    const salt = hexToBuffer(saltHex)
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, key, 256)
    const hashStr = bufferToHex(new Uint8Array(bits))
    return timingSafeEqual(hashStr, hashHex)
  } catch (e) {
    return false
  }
}

/**
 * 判断存储哈希是否为旧格式（需要重哈希迁移）
 */
export function isLegacyPasswordHash(stored) {
  return String(stored).split(':').length === 2
}

// ==================== JWT ====================

/**
 * 生成 JWT（HS256）
 * @param {Object} payload - 载荷数据
 * @param {string} secret - 密钥
 * @param {number} [expiresIn=28800] - 过期秒数（默认8小时）
 * @returns {Promise<string>} JWT 字符串
 */
export async function createJWT(payload, secret, expiresIn = 28800) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const tokenPayload = { ...payload, iat: now, exp: now + expiresIn, iss: 'shouquan' }

  const encoder = new TextEncoder()
  const headerStr = base64url(encoder.encode(JSON.stringify(header)))
  const payloadStr = base64url(encoder.encode(JSON.stringify(tokenPayload)))

  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(headerStr + '.' + payloadStr))
  const sigStr = base64url(new Uint8Array(signature))

  return headerStr + '.' + payloadStr + '.' + sigStr
}

/**
 * 验证 JWT 并解码载荷
 * @param {string} token - JWT 字符串
 * @param {string} secret - 密钥
 * @returns {Object|null} 解码后的 payload，验证失败返回 null
 */
export async function verifyJWT(token, secret) {
  try {
    const parts = String(token).split('.')
    if (parts.length !== 3) return null

    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify'])

    // 验证签名
    const sig = urlbase64ToBuffer(parts[2])
    const valid = await crypto.subtle.verify('HMAC', key, sig, encoder.encode(parts[0] + '.' + parts[1]))
    if (!valid) return null

    // 解码 payload
    const payloadStr = new TextDecoder().decode(urlbase64ToBuffer(parts[1]))
    const payload = JSON.parse(payloadStr)

    // 检查过期和签名者
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < now) return null
    if (payload.iss !== 'shouquan') return null

    return payload
  } catch (e) {
    return null
  }
}

// ==================== 授权码生成 ====================

/**
 * 生成授权码
 * 格式: POS-XXXX-XXXX-XXXX（4段，每段4位大写字母数字，排除易混淆字符）
 * @returns {string}
 */
export function generateLicenseKey() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const segments = []
  for (let i = 0; i < 4; i++) {
    let seg = ''
    const randomValues = crypto.getRandomValues(new Uint8Array(4))
    for (let j = 0; j < 4; j++) {
      seg += chars[randomValues[j] % chars.length]
    }
    segments.push(seg)
  }
  return 'POS-' + segments.join('-')
}

// ==================== UUID ====================

/**
 * 生成 UUID v4
 * @returns {string}
 */
export function generateUUID() {
  return crypto.randomUUID()
}

// ==================== 辅助函数 ====================

function bufferToHex(buf) {
  return Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join('')
}

function hexToBuffer(hex) {
  const bytes = []
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substring(i, i + 2), 16))
  }
  return new Uint8Array(bytes)
}

function base64url(buf) {
  const base64 = btoa(String.fromCharCode(...buf))
  return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function urlbase64ToBuffer(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  while (str.length % 4) str += '='
  const binaryStr = atob(str)
  const buf = new Uint8Array(binaryStr.length)
  for (let i = 0; i < binaryStr.length; i++) {
    buf[i] = binaryStr.charCodeAt(i)
  }
  return buf
}

/**
 * SHA-256 哈希
 * @param {string} data - 输入字符串
 * @returns {Promise<string>} hex 格式的哈希值
 */
export async function sha256(data) {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data))
  return bufferToHex(new Uint8Array(hash))
}

// ==================== 常量时间字符串比较（防计时旁路） ====================

/**
 * 常量时间字符串比较。长度不同也固定遍历到最大长度，避免长度泄露。
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
export function timingSafeEqual(a, b) {
  const sa = String(a)
  const sb = String(b)
  const maxLen = Math.max(sa.length, sb.length)
  let result = sa.length === sb.length
  for (let i = 0; i < maxLen; i++) {
    const ca = i < sa.length ? sa.charCodeAt(i) : 0
    const cb = i < sb.length ? sb.charCodeAt(i) : 0
    if (ca !== cb) result = false
  }
  return result
}

// ==================== HMAC（对外 API 签名） ====================

/**
 * HMAC-SHA256，返回 base64 字符串
 * @param {string|Uint8Array} key
 * @param {string|Uint8Array} message
 * @returns {Promise<string>} base64
 */
export async function hmacSha256(key, message) {
  const keyBytes = typeof key === 'string' ? new TextEncoder().encode(key) : key
  const msgBytes = typeof message === 'string' ? new TextEncoder().encode(message) : message
  const cryptoKey = await crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, msgBytes)
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
}

// ==================== RSA 验签（支付回调） ====================

/**
 * 将 PEM 格式公钥导入为 CryptoKey（用于 RSA 签名验证）
 * @param {string} pem - PEM 文本（含 BEGIN/END）
 * @param {string} [hash='SHA-256'] - 哈希算法
 * @returns {Promise<CryptoKey>}
 */
export async function importRsaPublicKeyPem(pem, hash = 'SHA-256') {
  const der = pemToDer(pem)
  return crypto.subtle.importKey('spki', der, { name: 'RSASSA-PKCS1-v1_5', hash }, false, ['verify'])
}

/**
 * RSA (RSASSA-PKCS1-v1_5) 验签
 * @param {string} pem - 公钥 PEM
 * @param {string} message - 原文
 * @param {string} signatureBase64 - base64 签名
 * @param {string} [hash='SHA-256']
 * @returns {Promise<boolean>}
 */
export async function rsaVerify(pem, message, signatureBase64, hash = 'SHA-256') {
  try {
    const key = await importRsaPublicKeyPem(pem, hash)
    const sig = base64ToBuffer(signatureBase64)
    return crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, sig, new TextEncoder().encode(message))
  } catch (e) {
    return false
  }
}

// ==================== AES-256-GCM 解密（微信 V3 回调 resource） ====================

/**
 * AES-256-GCM 解密（微信支付 V3 回调）
 * @param {string} apiv3Key - APIv3 密钥（32 字节文本）
 * @param {string} associatedData - additional_data
 * @param {string} nonce - 12 字节 nonce
 * @param {string} ciphertextBase64 - 密文 base64
 * @returns {Promise<string>} 明文 JSON 字符串
 */
export async function aesGcmDecrypt(apiv3Key, associatedData, nonce, ciphertextBase64) {
  const keyBytes = new TextEncoder().encode(apiv3Key)
  const iv = new TextEncoder().encode(nonce)
  const data = base64ToBuffer(ciphertextBase64) // 末尾 16 字节为 authTag，Web Crypto 自动处理
  const cryptoKey = await crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, ['decrypt'])
  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv, additionalData: new TextEncoder().encode(associatedData), tagLength: 128 },
    cryptoKey,
    data
  )
  return new TextDecoder().decode(plain)
}

/**
 * 密码强度验证
 * PRD 7.1: ≥8位 + 大小写+数字+符号至少三类
 * @param {string} password
 * @returns {{ valid: boolean, message: string }}
 */
export function validatePasswordStrength(password) {
  if (!password || password.length < 8) {
    return { valid: false, message: '密码长度至少8位' }
  }

  let categories = 0
  if (/[a-z]/.test(password)) categories++   // 小写
  if (/[A-Z]/.test(password)) categories++   // 大写
  if (/[0-9]/.test(password)) categories++   // 数字
  if (/[^a-zA-Z0-9]/.test(password)) categories++  // 符号

  if (categories < 3) {
    return { valid: false, message: '密码需包含大写字母、小写字母、数字、符号中至少三类' }
  }

  return { valid: true, message: 'ok' }
}

// ==================== Base64 辅助 ====================

function base64ToBuffer(b64) {
  const binaryStr = atob(b64)
  const buf = new Uint8Array(binaryStr.length)
  for (let i = 0; i < binaryStr.length; i++) buf[i] = binaryStr.charCodeAt(i)
  return buf
}

/**
 * PEM → DER (Uint8Array)，去除 BEGIN/END 与换行后 base64 解码
 */
function pemToDer(pem) {
  const cleaned = String(pem)
    .replace(/-----BEGIN [A-Z ]+-----/g, '')
    .replace(/-----END [A-Z ]+-----/g, '')
    .replace(/\s+/g, '')
  return base64ToBuffer(cleaned)
}
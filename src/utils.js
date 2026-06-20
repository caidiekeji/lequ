/**
 * 工具函数模块
 * 使用 Web Crypto API 实现密码哈希、JWT 签发/验证、授权码生成。
 * Cloudflare Workers 环境兼容（无 Node.js 依赖）。
 */

// ==================== 密码哈希（PBKDF2 + SHA-256） ====================

/**
 * 对密码进行哈希（PBKDF2 + salt）
 * @param {string} password - 明文密码
 * @returns {Promise<string>} 编码后的哈希字符串（格式: salt:hash_base64）
 */
export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const saltStr = bufferToHex(salt)
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, key, 256)
  const hashStr = bufferToHex(new Uint8Array(bits))
  return saltStr + ':' + hashStr
}

/**
 * 验证密码与哈希是否匹配
 * @param {string} password - 明文密码
 * @param {string} stored - 存储的哈希字符串（格式: salt:hash_base64）
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(password, stored) {
  const parts = stored.split(':')
  if (parts.length !== 2) return false
  const salt = hexToBuffer(parts[0])
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, key, 256)
  const hashStr = bufferToHex(new Uint8Array(bits))
  return hashStr === parts[1]
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
  const parts = token.split('.')
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
    for (let j = 0; j < 4; j++) {
      seg += chars[Math.floor(Math.random() * chars.length)]
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
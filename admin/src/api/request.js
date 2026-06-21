/**
 * API 请求模块
 * Cloudflare Workers 兼容版本
 */
const BASE_URL = import.meta.env.DEV ? '/api' : 'https://www.lequ.pw/api'

async function request(url, options = {}) {
  const token = localStorage.getItem('shouquan_token')
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = 'Bearer ' + token

  const response = await fetch(BASE_URL + url, { ...options, headers })
  const data = await response.json()

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('shouquan_token')
      localStorage.removeItem('shouquan_admin')
      window.location.hash = '#/login'
    }
    const err = new Error(data.message || '请求失败')
    err.code = data.code
    throw err
  }
  return data
}

export default {
  get(url, params) {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return request(url + query)
  },
  post(url, body) {
    return request(url, { method: 'POST', body: JSON.stringify(body) })
  },
  put(url, body) {
    return request(url, { method: 'PUT', body: JSON.stringify(body) })
  },
  delete(url) {
    return request(url, { method: 'DELETE' })
  },
}
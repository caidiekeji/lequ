import request from './request'
export default {
  revenue(params) { return request.get('/admin/analytics/revenue', params) },
  users(params) { return request.get('/admin/analytics/users', params) },
  licenses(params) { return request.get('/admin/analytics/licenses', params) },
  funnel(params) { return request.get('/admin/analytics/funnel', params) },
  channel(params) { return request.get('/admin/analytics/channel', params) },
  traffic(params) { return request.get('/admin/analytics/traffic', params) },
}

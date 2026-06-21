import request from './request'
export default {
  // channels
  list(params) { return request.get('/admin/channels', params) },
  detail(id) { return request.get(`/admin/channels/${id}`) },
  create(data) { return request.post('/admin/channels', data) },
  update(id, data) { return request.put(`/admin/channels/${id}`, data) },
  updateStatus(id, status) { return request.put(`/admin/channels/${id}/status`, { status }) },
  // commissions
  commissions(params) { return request.get('/admin/commissions', params) },
  settle(id) { return request.post(`/admin/commissions/${id}/settle`) },
  batchSettle(ids) { return request.post('/admin/commissions/batch-settle', { ids }) },
  exportCommissions(params) { return request.get('/admin/commissions/export', params) },
}

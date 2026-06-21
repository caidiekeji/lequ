import request from './request'
export default {
  list(params) { return request.get('/admin/users', params) },
  detail(id) { return request.get(`/admin/users/${id}`) },
  updateStatus(id, status) { return request.put(`/admin/users/${id}/status`, { status }) },
  resetPassword(id) { return request.post(`/admin/users/${id}/reset-password`) },
  setTags(id, tags) { return request.post(`/admin/users/${id}/tags`, { tags }) },
  batchOp(data) { return request.post('/admin/users/batch', data) },
  export(params) { return request.get('/admin/users/export', params) },
}

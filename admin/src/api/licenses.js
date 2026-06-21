import request from './request'
export default {
  list(params) { return request.get('/licenses', params) },
  detail(id) { return request.get(`/licenses/${id}`) },
  create(data) { return request.post('/licenses', data) },
  update(id, data) { return request.put(`/licenses/${id}`, data) },
  revoke(id) { return request.post(`/licenses/${id}/revoke`) },
  batchCreate(data) { return request.post('/admin/licenses/batch', data) },
  extend(id, data) { return request.post(`/admin/licenses/${id}/extend`, data) },
  upgrade(id, data) { return request.post(`/admin/licenses/${id}/upgrade`, data) },
  instances(params) { return request.get('/admin/instances', params) },
  policies(params) { return request.get('/admin/license-policies', params) },
  createPolicy(data) { return request.post('/admin/license-policies', data) },
  updatePolicy(id, data) { return request.put(`/admin/license-policies/${id}`, data) },
  deletePolicy(id) { return request.delete(`/admin/license-policies/${id}`) },
}

import request from './request'
export default {
  list(params) { return request.get('/licenses', params) },
  detail(id) { return request.get(`/licenses/${id}`) },
  create(data) { return request.post('/licenses', data) },
  update(id, data) { return request.put(`/licenses/${id}`, data) },
  revoke(id) { return request.post(`/licenses/${id}/revoke`) },
  batchCreate(data) { return request.post('/licenses/batch', data) },
  extend(id, data) { return request.post(`/licenses/${id}/extend`, data) },
  upgrade(id, data) { return request.post(`/licenses/${id}/upgrade`, data) },
  instances(id) { return request.get(`/licenses/${id}/instances`) },
  // policies
  policies(params) { return request.get('/license-policies', params) },
  createPolicy(data) { return request.post('/license-policies', data) },
  updatePolicy(id, data) { return request.put(`/license-policies/${id}`, data) },
  deletePolicy(id) { return request.delete(`/license-policies/${id}`) },
}

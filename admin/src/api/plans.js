import request from './request'
export default {
  list(params) { return request.get('/admin/plans', params) },
  detail(id) { return request.get(`/admin/plans/${id}`) },
  create(data) { return request.post('/admin/plans', data) },
  update(id, data) { return request.put(`/admin/plans/${id}`, data) },
  delete(id) { return request.delete(`/admin/plans/${id}`) },
  features() { return request.get('/admin/features') },
  createFeature(data) { return request.post('/admin/features', data) },
  updateFeature(id, data) { return request.put(`/admin/features/${id}`, data) },
  deleteFeature(id) { return request.delete(`/admin/features/${id}`) },
  coupons(params) { return request.get('/admin/coupons', params) },
  createCoupon(data) { return request.post('/admin/coupons', data) },
  updateCoupon(id, data) { return request.put(`/admin/coupons/${id}`, data) },
  deleteCoupon(id) { return request.delete(`/admin/coupons/${id}`) },
}

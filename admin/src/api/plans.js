import request from './request'
export default {
  list(params) { return request.get('/plans', params) },
  detail(id) { return request.get(`/plans/${id}`) },
  create(data) { return request.post('/plans', data) },
  update(id, data) { return request.put(`/plans/${id}`, data) },
  delete(id) { return request.delete(`/plans/${id}`) },
  // features
  features(planId) { return request.get(`/plans/${planId}/features`) },
  createFeature(planId, data) { return request.post(`/plans/${planId}/features`, data) },
  updateFeature(planId, featureId, data) { return request.put(`/plans/${planId}/features/${featureId}`, data) },
  deleteFeature(planId, featureId) { return request.delete(`/plans/${planId}/features/${featureId}`) },
  // coupons
  coupons(params) { return request.get('/coupons', params) },
  createCoupon(data) { return request.post('/coupons', data) },
  updateCoupon(id, data) { return request.put(`/coupons/${id}`, data) },
  deleteCoupon(id) { return request.delete(`/coupons/${id}`) },
}

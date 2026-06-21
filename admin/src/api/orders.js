import request from './request'
export default {
  list(params) { return request.get('/admin/orders', params) },
  detail(id) { return request.get(`/admin/orders/${id}`) },
  confirm(id) { return request.post(`/admin/orders/${id}/confirm`) },
  cancel(id) { return request.post(`/admin/orders/${id}/cancel`) },
  updatePrice(id, data) { return request.put(`/admin/orders/${id}/price`, data) },
  refund(id, data) { return request.post(`/admin/orders/${id}/refund`, data) },
  export(params) { return request.get('/admin/orders/export', params) },
  reconcile(params) { return request.get('/admin/orders/reconcile', params) },
  invoices(params) { return request.get('/admin/orders/invoices', params) },
  stats() { return request.get('/admin/orders/stats') },
}

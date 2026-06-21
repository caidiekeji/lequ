import request from './request'
export default {
  // notices
  notices(params) { return request.get('/admin/notices', params) },
  createNotice(data) { return request.post('/admin/notices', data) },
  updateNotice(id, data) { return request.put(`/admin/notices/${id}`, data) },
  deleteNotice(id) { return request.delete(`/admin/notices/${id}`) },
  toggleNotice(id) { return request.post(`/admin/notices/${id}/toggle`) },
  // notify templates
  notifyTemplates(params) { return request.get('/admin/notify-templates', params) },
  createNotifyTemplate(data) { return request.post('/admin/notify-templates', data) },
  updateNotifyTemplate(id, data) { return request.put(`/admin/notify-templates/${id}`, data) },
  deleteNotifyTemplate(id) { return request.delete(`/admin/notify-templates/${id}`) },
  // tickets
  tickets(params) { return request.get('/admin/tickets', params) },
  ticketDetail(id) { return request.get(`/admin/tickets/${id}`) },
  replyTicket(id, data) { return request.post(`/admin/tickets/${id}/reply`, data) },
  closeTicket(id) { return request.post(`/admin/tickets/${id}/close`) },
}

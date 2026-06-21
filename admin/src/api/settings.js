import request from './request'
export default {
  // admins
  admins() { return request.get('/admin/admins') },
  createAdmin(data) { return request.post('/admin/admins', data) },
  deleteAdmin(id) { return request.delete(`/admin/admins/${id}`) },
  updateAdmin(id, data) { return request.put(`/admin/admins/${id}`, data) },
  // roles
  roles() { return request.get('/admin/roles') },
  createRole(data) { return request.post('/admin/roles', data) },
  updateRole(id, data) { return request.put(`/admin/roles/${id}`, data) },
  deleteRole(id) { return request.delete(`/admin/roles/${id}`) },
  // system config
  config() { return request.get('/admin/config') },
  saveConfig(data) { return request.put('/admin/config', data) },
  // payment config
  paymentConfig() { return request.get('/admin/payment-config') },
  savePaymentConfig(data) { return request.put('/admin/payment-config', data) },
  // notify config
  notifyConfig() { return request.get('/admin/config/notify') },
  saveNotifyConfig(data) { return request.put('/admin/config/notify', data) },
  testNotify(channel, data) { return request.post(`/admin/config/notify/test/${channel}`, data) },
  // logs
  logs(params) { return request.get('/admin/logs/admin', params) },
  loginLogs(params) { return request.get('/admin/logs/login', params) },
  // system monitor
  monitor() { return request.get('/admin/system/monitor') },
}

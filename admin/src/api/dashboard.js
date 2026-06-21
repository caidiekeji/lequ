import request from './request'
export default {
  summary() { return request.get('/admin/dashboard/summary') },
  trends(params) { return request.get('/admin/dashboard/trends', params) },
  todos() { return request.get('/admin/dashboard/todos') },
}

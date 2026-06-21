import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/login', name: 'Login', component: () => import('../views/login/Login.vue'), meta: { title: '登录' } },
  {
    path: '/', component: () => import('../views/layout/MainLayout.vue'), redirect: '/dashboard',
    children: [
      // 仪表盘
      { path: 'dashboard', name: 'Dashboard', component: () => import('../views/dashboard/Dashboard.vue'), meta: { title: '仪表盘' } },
      
      // 用户管理
      { path: 'users', name: 'UserList', component: () => import('../views/users/UserList.vue'), meta: { title: '用户管理' } },
      { path: 'users/:id', name: 'UserDetail', component: () => import('../views/users/UserDetail.vue'), meta: { title: '用户详情' } },
      
      // 授权管理
      { path: 'licenses', name: 'LicenseList', component: () => import('../views/license/LicenseList.vue'), meta: { title: '授权管理' } },
      { path: 'licenses/create', name: 'LicenseCreate', component: () => import('../views/license/LicenseCreate.vue'), meta: { title: '创建授权' } },
      { path: 'licenses/:id', name: 'LicenseDetail', component: () => import('../views/license/LicenseDetail.vue'), meta: { title: '授权详情' } },
      
      // 订单管理
      { path: 'orders', name: 'OrderList', component: () => import('../views/orders/OrderList.vue'), meta: { title: '订单管理' } },
      { path: 'orders/:id', name: 'OrderDetail', component: () => import('../views/orders/OrderDetail.vue'), meta: { title: '订单详情' } },
      { path: 'orders/confirm', name: 'OrderConfirm', component: () => import('../views/orders/OrderConfirm.vue'), meta: { title: '订单处理' } },
      
      // 套餐管理
      { path: 'plans', name: 'PlanList', component: () => import('../views/plans/PlanList.vue'), meta: { title: '套餐管理' } },
      { path: 'plans/create', name: 'PlanCreate', component: () => import('../views/plans/PlanEdit.vue'), meta: { title: '创建套餐' } },
      { path: 'plans/:id/edit', name: 'PlanEdit', component: () => import('../views/plans/PlanEdit.vue'), meta: { title: '编辑套餐' } },
      
      // 运营管理
      { path: 'operations/notices', name: 'Notices', component: () => import('../views/operations/Notices.vue'), meta: { title: '公告管理' } },
      { path: 'operations/notify-templates', name: 'NotifyTemplates', component: () => import('../views/operations/NotifyTemplates.vue'), meta: { title: '通知模板' } },
      { path: 'operations/tickets', name: 'Tickets', component: () => import('../views/operations/Tickets.vue'), meta: { title: '工单管理' } },
      
      // 渠道管理
      { path: 'channel/channels', name: 'Channels', component: () => import('../views/channel/Channels.vue'), meta: { title: '渠道商管理' } },
      { path: 'channel/commissions', name: 'Commissions', component: () => import('../views/channel/Commissions.vue'), meta: { title: '佣金结算' } },
      
      // 数据分析
      { path: 'analytics', name: 'Analytics', component: () => import('../views/analytics/Analytics.vue'), meta: { title: '数据分析' } },
      
      // 系统设置
      { path: 'settings/admins', name: 'AdminList', component: () => import('../views/settings/AdminList.vue'), meta: { title: '管理员管理' } },
      { path: 'settings/roles', name: 'Roles', component: () => import('../views/settings/Roles.vue'), meta: { title: '角色权限' } },
      { path: 'settings/payment', name: 'PaymentConfig', component: () => import('../views/settings/PaymentConfig.vue'), meta: { title: '支付配置' } },
      { path: 'settings/config', name: 'SystemConfig', component: () => import('../views/settings/SystemConfig.vue'), meta: { title: '系统配置' } },
      { path: 'settings/notify', name: 'NotifyConfig', component: () => import('../views/settings/NotifyConfig.vue'), meta: { title: '通知配置' } },
      { path: 'settings/monitor', name: 'Monitor', component: () => import('../views/settings/Monitor.vue'), meta: { title: '系统监控' } },
      
      // 日志查看
      { path: 'logs', name: 'LogList', component: () => import('../views/logs/LogList.vue'), meta: { title: '操作日志' } },
      { path: 'logs/login', name: 'LoginLog', component: () => import('../views/logs/LoginLog.vue'), meta: { title: '登录日志' } },
    ],
  },
]

const router = createRouter({ history: createWebHashHistory(), routes })

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('shouquan_token')
  if (to.path !== '/login' && !token) next('/login')
  else if (to.path === '/login' && token) next('/')
  else next()
})

export default router

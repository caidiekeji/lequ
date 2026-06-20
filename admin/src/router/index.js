import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/login', name: 'Login', component: () => import('../views/login/Login.vue'), meta: { title: '登录' } },
  {
    path: '/', component: () => import('../views/layout/MainLayout.vue'), redirect: '/dashboard',
    children: [
      { path: 'dashboard', name: 'Dashboard', component: () => import('../views/dashboard/Dashboard.vue'), meta: { title: '仪表盘' } },
      { path: 'licenses', name: 'LicenseList', component: () => import('../views/license/LicenseList.vue'), meta: { title: '授权码管理' } },
      { path: 'licenses/create', name: 'LicenseCreate', component: () => import('../views/license/LicenseCreate.vue'), meta: { title: '创建授权码' } },
      { path: 'licenses/:id', name: 'LicenseDetail', component: () => import('../views/license/LicenseDetail.vue'), meta: { title: '授权码详情' } },
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
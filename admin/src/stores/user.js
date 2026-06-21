import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('shouquan_token') || '')
  const admin = ref(JSON.parse(localStorage.getItem('shouquan_admin') || '{}'))
  const permissions = ref([])

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => !!admin.value.username)

  function setToken(t) {
    token.value = t
    localStorage.setItem('shouquan_token', t)
  }
  function setAdmin(a) {
    admin.value = a
    localStorage.setItem('shouquan_admin', JSON.stringify(a))
  }
  function setPermissions(p) {
    permissions.value = p
  }
  function hasPermission(code) {
    return permissions.value.includes(code) || admin.value.role === 'super_admin'
  }
  function logout() {
    token.value = ''
    admin.value = {}
    permissions.value = []
    localStorage.removeItem('shouquan_token')
    localStorage.removeItem('shouquan_admin')
  }

  return { token, admin, permissions, isLoggedIn, isAdmin, setToken, setAdmin, setPermissions, hasPermission, logout }
})

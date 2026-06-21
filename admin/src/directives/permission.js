import { useUserStore } from '../stores/user'

export default {
  mounted(el, binding) {
    const store = useUserStore()
    const permission = binding.value
    if (permission && !store.hasPermission(permission)) {
      el.parentNode?.removeChild(el)
    }
  }
}

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/main.css'
import permissionDirective from './directives/permission.js'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.directive('permission', permissionDirective)
app.mount('#app')
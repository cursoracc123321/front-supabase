import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import SMTPAccounts from '@/views/SMTPAccounts.vue'
import EmailCampaigns from '@/views/EmailCampaigns.vue'

const routes = [
  { path: '/', redirect: '/accounts' },
  { path: '/login', component: Login },
  { path: '/accounts', component: SMTPAccounts },
  { path: '/campaigns', component: EmailCampaigns }
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

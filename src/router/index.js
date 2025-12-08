import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import SMTPAccounts from '@/views/SMTPAccounts.vue'
import EmailCampaigns from '@/views/EmailCampaigns.vue'

const routes = [
  { path: '/', redirect: '/accounts' },
  { path: '/login', component: Login },
  { path: '/accounts', component: SMTPAccounts },
  { path: '/campaigns', component: EmailCampaigns },
  {
    path: '/vps',
    name: 'VpsServers',
    component: () => import('@/views/VpsServers.vue'),
  },
  {
    path: '/smtp-servers',
    name: 'SMTPServers',
    component: () => import('@/views/SMTPServers.vue'),
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

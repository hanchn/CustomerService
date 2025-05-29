import { createRouter, createWebHistory } from 'vue-router'
import CustomerChat from '@/views/CustomerChat.vue'
import GroupChat from '@/views/GroupChat.vue'
import Home from '@/views/Home.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/customer-chat',
    name: 'CustomerChat',
    component: CustomerChat,
    meta: {
      title: '客户对话'
    }
  },
  {
    path: '/group-chat',
    name: 'GroupChat', 
    component: GroupChat,
    meta: {
      title: '群组对话'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
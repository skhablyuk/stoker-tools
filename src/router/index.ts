import { createRouter, createWebHistory } from 'vue-router'
import ToolsView from "@/views/ToolsView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/tools',
      name: 'tools',
      component: ToolsView
    },
  ]
})

export default router

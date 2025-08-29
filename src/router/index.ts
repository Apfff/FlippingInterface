import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import SimulationView from '../views/SimulationView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'simulation',
      component: SimulationView,
    },
    {
      path: '/editor',
      name: 'editor',
      component: () => import('../views/EditorView.vue'),
    },
  ],
})

export default router

import { createRouter, createWebHistory } from 'vue-router'

import Dashboard from '../components/Dashboard.vue'
import Books from '../components/Books.vue'
import Members from '../components/Members.vue'
import Borrowing from '../components/Borrowing.vue'
import Returns from '../components/Returns.vue'
import Reports from '../components/Reports.vue'
import Settings from '../components/Settings.vue'

const routes = [
  { path: '/', component: Dashboard },
  { path: '/books', component: Books },
  { path: '/members', component: Members },
  { path: '/borrowing', component: Borrowing },
  { path: '/returns', component: Returns },
  { path: '/reports', component: Reports },
  { path: '/settings', component: Settings }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
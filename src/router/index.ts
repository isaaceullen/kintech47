import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import AdminDashboard from '../views/AdminDashboard.vue';
import ProductManagement from '../views/AdminDashboard/ProductManagement.vue';
import OrderManagement from '../views/AdminDashboard/OrderManagement.vue';
import { supabase } from '../supabase';

const routes = [
  { path: '/', component: HomeView },
  { path: '/login', component: LoginView },
  {
    path: '/admin',
    component: AdminDashboard,
    meta: { requiresAuth: true },
    children: [
      { path: 'products', component: ProductManagement },
      { path: 'orders', component: OrderManagement },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (to.meta.requiresAuth && !session) {
    next('/login');
  } else {
    next();
  }
});

export default router;

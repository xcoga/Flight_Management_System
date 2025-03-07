import { createRouter, createWebHistory } from 'vue-router'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/flights',
      name: 'flights',
      component: () => import('../views/FlightsView.vue'),
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('../views/UsersView.vue'),
    },
  ],
})

//Navigation guard. Firebase forces a '?' operator for FlightsView fetchFlights which causes an error.
router.beforeEach((to, from, next) => {
  // If '?' is detected, abort the navigation.
  if (to.fullPath.includes('?') && from.name === to.name) {
    return next(false); 
  }
  next();
});
export default router

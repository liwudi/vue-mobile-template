import Vue from 'vue';
import Router from 'vue-router';
Vue.use(Router);

import Login from '@/views/Login/login';


let router = new Router({
  routes: [
    {
      path: '/',
      name: '/',
      component: Login,
      // component: () => import(/* webpackChunkName: "about" */ '../views/Login/login.vue')
    }
  ]
});

router.beforeEach((to, from, next) => {
  next(true);
})
export default router;

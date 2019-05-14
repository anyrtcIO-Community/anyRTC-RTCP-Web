import Vue from 'vue';
import Router from 'vue-router';
import Join from './views/Join.vue';
import Rtcp from './views/Rtcp.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'Join',
      component: Join,
    },
    {
      // path: '/rtcp/:roomId/:isHoster', 
      path: '/rtcp/:isHoster',
      name: 'Rtcp',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: Rtcp,
    },
  ],
});

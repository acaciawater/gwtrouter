import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/views/Home.vue'
import Map from '@/components/Map.vue'
import MySurvey from '@/components/Survey.vue'
import Login from '@/components/Login.vue'

Vue.use(Router)

export const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/map',
      name: 'map',
      component: Map
    },
    {
      path: '/survey',
      name: 'survey',
      component: MySurvey
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
    }
  ]
})

router.beforeEach((to, from, next) => {
  // redirect to login page if not logged in and trying to access a restricted page
  const publicPages = ['/login']
  const authRequired = !publicPages.includes(to.path)
  const token = sessionStorage.getItem('token')
  if (authRequired && !token) {
    console.debug('restricted: ' + to.fullPath)
    console.debug('redirecting to /login?nextUrl=' + to.fullPath)
    return next({
      path: '/login',
      query: { next: to.fullPath }
    })
  }
  next()
})

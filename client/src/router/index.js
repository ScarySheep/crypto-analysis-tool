import Vue from 'vue'
import Router from 'vue-router'
// import Register from '@/components/Register'
import Charts from '@/components/Charts'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'charts',
      component: Charts,
      props: true
    }
  ]
})

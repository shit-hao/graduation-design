import Vue from 'vue'
import Router from 'vue-router'
import game from '@/components/game'
import login from '@/components/login'



Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'index',
      component: login
    },
    {
      path: '/game',
      name: 'game',
      component: game
    }
  ]
})

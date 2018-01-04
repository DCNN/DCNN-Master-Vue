import Vue from 'vue'
import Router from 'vue-router'

import Master from '@/views/master'
import Slave from '@/views/slave'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/slave',
      name: 'slave',
      component: Slave
    }, {
      path: '/master',
      name: 'master',
      component: Master
    }, {
      path: '*',
      component: Master
    }
  ]
})

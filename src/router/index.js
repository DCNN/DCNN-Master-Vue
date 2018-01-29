import Vue from 'vue'
import Router from 'vue-router'

import Master from '@/views/master'
import MultiMaster from '@/views/master-multi'
import Slave from '@/views/slave'

Vue.use(Router)

export default new Router({
  // mode: 'history', disable history mode to support the http server
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
      path: '/multi',
      name: 'multi master',
      component: MultiMaster
    }, {
      path: '*',
      component: Master
    }
  ]
})

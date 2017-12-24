// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'

import router from './router'          // enable vue router
import store from './store/index.js'   // enable vuex

import Mint from 'mint-ui'
import 'mint-ui/lib/style.css'

import { ENV, NDArrayMath } from 'deeplearn';

Vue.use(Mint)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})

// deeplearnjs config
let math = new NDArrayMath('webgl', false)
ENV.setMath(math)

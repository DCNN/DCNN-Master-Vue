// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.min.css'

import { ENV, NDArrayMath } from 'deeplearn'

import router from './router'          // enable vue router
import store from './store/index.js'   // enable vuex

Vue.config.productionTip = false

// Vue Material
Vue.use(VueMaterial)

// HTTP REQ
Vue.use(VueAxios, axios)

// axios settings
Vue.axios.defaults.baseURL = 'http://localhost:8080'

// deeplearnjs config
let math = new NDArrayMath('webgl', false)
ENV.setMath(math)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})

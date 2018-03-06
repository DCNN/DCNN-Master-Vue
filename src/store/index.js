import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  strict: debug,
  state: {
    deviceInfo: {
      ip: null
    }
  },
  mutations: {
    setIP: (state, newIP) => {
      state.deviceInfo.ip = newIP
    }
  }
})

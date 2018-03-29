<template>
  <div id="slave">
    <md-button
      class="dcnn-button-large"
      type="default"
      size="large"
      v-for="(item, index) in ['load model', 'register']"
      :key="index"
      @click="onClick(item)"
    >
      {{ item }}
    </md-button>
    <md-content class="dcnn-message-area">{{ msg }}</md-content>
  </div>
</template>

<script>
import ConvWorker from '@/slave/conv-worker'

export default {
  name: 'slave',
  data () {
    return {
      worker: null,
      msg: 'This is a Slave Node.'
    }
  },
  methods: {
    onClick (type) {
      let that = this
      let switchObj = {
        'load model': async function () {
          await that.worker.loadModel()
          that.msg = 'Model Loaded...'
        },
        'register': async function () {
          try {
            await that.worker.registerToMaster()
            that.$toasted.show('Info: Registered')
          } catch (err) {
            that.$toasted.err('Error: Failed')
          }
        }
      }
      switchObj[type]()
    }
  },
  created () {
    this.worker = new ConvWorker()
  }
}
</script>

<style scoped>
#slave {
  margin-top: 2vh;
}
</style>


<template>
  <div id="slave">
    <md-button
      class="dcnn-button-large"
      type="default"
      size="large"
      @click="onClickLoadModel"
    >
      load model
    </md-button>
    <md-button
      class="dcnn-button-large"
      type="default"
      size="large"
      @click="onClickRegister"
    >
      register
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
      msg: 'This is a Slave Node.'
    }
  },
  methods: {
    onClickLoadModel () {
      ConvWorker.loadModel()
        .then(res => {
          this.msg = 'Model Loaded...'
        })
        .catch(err => {
          this.msg = err
          console.log(err)
        })
    },
    onClickRegister () {
      ConvWorker.registerToMaster()
        .then(res => {
          this.$toasted.show('Info: Registered')
        })
        .catch(err => {
          console.log(err)
          this.$toasted.show('Error: Failed')
        })
    }
  },
  created () {

  }
}
</script>

<style scoped>
#slave {
  margin-top: 2vh;
}
</style>


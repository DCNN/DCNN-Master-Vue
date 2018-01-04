<template>
  <div>
    <md-content class="slave-message">{{ msg }}</md-content>
  </div>
</template>

<script>
import ConvWorker from '@/slave/conv-worker'

export default {
  name: 'slave',
  data () {
    return {
      msg: 'Connect to the Server'
    }
  },
  created () {
    ConvWorker.loadModel()
      .then(res => {
        this.msg += '\nModel Loaded...'
        return ConvWorker.startWorkForMaster()
      })
      .then(res => {
        this.msg = '\nWorking for the Master...'
      })
      .catch(err => {
        console.log(err)
      })

  }
}
</script>

<style>
.slave-message {
  text-align: left;
  overflow: scroll;
  word-break: break-all;
  margin: 2vh auto;
  padding: 2vh 2vw;
  height: 50vh;
  width: 90vw;
  background-color: rgba(0, 0, 0, 0.1);
  color: black;
}
</style>


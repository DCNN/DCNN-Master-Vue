<template>
  <div>
    <md-button
      class="home-btn"
      type="default"
      size="large"
      @click="onClickLoadImageData"
    >
      load image
    </md-button>
    <md-button
      class="home-btn"
      type="default"
      size="large"
      @click="onClickInfer"
    >
      infer
    </md-button>
    <md-button
      class="home-btn"
      type="default"
      size="large"
      @click="onClickConnect"
    >
      connect
    </md-button>
    <md-button
      class="home-btn"
      type="default"
      size="large"
      @click="onClickSendData"
    >
      send
    </md-button>
    <div class="home-message">{{ result }}</div>
  </div>
</template>

<script>
import { Array1D, NDArrayMathGPU, Scalar } from 'deeplearn'

import SimpleConv from '@/kernels/simple-conv'
import wsc from '@/kernels/web-socket-client'

export default {
  name: 'home',
  data () {
    return {
      result: null,
      tensor4D: null  // image data [batch_size][weight][width][channel]
    }
  },
  methods: {
    onClickLoadImageData () {
      this.$http.get('/static/cifar-10/test-imgs-data/data.json')
      .then(res => {
        console.log(res)
      })
      .catch(err => {
        console.log(err)
      })
    },
    onClickInfer () {
      console.log('load img first')
    },
    onClickConnect () {
      wsc.createConnection('ws://192.168.2.100:8888')
      wsc.setUpListeners()
    },
    onClickSendData () {
      let testJsonMsg = {
        data: 'hi, server'
      }
      wsc.sendMsg(testJsonMsg)
    }
  },
  created () {
  }
}
</script>

<style scoped>
.home-message {
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

.home-btn {
  width: 92vw;
  margin: 1vh auto;
}
</style>

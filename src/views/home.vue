<template>
  <div class="home">
    <mt-header class="home-header" fixed title="DCNN"></mt-header>
    <mt-button
      class="home-btn"
      type="default"
      size="large"
      @click="onClickLoad"
    >
      load
    </mt-button>
    <mt-button
      class="home-btn"
      type="default"
      size="large"
      @click="onClickInfer"
    >
      infer
    </mt-button>
    <mt-button
      class="home-btn"
      type="default"
      size="large"
      @click="onClickConnect"
    >
      connect
    </mt-button>
    <mt-button
      class="home-btn"
      type="default"
      size="large"
      @click="onClickSendData"
    >
      send
    </mt-button>
    <div class="home-message">{{ result }}</div>
    <canvas
      id="process-stage"
      v-if="showStage"
    />
  </div>
</template>

<script>
import { Toast } from 'mint-ui'
import { Array1D, NDArrayMathGPU, Scalar } from 'deeplearn'

import SimpleConv from '@/kernels/simple-conv'
import wsc from '@/kernels/web-socket-client'

export default {
  name: 'home',
  data () {
    return {
      result: null,
      showStage: false
    }
  },
  methods: {
    onClickLoad () {
      Jimp.read('/static/cifar-10/test-imgs/airplane2.png')
      .then(res => {
        console.log(res.bitmap.data)
      })
      .catch(err => {
        console.log(err)
      })
    },
    onClickInfer () {
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
.home-header {
  background-color: gainsboro;
  color: black;
}

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

<template>
  <div>
    <md-button
      class="home-btn"
      type="default"
      size="large"
      @click="onClickLoadImage"
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
      @click="onClickMultiInfer"
    >
      multi infer
    </md-button>
    <md-button
      class="home-btn"
      type="primary"
      size="large"
      @click="onClickTestModelCutter"
    >
      Test
    </md-button>
    <md-content class="home-message">{{ result }}</md-content>
  </div>
</template>

<script>
import { Array1D, NDArrayMathGPU, Scalar } from 'deeplearn'

// self-defined modules
import Cifar10 from '@/kernels/cifar-10'

// debug only
import ModelCutter from '@/kernels/model-cutter'

export default {
  name: 'home',
  data () {
    return {
      result: null,
      tensor1D: null  // image data [batch_size * height * width * channel]
    }
  },
  methods: {
    onClickLoadImage () {
      this.$http.get('/static/cifar-10/test-imgs-data/data.json')
        .then(res => {
          this.tensor1D = res.data
          console.log(this.tensor1D)
        })
        .catch(err => {
          console.log(err)
        })
    },
    onClickInfer () {
      if (this.tensor1D === null) {
        this.$toasted.show('please load img first')
        return
      }
      Cifar10.loadModel()
        .then(res => {
          return Cifar10.performInference(this.tensor1D)
        })
        .then(res => {
          console.log(res)
        })
        .catch(err => {
          console.log(err)
        })
    },
    onClickMultiInfer () {
      if (this.tensor1D === null) {
        this.$toasted.show('please load img first')
        return
      }
      Cifar10.loadModel()
        .then(res => {
          console.log('model loaded')
          return Cifar10.performMultiInference(this.tensor1D)
        })
        .then(res => {
          console.log(res)
        })
        .catch(err => {
          console.log(err)
        })
    },
    onClickTestModelCutter () {
      let test1DTensor = [
        [
          [ [1, 1, 1], [2, 2, 2], [3, 3, 3], [1, 1, 1] ],
          [ [4, 4, 4], [5, 5, 5], [6, 6, 6], [1, 1, 1] ],
          [ [7, 7, 7], [8, 8, 8], [9, 9, 9], [1, 1, 1] ],
          [ [10, 10, 10], [11, 11, 11], [12, 12, 12], [1, 1, 1] ]
        ]
      ]
      test1DTensor = ModelCutter.flattenArray(test1DTensor)
      console.log(ModelCutter.cutterTensor1D(test1DTensor, [1, 4, 4, 3], 0, 1))
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

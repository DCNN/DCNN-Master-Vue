<template>
  <div class="master">
    <md-button
      class="dcnn-button-large"
      type="default"
      size="large"
      @click="onClickLoadImage"
    >
      load image
    </md-button>
    <md-button
      class="dcnn-button-large"
      type="default"
      size="large"
      @click="onClickInfer"
    >
      infer
    </md-button>
    <md-button
      class="dcnn-button-large"
      type="default"
      size="large"
      @click="onClickTest"
    >
      Test
    </md-button>
    <md-content class="dcnn-message-area">{{ result }}</md-content>
  </div>
</template>

<script>
import Cifar10 from '@/kernels/cifar-10'
// debug only
import TensorCutter from '@/kernels/tensor-cutter'

export default {
  name: 'master',
  data () {
    return {
      result: null,
      tensor1D: null  // image data [batch_size * height * width * channel]
    }
  },
  methods: {
    // OnClick Listeners
    onClickLoadImage () {
      this.$http.get('/static/cifar-10/test-imgs-data/data.json')
        .then(res => {
          this.tensor1D = res.data
          this.$toasted.show('Success: load image')
        })
        .catch(err => {
          console.log(err)
        })
    },
    onClickInfer () {
      if (this.tensor1D === null) {
        this.$toasted.show('Error: Please load images first')
        return
      }
      Cifar10.loadModel()
        .then(res => {
          return Cifar10.performInference(this.tensor1D)
        })
        .then(res => {
          this.result = res
          this.$toasted.show('Success: Inference finished')
        })
        .catch(err => {
          console.log(err)
        })
    },

    // test
    onClickTest () {
    },

    // Debug only
    onClickTestTensorCutter () {
      let test1DTensor = [
        [
          [ [1, 1, 1], [2, 2, 2], [3, 3, 3], [1, 1, 1] ],
          [ [4, 4, 4], [5, 5, 5], [6, 6, 6], [1, 1, 1] ],
          [ [7, 7, 7], [8, 8, 8], [9, 9, 9], [1, 1, 1] ],
          [ [10, 10, 10], [11, 11, 11], [12, 12, 12], [1, 1, 1] ]
        ]
      ]
      test1DTensor = TensorCutter.flattenArray(test1DTensor)
      console.log(TensorCutter.cutterTensor1D(test1DTensor, [1, 4, 4, 3], 0, 1))
    }
  },
  created () {}
}
</script>

<style scoped>
.master {
  margin-top: 2vh;
}
</style>


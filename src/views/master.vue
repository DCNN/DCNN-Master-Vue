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
import Tensor from '@/kernels/tensor'

export default {
  name: 'master',
  data () {
    return {
      engine: null,
      result: null,
      tensor1D: null  // image data [batch_size * height * width * channel]
    }
  },
  methods: {
    // OnClick Listeners
    onClickLoadImage () {
      let start = new Date()
      if (this.tensor1D !== null) {
        this.$toasted.show('Info: image already loaded')
        return
      }
      this.$http.get('/static/cifar-10/test-imgs-data/data.json')
        .then(res => {
          this.tensor1D = res.data
          this.$toasted.show('Success: load image')
          this.$toasted.show('load image cost:' + (new Date() - start))
        })
        .catch(err => {
          console.log(err)
        })
    },
    onClickInfer () {
      let start = new Date()
      if (this.tensor1D === null) {
        this.$toasted.show('Error: Please load images first')
        return
      }
      this.engine.loadModel()
        .then(res => {
          return this.engine.performInference(this.tensor1D)
        })
        .then(res => {
          this.result = res
          this.$toasted.show('Success: Inference finished')
          this.$toasted.show('inference cost:' + (new Date() - start))
        })
        .catch(err => {
          console.log(err)
        })
    },

    // test
    onClickTest () {
      let test1DTensor = [
        [
          [ [1, 1, 1], [2, 2, 2], [3, 3, 3], [1, 1, 1] ],
          [ [4, 4, 4], [5, 55, 5], [6, 6, 6], [1, 1, 1] ]
        ],
        [
          [ [1, 1, 1], [2, 2, 2], [3, 3, 3], [1, 1, 1] ],
          [ [4, 4, 4], [5, 65, 5], [6, 6, 6], [1, 1, 1] ]
        ]
      ]
      test1DTensor = Tensor.flattenArray(test1DTensor)

      console.log(Tensor.structureTensor1D(test1DTensor, [2, 2, 4, 3]))
    }
  },
  created () {
    this.engine = new Cifar10()
  }
}
</script>

<style scoped>
.master {
  margin-top: 2vh;
}
</style>

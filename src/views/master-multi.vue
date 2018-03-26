<template>
  <div id="multi-master">
    <md-button
      class="dcnn-button-large"
      type="default"
      size="large"
      v-for="(item, index) in ['load image', 'multi infer']"
      :key="index"
      @click="onClick(item)"
    >
      {{ item }}
    </md-button>
    <md-content class="dcnn-message-area">{{ result }}</md-content>
  </div>
</template>

<script>
// self-defined modules
import Cifar10 from '@/kernels/cifar-10'

export default {
  name: 'multi-master',
  data () {
    return {
      result: null,
      tensor1D: null  // image data [ batch_size * height * width * channel ]
    }
  },
  methods: {
    onClick (type) {
      switch (type) {
        case 'load image':
          this.$http.get('/static/cifar-10/test-imgs-data/data.json')
          .then(res => {
            this.tensor1D = res.data
            this.$toasted.show('Success: load image')
          })
          .catch(err => {
            console.log(err)
          })
          break
        case 'multi infer':
          this.onClickMultiInfer()
          break
      }
    },
    onClickMultiInfer () {
      if (this.tensor1D === null) {
        this.$toasted.show('Error: Please load images first')
        return
      }

      Cifar10.performMultiInference(this.tensor1D)
      // There is no need to load model here.
      // Cifar10.performMultiInference(this.tensor1D)
      //   .then(res => {
      //     console.log(res)
      //   })
      //   .catch(err => {
      //     console.log(err)
      //   })
    }
  }
}
</script>

<style scoped>
#multi-master {
  margin-top: 2vh;
}
</style>


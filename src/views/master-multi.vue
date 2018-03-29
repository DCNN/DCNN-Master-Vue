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
      engine: null,
      result: null,
      tensor1D: null  // image data [ batch_size * height * width * channel ]
    }
  },
  methods: {
    onClick (type) {
      let that = this
      let switchObj = {
        'load image': async function () {
          try {
            let res = await that.$http.get('/static/cifar-10/test-imgs-data/data.json')
            that.tensor1D = res.data
            that.$toasted.show('Success: load image')
          } catch (error) {
            console.log(error)
          }
        },
        'multi infer': function () {
          if (that.tensor1D === null) {
            that.$toasted.show('Error: Please load images first')
            return
          }
          that.engine.performMultiInference(that.tensor1D)
        }
      }
      switchObj[type]()
    }
  },
  created () {
    this.engine = new Cifar10()
  }
}
</script>

<style scoped>
#multi-master {
  margin-top: 2vh;
}
</style>


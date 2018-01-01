/* eslint-disable */
import {
  Array1D, Array2D, Array3D, Array4D,
  ENV, CheckpointLoader
} from 'deeplearn'

export default {
  batchSize: 1,
  inputShape: [24, 24],

  // Model Desc
  conv1Biases: null,
  conv1Weights: null,
  conv2Biases: null,
  conv2Weights: null,
  local3Biases: null,
  local3Weights: null,
  local4Biases: null,
  local4Weights: null,
  softmaxBiases: null,
  softmaxWeights: null,

  // NDArrayMathGPU
  math: ENV.math,

  // Labels: 1D tensor of [batch_size] size
  label: null,

  loadModel () {
    const varLoader = new CheckpointLoader('./static/cifar-10/14646/')
    return new Promise((resolve, reject) => {
      varLoader.getAllVariables()
        .then(vars => {
          // Conv 1
          this.conv1Biases = vars['conv1/biases']      // 64
          this.conv1Weights = vars['conv1/weights']    // 5 5 3 64

          // Conv 2
          this.conv2Biases = vars['conv2/biases']      // 64
          this.conv2Weights = vars['conv2/weights']    // 5 5 64 64

          // Local 3
          this.local3Biases = vars['local3/biases']    // 384
          this.local3Weights = vars['local3/weights']  // 2304 384

          // Local 4
          this.local4Biases = vars['local4/biases']    // 192
          this.local4Weights = vars['local4/weights']  // 384 192

          // Softmax
          this.softmaxBiases = vars['softmax_linear/biases']    // 10
          this.softmaxWeights = vars['softmax_linear/weights']  // 192 10

          resolve()
        })
        .catch(err => {
          reject(err)
        })
    })
  },

  // perform the inference of cifar-10 network
  // tensor1D: 1D tensor [batch_szie * height * width * channel]
  performInference: function (tensor1D) {
    return new Promise((resolve, reject) => {
      let tensor4D = Array4D.new([this.batchSize, this.inputShape[0], this.inputShape[1], 3], tensor1D)
      this.loadModel()
        .then(res => {
          // Conv: layer 1
          let conv1 = this.math.conv2d(tensor4D, this.conv1Weights, this.conv1Biases, [1, 1], 'same')
          conv1 = this.math.relu(conv1)
          let pool1 = this.math.maxPool(conv1, [3, 3], [2, 2], 'same')

          // Conv: layer 2
          let conv2 = this.math.conv2d(pool1, this.conv2Weights, this.conv2Biases, [1, 1], 'same')
          conv2 = this.math.relu(conv2)
          let pool2 = this.math.maxPool(conv2, [3, 3], [2, 2], 'same')

          // flatten tensor, ready to perform matrix multiplication
          let [curB, curH, curW, curC] = pool2.shape
          pool2 = pool2.reshape([this.batchSize, curH * curW * curC])

          // Local: layer 3
          let local3 = this.math.matMul(pool2, this.local3Weights)
          local3 = this.math.add(local3, this.local3Biases)
          local3 = this.math.relu(local3)

          // Local: layer 4
          let local4 = this.math.matMul(local3, this.local4Weights)
          local4 = this.math.add(local4, this.local4Biases)
          local4 = this.math.relu(local4)

          // // Softmax: layer 5
          let softmax5 = this.math.matMul(local4, this.softmaxWeights)
          softmax5 = this.math.add(softmax5, this.softmaxBiases)
          softmax5 = this.math.softmax(softmax5)

          resolve(softmax5.dataSync())
        })
        .catch(err => {
          reject(err)
        })
    })
  }
}

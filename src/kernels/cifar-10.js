/* eslint-disable */
import {
  Array1D, Array2D, Array3D, Array4D,
  ENV, CheckpointLoader
} from 'deeplearn'

import mathExtra from '@/kernels/math-extra'
import taskManager from '@/kernels/task-manager'

export default {
  // ws pre settings
  wsServerIP: 'ws://192.168.1.112:8888',

  // cnn pre settings
  batchSize: 4,
  inputShape: [24, 24],
  labels: [
    'airplane', 'automobile', 'bird', 'cat', 'deer',
    'dog', 'frog', 'horse', 'ship', 'truck'
  ],

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

  _loadModel () {
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

  // pre-process image data
  _standardlizeImageData: function (tensor1D) {
    let batchLength = this.inputShape[0] * this.inputShape[1]
    for (let i = 0; i < tensor1D.length; i += batchLength) {
      let mean = mathExtra.meanFromTo(tensor1D, i, i + batchLength)
      let stddev = mathExtra.stddevFromTo(tensor1D, i, i + batchLength)
      for (let j = i; j < i + batchLength; ++j) {
        tensor1D[j] = (tensor1D[j] - mean) / stddev
      }
    }
  },

  // perform the inference of cifar-10 network, with only 1 device
  // tensor1D: 1D tensor [batch_szie * height * width * channel]
  performInference: function (tensor1D) {
    return new Promise((resolve, reject) => {
      this._standardlizeImageData(tensor1D)
      console.log(tensor1D)
      let tensor4D = Array4D.new([this.batchSize, this.inputShape[0], this.inputShape[1], 3], tensor1D)
      this._loadModel()
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
  },

  performMultiInference: function (tensor1D) {
    return new Promise((resolve, reject) => {
      taskManager.createConnection(this.wsServerIP)
        .then(res => {
          return taskManager.sendMsg({
            op: 'sendModel',
            data: [3, 2, 1]
          })
        })
        .then(res => {
          console.log('Server Respond:', res)
          return taskManager.sendMsg({
            op: 'sendInputTensor',
            data: [1, 2, 3]
          })
        })
        .then(res => {
          console.log('Server Respond:', res)
          resolve(res)
        })
        .catch(err => {
          console.log(err)
          reject(err)
        })
        .finally(() => {
          taskManager.closeConnection()
        })
    })
  }
}

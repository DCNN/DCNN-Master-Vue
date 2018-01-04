/**
 * @fileoverview Contains inference operations on CIFAR-10 dataset.
 * @author alex-myzhao@github.com (Alex Chao)
 */

/* eslint-disable */
import {
  Array1D, Array2D, Array3D, Array4D,
  ENV, CheckpointLoader
} from 'deeplearn'

import mathExtra from '@/kernels/math-extra'
import taskManager from '@/kernels/task-manager'
import cifarSettings from '@/settings/cifar-settings'

export default {
  /**
   *  Model Desc
   */
  conv1Biases: null,     // 64
  conv1Weights: null,    // 5 5 3 64
  conv2Biases: null,     // 64
  conv2Weights: null,    // 5 5 3 64
  local3Biases: null,    // 384
  local3Weights: null,   // 2304 384
  local4Biases: null,    // 192
  local4Weights: null,   // 384 192
  softmaxBiases: null,   // 10
  softmaxWeights: null,  // 192 10

  /**
   *  NDArrayMathGPU
   */
  math: ENV.math,

  /**
   *  Pre-Processes Image Data on 1D tensor.
   * @param {Array} tensor1D
   * @returns {null}
   */
  _standardlizeImageData: function (tensor1D) {
    let batchLength = cifarSettings.inputShape[0] * cifarSettings.inputShape[1]
    for (let i = 0; i < tensor1D.length; i += batchLength) {
      let mean = mathExtra.meanFromTo(tensor1D, i, i + batchLength)
      let stddev = mathExtra.stddevFromTo(tensor1D, i, i + batchLength)
      for (let j = i; j < i + batchLength; ++j) {
        tensor1D[j] = (tensor1D[j] - mean) / stddev
      }
    }
  },

  /**
   * Load Model from NetFiles
   * @returns {Promise}
   */
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

  /**
   * Performs the inference of cifar-10 network, with only 1 device.
   * @param {Array} tensor1D: 1D tensor [batch_szie * height * width * channel]
   * @returns {Promise}
   */
  performInference: function (tensor1D) {
    return new Promise((resolve, reject) => {
      try {
        this._standardlizeImageData(tensor1D)
        let tensor4D = Array4D.new([cifarSettings.batchSize, cifarSettings.inputShape[0], cifarSettings.inputShape[1], 3], tensor1D)

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
        pool2 = pool2.reshape([cifarSettings.batchSize, curH * curW * curC])

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

        // resolve result
        resolve(softmax5.dataSync())
      } catch (err) {
        reject(err)
      }
    })
  },

  /**
   * Performs the inference of cifar-10 network, with multi devices.
   * @param {Array} tensor1D: 1D tensor [batch_szie * height * width * channel]
   * @returns {Promise}
   */
  performMultiInference: function (tensor1D) {
    return new Promise((resolve, reject) => {
      taskManager.createConnection(cifarSettings.wsServerIP)
        .then(res => {
          console.log('-- Status: Connection Formed --')
          let layer1 = {
            convBiasesInfo: [ this.conv1Biases.dataSync(), [64] ],
            convWeightsInfo: [ this.conv1Weights.dataSync(), [5, 5, 3, 64] ]
          }
          let layer2 = {
            convBiasesInfo: [ this.conv2Biases.dataSync(), [64] ],
            convWeightsInfo: [ this.conv2Weights.dataSync(), [5, 5, 3, 64] ]
          }
          return taskManager.sendModel([layer2])
          // return taskManager.sendModel([layer1, layer2])
        })
        // .then(res => {
        //   console.log('-- Status: Model Deployed --')
        //   console.log('Server Respond:', res)
        //   /** TODO: Divide Tensor Here  */
        //   return taskManager.sendMsg({
        //     op: 'sendInputTensor',
        //     data: tensor1D
        //   })
        // })
        .then(res => {
          // console.log('-- Status: Task Finished --')
          console.log('Server Respond:', res)
          console.log(res)
        })
        .catch(err => {
          console.log(err)
          reject(err)
        })
        // .finally(() => {
        //   taskManager.closeConnection()
        // })
    })
  }
}

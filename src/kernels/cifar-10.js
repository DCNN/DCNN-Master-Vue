/**
 * @fileoverview Contains inference operations on CIFAR-10 dataset. This is the master operations.
 * @author alex-myzhao@github.com (Alex Chao)
 */

/* eslint-disable */
import {
  Array1D, Array2D, Array3D, Array4D,
  ENV, CheckpointLoader
} from 'deeplearn'

import MathExtra from '@/kernels/math-extra'
import WSServer from '@/kernels/ws-server'
import CifarSettings from '@/settings/cifar-settings'
import Tensor from '@/kernels/tensor'

class Cifar10 {
  constructor () {
    this.server = new WSServer()

    // Model Descriptions {NDArray}
    this.conv1Biases = null     // 64
    this.conv1Weights = null    // 5 5 3 64
    this.conv2Biases = null     // 64
    this.conv2Weights = null    // 5 5 3 64
    this.local3Biases = null    // 384
    this.local3Weights = null   // 2304 384
    this.local4Biases = null    // 192
    this.local4Weights = null   // 384 192
    this.softmaxBiases = null   // 10
    this.softmaxWeights = null  // 192 10

    // Mark if the model has been loaded
    this.isModelLoaded = false

    // NDArrayMathGPU
    this.math = ENV.math

    // Multi-Inference only
    this.processingTensor1D = []  // processing tensor
    this.reduceCollector = {}
    this.processingStage = null     // 'Wait4Conv1', 'Wait4Conv2'
    this.workerInitRange = null
    this.workerMaintainRange = null
  }

  /**
   * Pre-Processes Image Data on 1D tensor.
   * Same with the pre-processing methods during training period.
   * @param {Array} resultTensor1D [batch_size * height * width * channel]
   * @returns {Array} [batch_size]
   */
  _translateResult (resultTensor1D) {
    let resultList = []
    let labelNum = CifarSettings.LABELS.length
    for (let i = 0; i < resultTensor1D.length; i += labelNum) {
      let maxIndex = 0
      for (let j = 0; j < labelNum; ++j) {
        if (resultTensor1D[i + j] > resultTensor1D[i + maxIndex]) {
          maxIndex = j
        }
      }
      resultList.push(CifarSettings.LABELS[maxIndex])
    }
    return resultList
  }

  /**
   * Pre-Processes Image Data on 1D tensor.
   * Same with the pre-processing methods during training period.
   * @param {Array} tensor1D
   * @returns {null}
   */
  _standardlizeImageData (tensor1D) {
    let batchLength = CifarSettings.IMAGE_HEIGHT * CifarSettings.IMAGE_WIDTH
    for (let i = 0; i < tensor1D.length; i += batchLength) {
      let mean = MathExtra.meanFromTo(tensor1D, i, i + batchLength)
      let stddev = MathExtra.stddevFromTo(tensor1D, i, i + batchLength)
      for (let j = i; j < i + batchLength; ++j) {
        tensor1D[j] = (tensor1D[j] - mean) / stddev
      }
    }
  }

  /**
   * DCNN only.
   * Compute the height range of each worker.
   * @returns {Array} ['the_range_workers_received', 'the_range_workers_responsible']
   */
  _computeWorkerRanges () {
    let height = CifarSettings.IMAGE_HEIGHT
    let averHeight = Math.floor(height / CifarSettings.WORKER_META.length)
    let paddingHeight = Math.floor(CifarSettings.MAX_FILTER_SIZE / 2)
    let workerInitRange =  []
    let workerMaintainRange = []
    let cursor = 0
    for (let i = 0; i < CifarSettings.WORKER_META.length; ++i) {
      if (i === 0) {
        cursor = averHeight
        workerInitRange.push([0, cursor + paddingHeight])
        workerMaintainRange.push([0, cursor])
      } else if (i === CifarSettings.WORKER_META.length - 1) {
        workerInitRange.push([cursor - paddingHeight, height])
        workerMaintainRange.push([cursor, height])
        cursor = height
      } else {
        workerInitRange.push([cursor - paddingHeight, cursor + averHeight + paddingHeight])
        workerMaintainRange.push([cursor, cursor + averHeight])
        cursor += averHeight
      }
    }
    return [workerInitRange, workerMaintainRange]
  }

  /**
   * DCNN only.
   * Set up Master's listeners.
   */
  _registerMasterListeners () {
    this.server.setListener('reduce', data => {
      let ip = data.sourceIP
      let layerName = data.layerName
      this.reduceCollector[ip] = data.result
      console.log('receive result from the worker')
      console.log(data.result)
    })
    // perform reduce & update

    // this.server.setListener("result", data => {
    //   let range2Update = this.workerInitRange[id]
    //   Tensor.updateTensor1D(
    //     this.processingTensor1D,
    //     CifarSettrings.INPUT_TENSOR,
    //     range2Update[0],
    //     range2Update[1],
    //     data
    //   )
      // this.processingTensor1D
    // })
  }

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

          this.isModelLoaded = true
          resolve()
        })
        .catch(err => {
          reject(err)
        })
    })
  }

  /**
   * Performs the local inference of cifar-10 network, with only 1 device.
   * @param {Array} tensor1D: 1D tensor [batch_szie * height * width * channel]
   * @returns {Promise}
   */
  performInference (tensor1D) {
    if (!this.isModelLoaded) {
      return Promise.reject('Error: Model Not Loaded')
    }

    return new Promise((resolve, reject) => {
      try {
        this._standardlizeImageData(tensor1D)
        let tensor4D = Array4D.new(CifarSettings.INPUT_TENSOR, tensor1D)

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
        pool2 = pool2.reshape([CifarSettings.BATCH_SIZE, curH * curW * curC])

        // Local: layer 3
        let local3 = this.math.matMul(pool2, this.local3Weights)
        local3 = this.math.add(local3, this.local3Biases)
        local3 = this.math.relu(local3)

        // Local: layer 4
        let local4 = this.math.matMul(local3, this.local4Weights)
        local4 = this.math.add(local4, this.local4Biases)
        local4 = this.math.relu(local4)

        // Softmax: layer 5
        let softmax5 = this.math.matMul(local4, this.softmaxWeights)
        softmax5 = this.math.add(softmax5, this.softmaxBiases)
        softmax5 = this.math.softmax(softmax5)

        // resolve result
        resolve(this._translateResult(softmax5.dataSync()))
      } catch (err) {
        reject(err)
      }
    })
  }

  /**
   * DCNN only.
   * Performs the inference of cifar-10 network, with multi devices.
   * @param {Array} tensor1D: 1D tensor [batch_szie * height * width * channel]
   * @returns {Promise}
   */
  performMultiInference (tensor1D) {
    // preparation
    this._standardlizeImageData(tensor1D)
    this.processingTensor1D = tensor1D

    [this.workerInitRange, this.workerMaintainRange] = this._computeWorkerRanges()
    // let tmpRecord = this._computeWorkerRanges()
    // this.workerInitRange = tmpRecord[0]
    // this.workerMaintainRange = tmpRecord[1]

    console.log(this.workerMaintainRange)

    let tensorParts = []
    for (let i = 0; i < this.workerInitRange.length; ++i) {
      tensorParts.push(Tensor.cutterTensor1D(
        tensor1D,
        CifarSettrings.INPUT_TENSOR,
        this.workerInitRange[i][0], this.workerInitRange[i][1]))
    }

    console.log(tensorParts)

    // register listeners
    this._registerMasterListeners()

    // send tensorParts
    this.server.createConnection(CifarSettings.WS_SERVER_IP)
      .then(res => {
        console.log('Info: Connection Formed')
        for (let j = 0; j < CifarSettings.WORKER_META.length; ++j) {
          this.server.sendMsg({
            func: 'calConv',
            data: {
              targetIP: CifarSettings.WORKER_META[j].ip,
              layerName: 'conv1',
              data: tensorParts[j]
            }
          })
          console.log('Info: send tensor')
        }
      })
      .catch(err => {
        console.log(err)
      })

    // return new Promise((resolve, reject) => {
    //   this.server.createConnection(CifarSettings.serverIP)
    //     .then(res => {
    //       console.log('> Status: Connection Formed')
    //       resolve(res)
    //     })
    //     .catch(err => {
    //       console.log(err)
    //       reject(err)
    //     })
    // })
  }
}

export default Cifar10

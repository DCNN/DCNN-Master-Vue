/* eslint-disable */
import {
  Array1D, Array2D, Array3D, Array4D,
  ENV, CheckpointLoader
} from 'deeplearn'

import CifarSettings from '@/settings/cifar-settings'
import TensorCutter from '@/kernels/tensor-cutter'

export default {
  /**
   * Maintain a WebSocket Instance
   */
  ws: null,

  localIP: null,

  dataRange: null,
  localTensor4D: null,  // {Array4D} Keep half-done result of the inference

  // part of the model
  conv1Biases: null,
  conv1Weights: null,
  conv2Biases: null,
  conv2Weights: null,

  /**
   * Start to work for the server.
   * @returns {Promise} Returns a resolved promise when connection is built.
   */
  startWorkForMaster: function () {
    return new Promise((resolve, reject) => {
      // create connection
      this.ws = new WebSocket(CifarSettings.wsServerIP)

      // set up listeners
      this.ws.onopen = (event) => {
        resolve(event)
      }

      this.ws.onerror = (event) => {
        reject(event)
      }

      this.ws.onmessage = (event) => {
        let recData = JSON.parse(event.data)
        if (recData.op === 'init') {
          this.dataRange = recData.range
          this._handleInitOp(recData.shape, recData.tensor1D, recData.overlapSize)
        }
      }
    })
  },

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

          resolve()
        })
        .catch(err => {
          reject(err)
        })
    })
  },

  _handleInitOp (shape, tensor1D, overlap) {
    this.localTensor4D = Array4D.new(shape, tensor1D)

    // perform the conv op of layer 1
    this.localTensor4D = this.math.conv2d(this.localTensor4D, this.conv1Weights, this.conv1Biases, [1, 1], 'same')
    this.localTensor4D = this.math.relu(this.localTensor4D)
    this.localTensor4D = this.math.maxPool(this.localTensor4D, [3, 3], [2, 2], 'same')

    let result1Dtensor = this.localTensor4D.dataSync()
    let newRange = [this.dataRange[0], this.dataRange[1]]

    if (this.dataRange[0] === 0) {
      result1Dtensor = TensorCutter.cutterTensor1D(result1Dtensor, shape, 0, shape[1] - overlap)
      newRange = [this.dataRange[0], this.dataRange[1] - overlap]
    } else {
      result1Dtensor = TensorCutter.cutterTensor1D(result1Dtensor, shape, shape[1] + overlap, shape[1] - overlap)
      newRange = [this.dataRange[0] + overlap, this.dataRange[1] - overlap]
    }

    // reduce to the server
    this.ws.send({
      op: 'slave-reduce',
      data: {
        from: this.localIP,
        tensor1D: result1Dtensor,
        range: newRange
      }
    })
  }
}

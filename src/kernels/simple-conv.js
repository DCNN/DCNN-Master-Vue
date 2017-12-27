/* eslint-disable */
import {
  Array1D, Array2D, Array3D, Array4D, ENV,
  CheckpointLoader
} from 'deeplearn'

export default {
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

  // Images: 4D tensor of [batch_size, width, height, channel] size
  imgTensor: null,

  // Labels: 1D tensor of [batch_size] size
  label: null,

  loadModel () {
    const varLoader = new CheckpointLoader('./static/cifar-10/14646/')
    return new Promise((res, rej) => {
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

        res()
      })
      .catch(err => {
        rej(err)
      })
    })
  },

  performInference: function (imgTensor) {
    this.loadModel()
    .then(res => {

    })
    .catch(err => {
      console.log(err)
    })
  }
}

/* eslint-disable */
import {
  Array1D, Array2D, Array3D, Array4D, ENV,
  CheckpointLoader
} from 'deeplearn'

export default {
  performInference: function () {
    const varLoader = new CheckpointLoader('./static/cifar-10/14646/')

    return new Promise((res, rej) => {
      varLoader.getAllVariables().then(vars => {
        const conv1Biases = vars['conv1/biases']      // 64
        const conv1Weights = vars['conv1/weights']    // 5 5 3 64

        const conv2Biases = vars['conv2/biases']      // 64
        const conv2Weights = vars['conv2/weights']    // 5 5 64 64

        const local3Biases = vars['local3/biases']    // 384
        const local3Weights = vars['local3/weights']  // 2304 384

        // console.log(conv1Biases.size)
        res(conv1Biases.size)
      })
    })
  }
}

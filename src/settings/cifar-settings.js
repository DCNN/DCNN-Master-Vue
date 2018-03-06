export default (function () {
  let inputTensorShape = [4, 24, 24, 3] // batch_size, height, width, channel

  return {
    // HTTP Pre-Settings
    httpServerIP: `http://192.168.1.110:8080`,

    // WebSocket Pre-Settings
    wsServerIP: `ws://192.168.1.215:8888`,

    // CNN Pre-Settings
    batchSize: inputTensorShape[0],
    inputShape: [inputTensorShape[1], inputTensorShape[2]], // [height * width]
    labels: [
      'airplane', 'automobile', 'bird', 'cat', 'deer',
      'dog', 'frog', 'horse', 'ship', 'truck'
    ],

    // CNN Statistics
    maxFilterSize: 3,

    // DCNN metadata
    layersMeta: {
      conv1: {
        shape: [inputTensorShape[0], 24, 24, 64]
      },
      conv2: {
        shape: [inputTensorShape[0], 24, 24, 64]
      }
    },

    // workers' information
    nodesMeta: [  // need to config
      {
        ip: '192.168.1.112',
        capacity: 1
      }
    ]
  }
})()

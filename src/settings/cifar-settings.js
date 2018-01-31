export default (function () {
  let masterIP = '172.20.10.2'
  return {
    // HTTP Pre-Settings
    httpServerIP: `http://${masterIP}:8080`,

    // WebSocket Pre-Settings
    wsServerIP: `ws://${masterIP}:8888`,

    // Group Workers Pre-Settings
    workerNum: 3,    // the number of Workers
    workerCap: [1, 1, 1],  // Worker's Capability

    // CNN Pre-Settings
    batchSize: 4,
    inputShape: [24, 24], // [height * width]
    labels: [
      'airplane', 'automobile', 'bird', 'cat', 'deer',
      'dog', 'frog', 'horse', 'ship', 'truck'
    ],

    // CNN Statistics
    maxFilterSize: 3
  }
})()

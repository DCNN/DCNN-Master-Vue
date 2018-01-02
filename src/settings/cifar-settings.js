export default {
  /**
   *  WebSocket Pre-Settings
   */
  wsServerIP: 'ws://192.168.199.112:8888',

  /**
   * Group Workers Pre-Settings
   */
  workerNum: 1,    // the number of Workers
  workerCap: [1],  // Worker's Capability

  /**
   *  CNN Pre-Settings
   */
  batchSize: 4,
  inputShape: [24, 24],
  labels: [
    'airplane', 'automobile', 'bird', 'cat', 'deer',
    'dog', 'frog', 'horse', 'ship', 'truck'
  ],
}

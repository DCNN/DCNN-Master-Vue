class CifarSettrings {
  constructor () {}
}

// batch_size, height, width, channel
CifarSettrings.INPUT_TENSOR = [4, 24, 24, 3]

// IP Addr
// CifarSettrings.HTTP_SERVER_IP = 'http://192.168.199.121:8080'
CifarSettrings.HTTP_SERVER_IP = 'http://localhost:8080'

// WebSocket Pre-Settings
CifarSettrings.WS_SERVER_IP = 'ws://192.168.199.212:8888'

// CNN Pre-Settings
CifarSettrings.BATCH_SIZE = CifarSettrings.INPUT_TENSOR[0],
CifarSettrings.IMAGE_HEIGHT = CifarSettrings.INPUT_TENSOR[1]
CifarSettrings.IMAGE_WIDTH = CifarSettrings.INPUT_TENSOR[2]
CifarSettrings.IMAGE_SHAPE = [ CifarSettrings.IMAGE_HEIGHT, CifarSettrings.IMAGE_WIDTH ], // [height * width]
CifarSettrings.LABELS = [ 'airplane', 'automobile', 'bird', 'cat', 'deer', 'dog', 'frog', 'horse', 'ship', 'truck' ]

// CNN Statistics
CifarSettrings.MAX_FILTER_SIZE = 3

// DCNN metadata
CifarSettrings.LAYERS_META = {
  conv1: { shape: [CifarSettrings.batchSize, 24, 24, 64] },
  conv2: { shape: [CifarSettrings.batchSize, 24, 24, 64] }
}

// workers' information
CifarSettrings.WORKER_META = [  // need to config
  {
    ip: '192.168.199.112',
    capacity: 1
  }
]

export default CifarSettrings

/**
 * TaskManager maintains a WebSocket client keeping the connection
 * between this SPA and a localhost WebSocket ws.
 * We will use this module to seperate tasks.
 */
export default {
  TAG: 'TaskManager:',

  /**
   * Maintain a WebSocket Instance
   */
  ws: null,
  isConnected: false,

  createConnection: function (destIP) {
    return new Promise((resolve, reject) => {
      // create a websocket instance
      this.ws = new WebSocket(destIP)

      this.ws.onopen = (event) => {
        resolve(event)
      }

      this.ws.onerror = (event) => {
        reject(event)
      }
    })
  },

  sendMsg: function (jsonMsg) {
    return new Promise((resolve, reject) => {
      if (this.ws === null || this.ws.readyState != WebSocket.OPEN) {
        console.log(this.TAG, 'send msg failed')
        reject('send msg failed')
      }

      this.ws.send(JSON.stringify(jsonMsg))

      this.ws.onmessage = (event) => {
        var recData = JSON.parse(event.data)
        resolve(recData)
      }

      this.ws.onerror = (event) => {
        reject(event)
      }
    })
  },

  closeConnection: function () {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.close()
    }
  }
}

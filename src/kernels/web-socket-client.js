export default {
  TAG: 'WebSocketClient:',
  ws: null,
  createConnection (destIP) {
    this.ws = new WebSocket(destIP)
  },
  setUpListeners () {
    if (this.ws === null) {
      console.log(this.TAG, 'Create a connection before setting up listeners')
      return
    }

    this.ws.onopen = (event) => {
      console.log(this.TAG, 'Open Connection')
      // this.ws.send(JSON.stringify(msg))
    }

    this.ws.onmessage = (event) => {
      console.log(this.TAG, 'Receive a Message')
      var recData = JSON.parse(event.data)
      console.log(recData.data)
    }

    this.ws.onclose = (event) => {
      console.log(this.TAG, 'Close Connection')
    }

    this.ws.onerror = (event) => {
      console.log(this.TAG, 'Error Happens')
      console.log(event)
      // handle error
    }
  },
  sendMsg (jsonMsg) {
    if (this.ws === null || this.ws.readyState != WebSocket.OPEN) {
      console.log(this.TAG, 'send msg failed')
      return
    }
    this.ws.send(JSON.stringify(jsonMsg))
    console.log(this.TAG, 'send msg:', JSON.stringify(jsonMsg))
  }
}

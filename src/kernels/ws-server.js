/**
 * @fileoverview WS is a class whose instances maintain a WebSocket client keeping the connection
 * between this SPA and a WebSocket ws.
 */
class WSServer {
  constructor() {
    /**
     * @property {WebSocket} ws
     * Maintain a WebSocket Instance
     */
    this.ws = null

    /**
     * @property {string} localIP
     * Store the local IP address
     */
    this.localIP = null

    /**
     * @property {Object} listenerList
     * Registered listeners; format: { funcName: func }
     * Registered functions require exactally one argument, `data`, extracted from transmitted JSON object
     */
    this.listenerList = {}
  }

  /**
   * @private
   * Pre-set a list of functions. Private method.
   * @returns {null}
   */
  _presetListeners() {
    this.listenerList['onReceive'] = (data) => {
      console.log(data)
    }
    this.listenerList['setIP'] = (data) => {
      this.localIP = data
      console.log('My IP is ' + this.localIP)
    }
  }

  _refreshListeners () {
    this.ws.onmessage = (event) => {
      let recData = JSON.parse(event.data)
      console.log('receive data:')
      console.log(recData)
      if (recData.func !== null && this.listenerList[recData.func] !== null) {
        console.log(this.listenerList)
        this.listenerList[recData.func](recData.data)
      }
    }
  }

  /**
   * Initalize the connection between client & the WS server.
   * @param {string} destIP ws://xxx.xxx.xxx.xxx:xxxx
   * @returns {Promise}
   */
  createConnection (destIP) {
    this._presetListeners()
    return new Promise((resolve, reject) => {
      // create a websocket instance
      this.ws = new WebSocket(destIP)
      this.ws.onopen = (event) => {
        resolve(event)
      }
      this.ws.onerror = (event) => {
        reject(event)
      }
      this._refreshListeners()
    })
  }

  /**
   * Send JSON to the server.
   * @param {Object} jsonMsg
   * @returns {null}
   */
  sendMsg (jsonMsg) {
    if (this.ws === null || this.ws.readyState != WebSocket.OPEN) {
      console.error('Send msg failed')
      return
    }

    this.ws.send(JSON.stringify(jsonMsg))
    console.log('WSServer: Send JSON')
  }

  /**
   * Add a listener to this WS.
   * @param {string} listenerName
   * @param {function} listener
   * @returns {boolean} whether the listener is regisered
   */
  setListener (listenerName, listener) {
    this.listenerList[listenerName] = listener
    this._refreshListeners()
    return true
  }

  /**
   * Remove a listener.
   * @param {string} listenerName
   * @returns {null}
   */
  removeListener (listenerName) {
    if (this.listenerList[listenerName] !== null) {
      this.listenerList[listenerName] = null
      this._refreshListeners()
    }
  }

  /**
   * Close the WS.
   * @returns {null}
   */
  closeConnection () {
    this.ws.close()
  }
}

export default WSServer

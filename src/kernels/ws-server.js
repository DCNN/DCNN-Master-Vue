/**
 * @fileoverview WS is a class whose instances maintain a WebSocket client keeping the connection
 * between this SPA and a WebSocket ws.
 */
export default (function () {
  return {
    // Maintain a WebSocket Instance
    ws: null,

    // registered listeners; format: { funcName: func }
    // functions require exactally one argument, data, extracted from transmitted JSON object
    listenerList: {},

    /**
     * Pre-set a list of functions. Private method.
     * @returns {null}
     */
    _presetListeners: function () {
      this.listenerList['onReceive'] = (data) => {
        console.log(data)
      }
    },

    /**
     * Initalize the connection between client & the WS server.
     * @param {string} destIP ws://xxx.xxx.xxx.xxx:xxxx
     * @returns {Promise}
     */
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
        this.ws.onmessage = (event) => {
          var recData = JSON.parse(event.data)
          if (recData.func !== null && this.listenerList[recData.func] !== null) {
            this.listenerList[recData.func](recData.data)
          }
        }
        this._presetListeners()
      })
    },

    /**
     * Send JSON to the server.
     * @param {Object} jsonMsg
     * @returns {null}
     */
    sendMsg: function (jsonMsg) {
      if (this.ws === null || this.ws.readyState != WebSocket.OPEN) {
        console.log('Err: Send msg failed')
        return
      }

      this.ws.send(JSON.stringify(jsonMsg))
    },

    /**
     * Add a listener to this WS.
     * @param {string} listenerName
     * @param {function} listener
     * @returns {boolean} whether the listener is regisered
     */
    setListener: function (listenerName, listener) {
      if (this.listenerList[listenerName] !== null) {
        // depulcated listener
        return false
      }
      this.listenerList[listenerName] = listener
      return true
    },

    /**
     * Remove a listener.
     * @param {string} listenerName
     * @returns {null}
     */
    removeListener: function (listenerName) {
      if (this.listenerList[listenerName] !== null) {
        this.listenerList[listenerName] = null
      }
    },

    /**
     * Close the WS.
     * @returns {null}
     */
    closeConnection: function () {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.close()
      }
    }
  }
})()

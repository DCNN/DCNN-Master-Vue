export default {
  /**
   * Get an element in a tensor1D
   * @param {Array} tensor1D: This is a flattened 1D tensor
   *     with size of [batch_size * height * width * channel]
   * @param {Array} shape: [batch_size, height, width, channel]
   * @param {Array} index: the index of target element: [batch, height, width, channel]
   * @returns {number} target element
   */
  getTensor1DEle: function (tensor1D, shape, index) {
    let [ batch_size, height, width, channel ] = shape
    let [ b, h, w, c ] = index
    let position = b * height * width * channel + h * width * channel + w * channel + c
    console.log('getTensor1DEle test:', position)
    return tensor1D[position]
  },

  /**
   * Cut a piece from origin tensor
   * @param {Array} tensor1D: This is a flattened 1D tensor
   *     with size of [batch_size * height * width * channel]
   * @param {Array} shape: [batch_size, height, width, channel]
   * @param {number} fromHeight: Index
   * @param {number} toHeight: Index
   * @returns {Array} This returns a flattened 1D tensor,
   *     containing data of [:][fromHeight:toHeight][:][:]
   *     with size of [batch_size * (toHeight - fromHeight) * width * channel]
   */
  cutterTensor1D: function (tensor1D, shape, fromHeight, toHeight) {
    let [ batch_size, height, width, channel ] = shape
    let batch_length = height * width * channel
    let cutTensor1D = []
    for (let curBatch = 0; curBatch * batch_length < tensor1D.length; ++curBatch) {
      let _from = curBatch * batch_length + fromHeight * width * channel
      let _to = curBatch * batch_length + toHeight * width * channel
      cutTensor1D = cutTensor1D.concat(tensor1D.slice(_from, _to))
    }
    return cutTensor1D
  },

  /**
   * Update part of a tensor1D with a smaller tensor1D.
   * This method changes the original tensor1D.
   * @param {Array} tensor1D: This is a flattened 1D tensor
   *     with size of [batch_size * height * width * channel]
   * @param {Array} shape: [batch_size, height, width, channel]
   * @param {number} fromHeight: Index
   * @param {number} toHeight: Index
   * @param {Array} updatePartTensor1D: [batch_size, height, width, channel]
   *     the smaller tensor1D used to perform updating
   *     share the same batch_size, width and channel with original tensor
   * @returns {tensor1D}
   */
  updateTensor1D: function (tensor1D, shape, fromHeight, toHeight, updatePartTensor1D) {
    let [ batch_size, height, width, channel ] = shape
    let batch_length = height * width * channel
    let updateHeight = toHeight - fromHeight
    for (let curBatch = 0; curBatch * batch_length < tensor1D.length; ++curBatch) {
      let _from = curBatch * batch_length + fromHeight * width * channel
      let _to = curBatch * batch_length + toHeight * width * channel
      let _updateFrom = curBatch * updateHeight * width * channel
      for (let i = _from; i < _to; ++i, ++_updateFrom) {
        tensor1D[i] = updatePartTensor1D[_updateFrom]
      }
    }
    return tensor1D
  },

  /**
   * Flattens a ND Array, using recursion.
   * @param {Array} arr: ND array
   * @returns {Array} returns 1D array
   */
  flattenArray: function f (arr) {
    var newArr = []
    arr.forEach(function(val) {
        if (val instanceof Array) {
            Array.prototype.push.apply(newArr, f(val))
        } else {
            newArr.push(val)
        }
    })
    return newArr
  }
}

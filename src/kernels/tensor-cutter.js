export default {
  TAG: 'TENSOR_CUTTER:',

  /**
   * Cuts a piece from origin tensor
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
      console.log(this.TAG, _from, _to)
      cutTensor1D = cutTensor1D.concat(tensor1D.slice(_from, _to))
    }
    return cutTensor1D
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

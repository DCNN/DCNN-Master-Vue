// perform a list of sync math operations

export default {
  mean: function (arr) {
    return this.meanFromTo(arr, 0, arr.length)
  },

  variance: function (arr) {
    return this.varianceFromTo(arr, 0, arr.length)
  },

  stddev: function (arr) {
    return this.stddevFromTo(arr, 0, arr.length)
  },

  // [from, to]
  meanFromTo: function (arr, from, to) {
    let sum = 0
    for (let i = from; i < to; ++i) {
      sum += arr[i]
    }
    return sum / (to - from)
  },

  varianceFromTo: function (arr, from, to) {
    let mean = this.meanFromTo(arr, from, to)
    let sum = 0
    for(let i = from; i < to; i++) {
        sum += Math.pow(arr[i] - mean , 2)
    }
    return sum / (to - from)
  },

  stddevFromTo: function (arr, from, to) {
    return Math.sqrt(this.variance(arr, from, to))
  }

  // adjustedStddev: function (arr) {
  //
  // }
}

// perform a list of sync math operations

export default {
  mean: function (arr) {
    let sum = 0
    for (let i = 0; i < arr.length; ++i) {
      sum += arr[i]
    }
    return sum / arr.length
  },

  variance: function (arr) {
    let mean = this.mean(arr)
    let sum = 0
    for(let i = 0; i < arr.length; i++) {
        sum += Math.pow(arr[i] - mean , 2)
    }
    return sum / arr.length
  },

  stddev: function (arr) {
    return Math.sqrt(this.variance(arr))
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

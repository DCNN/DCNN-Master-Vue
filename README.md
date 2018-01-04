# dcnn-master-vue

> A Vue.js project

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run all tests
npm test
```

## How to assign conv works to slaves

Workers load conv models.
Master divides input tensor, then sends command:

```js
// master vue -> ws
{
  op: 'master-init',
  overlapSize: number,
  data: [
    {
      tensor1D: [],
      shape: [batch_size, height, width, channel],
      range: [from, to]  // height range
    }, {
      ...
    }
  ]
}
```

to the WS server, which broadcast this json file to all slaves.

```js
// ws -> slave vue
{
  op: 'init',
  tensor1D: [],
  shape: [batch_size, height, width, channel],
  range: [from, to],   // height range
  overlapSize: number
}
```

After serval layers of computing, workers need to upload their half-done result back to the server
to perform reduce operation with JSON in below format:

```js
// slave vue -> ws
{
  op: 'slave-reduce',
  data: {
    from: slaveIP,
    tensor1D: [],
    range: []
  }
}
```

Still, the WS Server just forwards this message to master's Vue which perform the reduction operation.

Next, Master's Vue maps updated data again.

```js
// master vue -> ws
{
  op: 'master-map',
  data: [
    {
      target: slaveIP,
      tensor1D: [],
      range: []
    }, {
      ...
    }
  ]
}

```

And the WS server will perform the route operation, send handled data to each slave:

```js
// ws -> slave vue
{
  op: 'update',
  tensor1D: [],
  range: []
}
```

Finally, the Master's Vue requires the whole result from all slaves, in this case, it will command as:

```js
// master vue -> ws
{
  op: 'master-all'
}
```

Forward by WS:

```js
// ws -> slave vue
{
  op: 'all'
}
```

Slaves respond by:

```js
// slave vue -> ws
{
  op: 'slave-all',
  data: {
    from: slaveIP,
    tensor1D: [],
    range: []
  }
}
```

WS send this back to the master's Vue

```js
{
  op: 'result',
  data: [
    {
      from: slaveIP,
      tensor1D: [],
      range: []
    }, {
      ...
    }
  ]
}
```

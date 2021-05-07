import * as Benchmark from 'benchmark'
import {
  data,
  getOddSquaresWhileLessThan30,
  getOddSquaresWhileLessThan30R,
} from '../../shared/getOddSquaresWhileLessThan30'

const suite = new Benchmark.Suite()

/*
short circuits with reduced (ramda) x 438,027 ops/sec ±4.16% (76 runs sampled)
short circuits with reduced (TEO) x 175,171 ops/sec ±3.26% (77 runs sampled)
Fastest is short circuits with reduced (ramda)
*/

suite
  .add('short circuits with reduced (ramda)', function () {
    getOddSquaresWhileLessThan30R(data)
  })
  .add('short circuits with reduced (TEO)', function () {
    getOddSquaresWhileLessThan30(data)
  })
  .on('cycle', function (event: any) {
    console.log(String(event.target))
  })
  .on('complete', function (this: any) {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  .run({ async: true })

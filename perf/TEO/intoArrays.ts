import * as Benchmark from 'benchmark'
import { data, inclementAll, inclementAllR } from '../../shared/intoArrays'

const suite = new Benchmark.Suite()

/*
transduces into arrays (ramda) x 336,624 ops/sec ±3.76% (73 runs sampled)
transduces into arrays (TEO) x 288,414 ops/sec ±4.30% (73 runs sampled)
Fastest is transduces into arrays (ramda)
*/

suite
  .add('transduces into arrays (ramda)', function () {
    inclementAllR(data)
  })
  .add('transduces into arrays (TEO)', function () {
    inclementAll(data)
  })
  .on('cycle', function (event: any) {
    console.log(String(event.target))
  })
  .on('complete', function (this: any) {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  .run({ async: true })

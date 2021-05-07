# fp-ts-reduce

A experimental code snippets to achieve the purpose of [transducers](https://medium.com/javascript-scene/transducers-efficient-data-processing-pipelines-in-javascript-7985330fe73d) using fp-ts.

## Motivation

I want a [transduce](https://ramdajs.com/docs/#transduce) like function that can be used for Objects.

The well known functional programing library with JavaScrit, [Ramda](https://github.com/ramda/ramda) has already implemented [transduce](https://ramdajs.com/docs/#transduce).
But, **ramda's tranduce can be used only for arrays**.

With [fp-ts](https://github.com/gcanti/fp-ts), we can use `map`, `filter`, `reduce` not only for arrays, but also for objects.
But, **fp-ts doesn't have `transduce`**.

## Basic example

This example is made to look like the _example from Ramda_ in [Transducers](https://medium.com/javascript-scene/transducers-efficient-data-processing-pipelines-in-javascript-7985330fe73d)

```typescript
// TEO ( Tuple Either Option ) with fp-ts
import { TEO as _ } from '../src' // not published as npm module
import { readonlyArray as A, readonlyRecord as RR } from 'fp-ts'
import { flow } from 'fp-ts/function'

// ramda
import * as R from 'ramda'

// util
const isEven = (n: number) => n % 2 === 0
const double = (n: number) => n * 2

// data
const arr = [1, 2, 3, 4, 5, 6]
const obj = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 }
let result: readonly number[]

// ramda
const doubleEvens_Ramda = R.compose(R.filter(isEven), R.map(double))
result = R.into([], doubleEvens_Ramda, arr)
console.log(result) // [4, 8, 12]

// TEO.ts ( array -> array )
const intoNumberArrays = _.reduce(A.Foldable, A.getMonoid<number>())
const doubleEvens = intoNumberArrays(flow(_.filter(isEven), _.map(flow(double, A.of))))
result = doubleEvens(arr)
console.log(result) // [4, 8, 12]

// TEO.ts ( object -> array )
const obj2NumberArrays = _.reduce(RR.Foldable, A.getMonoid<number>())
const doubleEvens_obj = obj2NumberArrays(flow(_.filter(isEven), _.map(flow(double, A.of))))
result = doubleEvens_obj(obj)
console.log(result) // [4, 8, 12]
```

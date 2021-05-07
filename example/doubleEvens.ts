import { TEO as _ } from '../src'
import { readonlyArray as A, readonlyRecord as RR } from 'fp-ts'
import { flow } from 'fp-ts/function'

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

// TEO.ts ( array -> array)
const intoNumberArrays = _.reduce(A.Foldable, A.getMonoid<number>())
const doubleEvens = intoNumberArrays(flow(_.filter(isEven), _.map(flow(double, A.of))))
result = doubleEvens(arr)
console.log(result) // [4, 8, 12]

// TEO.ts ( object -> array)
const obj2NumberArrays = _.reduce(RR.Foldable, A.getMonoid<number>())
const doubleEvens_obj = obj2NumberArrays(flow(_.filter(isEven), _.map(flow(double, A.of))))
result = doubleEvens_obj(obj)
console.log(result) // [4, 8, 12]

// npx ts-node doubleEvens.ts

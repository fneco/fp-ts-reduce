import { option as O, readonlyArray as A } from 'fp-ts'
import { flow } from 'fp-ts/function'
import * as R from 'ramda'
import { TEO } from '../src'
import { isOdd, monoidNumberArray, square } from './util'

// ramda  (https://github.com/ramda/ramda/blob/6b6a85d3fe30ac1a41ac05734be9f61bd92325e5/test/transduce.js#L76)
var transducerR = R.compose(R.map(square), R.filter(isOdd as any) as any)
var iteratorR = (acc: readonly number[], val: number) => (val > 30 ? R.reduced(acc) : R.append(val, acc))
export var getOddSquaresWhileLessThan30R = R.transduce(transducerR, iteratorR as any, [])

// TEO
const intoNumberArrays = TEO.reduce(A.Foldable, monoidNumberArray)
const iterator = TEO.reduced((a: number, acc: readonly number[]) => (a > 30 ? O.some(acc) : O.none))
export const getOddSquaresWhileLessThan30 = intoNumberArrays(
  flow(TEO.map(square), TEO.filter(isOdd), iterator, TEO.map(A.of))
)

export const [data, expected] = [
  [1, 2, 3, 4, 5, 6, 7],
  [1, 9, 25],
]

import { option as O, readonlyArray as A } from 'fp-ts'
import { flow } from 'fp-ts/function'
import * as R from 'ramda'
import { TEO } from '../src'
import { monoidNumberArray } from './util'

// ramda  (https://github.com/ramda/ramda/blob/6b6a85d3fe30ac1a41ac05734be9f61bd92325e5/test/transduce.js#L38)
const append = (R.flip(R.append) as undefined) as <T>(list: readonly T[], el: T) => T[]
export var inclementAllR = R.transduce(R.map(R.add(1)), append, [])

// TEO
export const intoNumberArrays = TEO.reduce(A.Foldable, monoidNumberArray)
export const inclementAll = intoNumberArrays(TEO.map(flow(R.add(1), A.of)))

export const data = [1, 2, 3, 4]

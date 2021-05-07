import { function as F, readonlyArray as A, string, either as E, option as O, readonlyRecord as RR } from 'fp-ts'
import { Monoid } from 'fp-ts/Monoid'
import { pipe, flow, identity } from 'fp-ts/function'
import * as R from 'ramda'
import { TEO as _ } from '../src'
import { deepStrictEqual, isOdd, monoidNumberArray } from '../shared/util'
import * as GOSWLT30 from '../shared/getOddSquaresWhileLessThan30'
import * as IA from '../shared/intoArrays'
import { intoNumberArrays } from '../shared/intoArrays'

describe('TEO', (): void => {
  it('transduces into arrays', (): void => {
    const { data, inclementAll, inclementAllR } = IA
    const takeNumA = _.take(monoidNumberArray)
    deepStrictEqual(pipe([1, 2, 3, 4], intoNumberArrays(_.map(flow(R.add(1), A.of)))), [2, 3, 4, 5])
    deepStrictEqual(pipe([1, 2, 3, 4], intoNumberArrays(flow(_.filter(isOdd), _.map(A.of)))), [1, 3])
    deepStrictEqual(pipe([1, 2, 3, 4], intoNumberArrays(flow(_.map(flow(R.add(1), A.of)), takeNumA(2)))), [2, 3])
    deepStrictEqual(pipe([1, 2, 3, 4], intoNumberArrays(flow(_.filter(isOdd), _.map(A.of), takeNumA(1)))), [1])
    deepStrictEqual(inclementAll(data), inclementAllR(data))
  })
  it('transduces into strings', (): void => {
    const intoString = _.reduce(A.Foldable, string.Monoid)
    const takeString = _.take(string.Monoid)
    deepStrictEqual(pipe([1, 2, 3, 4], intoString(_.map(flow(R.inc, String)))), '2345')
    deepStrictEqual(pipe([1, 2, 3, 4], intoString(flow(_.filter(isOdd), _.map(String)))), '13')
    deepStrictEqual(pipe([1, 2, 3, 4], intoString(flow(_.map(flow(R.inc, String)), takeString(2)))), '23')
  })
  it('transduces into objects', (): void => {
    const intoObjects = _.reduce(A.Foldable, { empty: {}, concat: R.mergeRight } as Monoid<Record<string, number>>)
    deepStrictEqual(pipe([{ a: 1 }, { b: 2, c: 3 }], intoObjects(identity)), { a: 1, b: 2, c: 3 })
  })

  it('short circuits with reduced', (): void => {
    const { getOddSquaresWhileLessThan30, getOddSquaresWhileLessThan30R, data, expected } = GOSWLT30
    deepStrictEqual(getOddSquaresWhileLessThan30(data), expected)
    deepStrictEqual(getOddSquaresWhileLessThan30R(data), expected)
  })
})

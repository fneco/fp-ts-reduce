import * as assert from 'assert'
import { readonlyArray as A } from 'fp-ts'

export const deepStrictEqual = <A>(actual: A, expected: A) => {
  assert.deepStrictEqual(actual, expected)
}

export const strictEqual = <A>(actual: A, expected: A) => {
  assert.strictEqual(actual, expected)
}

export const double = (n: number): number => n * 2
export const isOdd = (b: number) => b % 2 !== 0
export const square = (a: number) => a * a

export const monoidNumberArray = A.getMonoid<number>()

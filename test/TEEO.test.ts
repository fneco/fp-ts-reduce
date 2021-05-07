import { function as F, readonlyArray as A, number, either as E, option as O } from 'fp-ts'
import { flow, pipe } from 'fp-ts/function'
import * as R from 'ramda'
import * as _ from '../src/TEEO'

const isEven = (n: number) => n % 2 === 0

const double = R.multiply(2)

const msg = 'include non number'
const safeDouble = (a: any) => {
  if (typeof a === 'number') {
    return E.right(double(a))
  }
  return E.left(new Error(msg))
}

describe('TEEO', (): void => {
  const sumNumberArray = _.reduce(A.Foldable, number.MonoidSum)
  it('can "break" using input type A', (): void => {
    const filter = jest.fn()
    const map = jest.fn()
    pipe(
      [1, 2, 3, 4, 5, 6, 7],
      sumNumberArray(
        flow(
          _.breakReduce((x) => x >= 5),
          _.filter(flow(R.tap(filter), isEven)),
          _.map(flow(R.tap(map), double))
        )
      ),
      E.map((x) => expect(x).toBe(12))
    )
    expect(filter).toHaveBeenCalledTimes(4)
    expect(map).toHaveBeenCalledTimes(2)
  })
  it('can "break" using accumulator(output type B)', (): void => {
    pipe(
      [1, 2, 3, 4, 5, 6, 7],
      sumNumberArray(
        flow(
          _.breakReduce((_, acc) => acc >= 3),
          _.filter(isEven),
          _.map(double)
        )
      ),
      E.map((x) => expect(x).toBe(4))
    )
  })
  it('can handle "reduced" state', (): void => {
    const reduced = jest.fn()
    pipe(
      [1, 2, 3, 4, 5, 6, 7],
      sumNumberArray(
        flow(
          _.filter(isEven),
          _.reduced((a, b) => ((reduced(), a > 3) ? O.some(b + 109) : O.none))
        )
      ),
      E.map((x) => expect(x).toBe(111))
    )
    expect(reduced).toHaveBeenCalledTimes(2)
  })
  it('can handle error', (): void => {
    const breakReduce = jest.fn()
    const safeMap = jest.fn()
    pipe(
      [1, '2', 3, 4, 5, 6, 7],
      sumNumberArray(
        flow(
          _.breakReduce((x, acc) => (breakReduce(), acc >= 10)),
          _.safeMap(flow(R.tap(safeMap), safeDouble))
        )
      ),
      E.mapLeft((x) => expect(x.message).toBe(msg))
    )
    expect(breakReduce).toHaveBeenCalledTimes(2)
    expect(safeMap).toHaveBeenCalledTimes(2)
  })
  it('can handle error ( no error )', (): void => {
    const breakReduce = jest.fn()
    const chain = jest.fn()
    pipe(
      [1, 2, 3, 4, 5, 6, 7],
      sumNumberArray(
        flow(
          _.breakReduce((x, acc) => (breakReduce(), x > 4)),
          _.safeMap(flow(R.tap(chain), safeDouble))
        )
      ),
      E.map((x) => expect(x).toBe(20))
    )
    expect(breakReduce).toHaveBeenCalledTimes(5)
    expect(chain).toHaveBeenCalledTimes(4)
  })

  it('it can use "identity"', (): void => {
    const identity = jest.fn()
    pipe(
      [1, 2, 3, 4, 5, 6, 7],
      sumNumberArray((x) => (identity(), x)),
      E.map((x) => expect(x).toBe(28))
    )
    expect(identity).toHaveBeenCalledTimes(7)
  })
})

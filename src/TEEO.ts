import { either as E, option as O, readonlyTuple as T } from 'fp-ts'
import { Either, isLeft, left, right } from 'fp-ts/Either'
import { Foldable1 } from 'fp-ts/Foldable'
import { flow, identity, pipe } from 'fp-ts/function'
import { Kind, URIS } from 'fp-ts/HKT'
import { Monoid } from 'fp-ts/Monoid'
import { isNone, Option, some } from 'fp-ts/Option'
import { fst, snd } from 'fp-ts/ReadonlyTuple'

type TEEO<E, A, B> = readonly [Either<E, Either<B, Option<A>>>, B]

type Reduced<B> = Either<never, Either<B, never>>
type SkipConcat = Either<never, Either<never, O.None>>

export const of = <A, B>(a: A, b: B): TEEO<any, A, B> => [right(right(some(a))), b]

export const reduce = <F extends URIS, B>(F: Foldable1<F>, M: Monoid<B>) => <A, E>(
  f: (mab: TEEO<E, A, B>, a: A, b: B) => TEEO<E, B, B>
) => (fa: Kind<F, A>): Either<E, B> => {
  return pipe(
    F.reduce(fa, right(right(M.empty)), (b: Either<E, Either<B, B>>, a: A) => {
      if (isLeft(b)) {
        return b // Error (Left<E>)
      }
      if (isLeft(b.right)) {
        return b as Reduced<B>
      }
      const prevB = b.right.right
      return pipe(
        f(of(a, prevB), a, prevB),
        T.mapFst(
          E.map(
            E.map(
              flow(
                O.map((newB) => M.concat(prevB, newB)),
                O.getOrElse(() => prevB)
              )
            )
          )
        ),
        fst // Either<E, Either<B, B>>
      )
    }),
    E.map(E.getOrElse(identity))
  )
}

/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 */
export const map = <A, B, C>(f: (a: A, b: B) => C) => (a: TEEO<any, A, B>): TEEO<any, C, B> =>
  pipe(a, T.mapFst(E.map(E.map(O.map((aa) => f(aa, snd(a)))))))

/**
 * If the passed `predicate` return `false`, any further calculations in the turn is skipped, and
 * also skip the concatenation of current A and B(accumulator) .
 * Otherwise, do nothing.
 */
export const filter = <A, B>(predicate: (a: A, b: B) => boolean) => (a: TEEO<any, A, B>): TEEO<any, A, B> =>
  pipe(a, T.mapFst(E.map(E.map(O.filter((aa) => predicate(aa, snd(a)))))))

/**
 * If the passed `predicate` return `true`, skip any further calculations including concatenation, and
 * the result value of `reduce` become the current B(accumulator).
 */
export const breakReduce = <A, B>(predicate: (a: A, b: B) => boolean) => (teeo: TEEO<any, A, B>): TEEO<any, A, B> =>
  pipe(
    teeo,
    T.mapFst(
      E.map((eo) => {
        if (isLeft(eo) || isNone(eo.right)) return eo
        const [a, b] = [eo.right.value, snd(teeo)]
        return predicate(a, b) ? left(b) : eo
      })
    )
  )

/**
 * If the passed function return `Some<VALUE>`, the result value of `reduce` become the VALUE.
 * Otherwise, do nothing.
 */
export const reduced = <A, B>(f: (a: A, b: B) => Option<B>) => (teeo: TEEO<any, A, B>): TEEO<any, A, B> =>
  pipe(
    teeo,
    T.mapFst(
      E.map((eo) => {
        if (isLeft(eo) || isNone(eo.right)) return eo
        const b = f(eo.right.value, snd(teeo))
        if (isNone(b)) return eo
        return left(b.value)
      })
    )
  )

/**
 * This is functionally the same as `map`, but the function you pass should return `Either`.
 * If the passed function return `Right<VALUE>`, `safeMap` works as `map`.
 * If the passed  function return `Left<VALUE>`, the result value of `reduce` become the `Left<VALUE>`.
 */
export const safeMap = <E, A, B, C>(f: (a: A, b: B) => Either<E, C>) => (teeo: TEEO<E, A, B>): TEEO<E, C, B> =>
  pipe(
    teeo,
    T.mapFst((eeo) =>
      pipe(
        eeo,
        E.chain((eo) => {
          if (isLeft(eo) || isNone(eo.right)) return eeo as Reduced<B> | SkipConcat
          const b = f(eo.right.value, snd(teeo))
          return isLeft(b) ? b : right(right(some(b.right)))
        })
      )
    )
  )

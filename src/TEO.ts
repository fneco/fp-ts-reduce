import { either as E, option as O, readonlyTuple as T } from 'fp-ts'
import { Either, isLeft, left, right } from 'fp-ts/Either'
import { Foldable1 } from 'fp-ts/Foldable'
import { flow, identity, pipe } from 'fp-ts/function'
import { Kind, URIS } from 'fp-ts/HKT'
import { Monoid } from 'fp-ts/Monoid'
import { isNone, Option, some } from 'fp-ts/Option'
import { fst, snd } from 'fp-ts/ReadonlyTuple'

type TEO<A, B> = readonly [Either<B, Option<A>>, B]

type Reduced<B> = Either<B, never>

export const of = <A, B>(a: A, b: B): TEO<A, B> => [right(some(a)), b]

export const reduce = <F extends URIS, B>(F: Foldable1<F>, M: Monoid<B>) => <A>(
  f: (mab: TEO<A, B>, a: A, b: B) => TEO<B, B>
) => (fa: Kind<F, A>): B => {
  return pipe(
    F.reduce(fa, right(M.empty), (b: Either<B, B>, a: A) => {
      if (isLeft(b)) {
        return b as Reduced<B>
      }
      const prevB = b.right
      return pipe(
        f(of(a, prevB), a, prevB),
        T.mapFst(
          E.map(
            flow(
              O.map((newB) => M.concat(prevB, newB)),
              O.getOrElse(() => prevB)
            )
          )
        ),
        fst // Either<B, B>
      )
    }),
    E.getOrElse(identity)
  )
}

/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 */
export const map = <A, B, C>(f: (a: A, b: B) => C) => (a: TEO<A, B>): TEO<C, B> =>
  pipe(a, T.mapFst(E.map(O.map((aa) => f(aa, snd(a))))))

/**
 * If the passed `predicate` return `false`, any further calculations in the turn is skipped, and
 * also skip the concatenation of current A and B(accumulator) .
 * Otherwise, do nothing.
 */
export const filter = <A, B>(predicate: (a: A, b: B) => boolean) => (a: TEO<A, B>): TEO<A, B> =>
  pipe(a, T.mapFst(E.map(O.filter((aa) => predicate(aa, snd(a))))))

/**
 * If the passed `predicate` return `true`, skip any further calculations including concatenation, and
 * the result value of `reduce` become the current B(accumulator).
 */
export const breakReduce = <A, B>(predicate: (a: A, b: B) => boolean) => (teo: TEO<A, B>): TEO<A, B> =>
  pipe(
    teo,
    T.mapFst((eo) => {
      if (isLeft(eo) || isNone(eo.right)) return eo
      const [a, b] = [eo.right.value, snd(teo)]
      return predicate(a, b) ? left(b) : eo
    })
  )

/**
 * If the passed function return `Some<VALUE>`, the result value of `reduce` become the VALUE.
 * Otherwise, do nothing.
 */
export const reduced = <A, B>(f: (a: A, b: B) => Option<B>) => (teo: TEO<A, B>): TEO<A, B> =>
  pipe(
    teo,
    T.mapFst((eo) => {
      if (isLeft(eo) || isNone(eo.right)) return eo
      const bb = f(eo.right.value, snd(teo))
      if (isNone(bb)) return eo
      return left(bb.value)
    })
  )

export const take = <B>(M: Monoid<B>) => (x: number) => {
  let counter = 0
  return (teo: TEO<B, B>): TEO<B, B> =>
    pipe(
      teo,
      reduced((a, b) => (++counter >= x ? O.some(M.concat(b, a)) : O.none))
    )
}

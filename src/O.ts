import { option as O } from 'fp-ts'
import { Foldable1 } from 'fp-ts/Foldable'
import { FoldableWithIndex1 } from 'fp-ts/FoldableWithIndex'
import { pipe } from 'fp-ts/function'
import { Kind, URIS } from 'fp-ts/HKT'
import { Monoid } from 'fp-ts/Monoid'
import { Option } from 'fp-ts/Option'

export const reduceWithIndex = <F extends URIS, I, B>(F: FoldableWithIndex1<F, I>, M: Monoid<B>) => <A>(
  f: (ma: Option<[I, A]>, i: I, a: A, b: B) => Option<B>
) => (fa: Kind<F, A>): B =>
  F.reduceWithIndex(fa, M.empty, (i: I, b: B, a: A) =>
    pipe(
      f(O.of([i, a]), i, a, b),
      O.map((bb) => M.concat(b, bb)),
      O.getOrElse(() => b)
    )
  )

export const reduce = <F extends URIS, B>(F: Foldable1<F>, M: Monoid<B>) => <A>(
  f: (ma: Option<A>, a: A, b: B) => Option<B>
) => (fa: Kind<F, A>): B =>
  F.reduce(fa, M.empty, (b: B, a: A) =>
    pipe(
      f(O.of(a), a, b),
      O.map((bb) => M.concat(b, bb)),
      O.getOrElse(() => b)
    )
  )

import { either as E, option as O } from 'fp-ts'
import { Either, right } from 'fp-ts/Either'
import { FoldableWithIndex1 } from 'fp-ts/FoldableWithIndex'
import { flow, pipe } from 'fp-ts/function'
import { Kind, URIS } from 'fp-ts/HKT'
import { Monoid } from 'fp-ts/Monoid'
import { Option } from 'fp-ts/Option'

export const reduceEWithIndex = <F extends URIS, I, B>(F: FoldableWithIndex1<F, I>, M: Monoid<B>) => <A, E>(
  f: (i: I, a: A) => Either<E, Option<B>>
) => (fa: Kind<F, A>): Either<E, B> => {
  return F.reduceWithIndex(fa, right(M.empty), (i: I, b: Either<E, B>, a: A) => {
    return pipe(
      b,
      E.chain((prevB) =>
        pipe(
          f(i, a),
          E.map(
            flow(
              O.map((newB) => M.concat(prevB, newB)),
              O.getOrElse(() => prevB)
            )
          )
        )
      )
    )
  })
}

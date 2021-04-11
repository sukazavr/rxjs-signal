import { Observable, Subject, Subscription } from 'rxjs'
import { filter, map, share } from 'rxjs/operators'

export interface Signal<P1 = void, P2 = P1, R = void> {
  $: Observable<P2>
  _: (...args: P1 extends void ? unknown[] : [P1]) => () => R
  (...args: P1 extends void ? unknown[] : [P1]): R
}

export type SignalModifier<P1, P2, R> = (emit: (payloadOutput: P2) => void, payloadInput: P1) => R

export interface SignalWave {
  signal: Signal<unknown>
  modifier?: SignalModifier<unknown, unknown, unknown>
  payload: unknown
}

/**
 * Create Signal which is function with static props `$` = shared Observable<P2> and `_` =
 * (payload: P1) => () => self()
 *
 * Signal<P1 = void, P2 = P1, R = void>
 * P1 is input payload type, P2 is output payload type, R is return type.
 *
 * @function cs
 * @param {function(emit: function(payloadOutput: P2): void, payloadInput: P1): R} [modifier]
 * An optional function to map payload on other value and produce custom value for return from `cs` after the
 * call.
 * @returns {Signal<P1 = void, P2 = P1, R = void>}
 * @example
 *
 *   import { ca } from 'rxjs-signal'
 *
 *   const save = ca<{ data: string }>()
 *   save.$.subscribe((x) => console.log(x))
 *   save({ data: 'hey' })
 *
 */
export function cs(): Signal
export function cs<P1>(): Signal<P1>
export function cs<P1>(modifier: SignalModifier<P1, P1, void>): Signal<P1>
export function cs<P1, R>(modifier: SignalModifier<P1, P1, R>): Signal<P1, P1, R>
export function cs<P1, P2, R>(modifier: SignalModifier<P1, P2, R>): Signal<P1, P2, R>
export function cs<P1, P2, R>(modifier?: SignalModifier<P1, P2, R>): Signal<P1, P2, R> {
  const signal = (typeof modifier === 'function'
    ? (payload) =>
        modifier(
          (payload) =>
            signalWave$.next({
              signal,
              modifier: modifier as SignalModifier<unknown, unknown, unknown>,
              payload,
            }),
          payload as P1
        )
    : (payload) => signalWave$.next({ signal, payload })) as Signal<unknown>
  signal._ = (payload) => () => signal(payload)
  signal.$ = signalWave$.pipe(
    filter((v) => v.signal === signal),
    map((v) => v.payload),
    share()
  )
  return (signal as unknown) as Signal<P1, P2, R>
}

export const signalWave$ = new Subject<SignalWave>()

/**
 * Signal debug helper.
 *
 * @function signalDebug
 * @returns {Subscription}
 */
export const signalDebug = (): Subscription =>
  signalWave$.subscribe((wave) => {
    console.group(`🔷🔹 signal${'modifier' in wave ? ' with modifier' : ''}`)
    console.dir(wave, { colors: true })
    console.groupEnd()
  })

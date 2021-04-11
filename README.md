<p align="center">
  <a href="https://github.com/sukazavr/rxjs-signal">
    <img src="https://github.com/sukazavr/rxjs-signal/blob/main/logo.png?raw=true" width="326" height="100" alt="rxjs-signal logo"/>
  </a>
</p>
<h1 align="center">rxjs-signal</h1>
<p align="center">
   <a href="https://badge.fury.io/js/rxjs-signal">
      <img src="https://badge.fury.io/js/rxjs-signal.svg" alt="npm version" height="18"/>
   </a>
   <a href="https://github.com/jasonkuhrt/template-typescript-lib/actions/workflows/trunk.yml">
      <img src="https://github.com/reactivex/rxjs/workflows/CI/badge.svg" alt="CI" height="18"/>
   </a>
</p>
<p align="center">
<a href="http://reactivex.io/rxjs" target="blank">RxJS</a> utility for creating signal streams.
</p>

## Installation and Usage

### ES6 via npm

```sh
npm i rxjs-signal
```

Function `ca` stands for create signal.

The type of `ca` is `cs<P1, P2, R>(modifier?: SignalModifier<P1, P2, R>): Signal<P1, P2, R>`. P1 is input payload type, `P2` is output payload type, `R` is a return type.

```ts
import { ca } from "rxjs-signal";

const signal = cs<number>();

signal.$.subscribe(console.log);

signal(1);

const curried = signal._(2);

curried();

// You will see in console:
// 1
// 2
```

### Interfaces

Basically `signal` is a function with static props:
- `$` shared Observable<P2>
- `_` currying helper `(payload: P1) => () => signal(payload)`

```ts
interface Signal<P1 = void, P2 = P1, R = void> {
  $: Observable<P2>
  _: (...args: P1 extends void ? unknown[] : [P1]) => () => R
  (...args: P1 extends void ? unknown[] : [P1]): R
}

type SignalModifier<P1, P2, R> = (emit: (payloadOutput: P2) => void, payloadInput: P1) => R
```

### General signal stream signalWave$

It's regular RxJS Subject which is used to emit every `signal` call. You should avoid to directly call it's `next`, `error` and `complite` methods. You can subscribe to `signalWave$` in case you need more control over the `signal` sequence or if you want to conditionally recall some `signal`.

```ts
interface SignalWave {
  signal: Signal<unknown>
  modifier?: SignalModifier<unknown, unknown, unknown>
  payload: unknown
}

export const signalWave$ = new Subject<SignalWave>()
```

### Debug mode

For dev environment you can activate debug mode by calling `signalDebug`. It will subscribe to `signalWave$` and it'll print all waves into the console.

```ts
import { signalDebug } from 'rxjs-signal';

if (process.env.NODE_ENV !== 'production') {
  signalDebug();
}
```

## Author

**Dmitrii Bykov**

- [github/sukazavr](https://github.com/sukazavr)
- [telegram/sukazavr](https://telegram.me/sukazavr)
- [linkedin/sukazavr](https://www.linkedin.com/in/sukazavr)

## License

Released under the [MIT License](LICENSE)

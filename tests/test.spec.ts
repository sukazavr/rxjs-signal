import { lastValueFrom } from 'rxjs';
import { Compiler, expecter } from 'ts-snippet'
import { cs } from '../src'
import { take } from 'rxjs/operators'

export const compiler: Compiler = (global as any).window ? undefined! : new Compiler({ strict: true })

describe('', () => {
  it('should receive value from cs().$', () => {
    expect.assertions(1)
    const signal = cs<number>()
    const result = lastValueFrom(signal.$.pipe(take(1)))
    signal(1)
    expect(result).resolves.toEqual(1)
  })
})

describe('types', () => {
  const expectSnippet = expecter(
    (code) => `
      import { cs } from "./src";
      ${code}
    `,
    compiler
  )

  it('should succeed to call signal w/o args from cs()', () => {
    expectSnippet(`
      cs()();
    `).toSucceed()
  })

  it('should succeed to call signal with many args from cs()', () => {
    expectSnippet(`
      cs()(1,2,3,4,5,6,7,8);
    `).toSucceed()
  })

  it('should succeed to infer types from cs()', () => {
    const snippet = expectSnippet(`
      const signal = cs();
      const $ = signal.$;
      const _ = signal._();
      const result = signal();
    `)
    snippet.toInfer('signal', 'Signal<void, void, void>')
    snippet.toInfer('$', 'Observable<void>')
    snippet.toInfer('_', '() => void')
    snippet.toInfer('result', 'void')
  })

  it('should fail to call signal w/o args from cs<number>()', () => {
    expectSnippet(`
      cs<number>()();
    `).toFail()
  })

  it('should fail to call signal with many args from cs<number>()', () => {
    expectSnippet(`
      cs<number>()(1,2,3,4,5,6,7,8);
    `).toFail()
  })

  it('should succeed to call signal with one correct args from cs<number>()', () => {
    expectSnippet(`
      cs<number>()(1);
    `).toSucceed()
  })

  it('should fail to call signal with one incorrect args from cs<number>()', () => {
    expectSnippet(`
      cs<number>()(null);
    `).toFail()
  })

  it('should succeed to infer types from cs<number>()', () => {
    const snippet = expectSnippet(`
      const signal = cs<number>();
      const $ = signal.$;
      const _ = signal._(1);
      const result = signal(1);
    `)
    snippet.toInfer('signal', 'Signal<number, number, void>')
    snippet.toInfer('$', 'Observable<number>')
    snippet.toInfer('_', '() => void')
    snippet.toInfer('result', 'void')
  })

  it('should succeed to infer types from cs<string, number, (x: number) => void>()', () => {
    const snippet = expectSnippet(`
      const signal = cs<string, number, (x: number) => void>((emit, str) => (x) => emit(x + Number(str)));
      const $ = signal.$;
      const _ = signal._('string');
      const result = signal('string');
      const finalResult = result(1);
    `)
    snippet.toInfer('signal', 'Signal<string, number, (x: number) => void>')
    snippet.toInfer('$', 'Observable<number>')
    snippet.toInfer('_', '() => (x: number) => void')
    snippet.toInfer('result', '(x: number) => void')
    snippet.toInfer('finalResult', 'void')
  })
})

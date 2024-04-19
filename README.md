
# `failerr`

Tools for type-safe handling of expected failure conditions through standard
control flow.

## Example 

```typescript
import { Fail, mkFail, isFail } from 'failerr';

const division = (num: number, div: number) => {
  if (div === 0) {
    return mkFail('division by zero', { code: 42 });
  }
  return num / div;
};

const res = division(7, 0);

if (isFail(res)) {
  res.message;    // The TypeScript compiler infers type "string"
  res.data.code;  // The TypeScript compiler infers type "number"
} else {
  res.message;    // The TypeScript compiler reports an error
}
```

## Rationale

The use of `Error`-based exceptions as a strategy for dealing with failure
conditions in the form of `throw` statements and `try/catch` blocks has a
few issues:

1. It's very slow
2. It completely bypasses TypeScript's compile-time type checking
3. It is a source of non-determinism and brittleness
4. It conflates expected and unexpected failure conditions

Modern languages, such as Rust, have addressed these concerns through their
native support of monadic types such as [`Option`][3] and [`Result`][4].
However, it is the author's opinion that userland JavaScript / TypeScript
implementations of these structures are not a good solution due to their
implications on code structure, performance and inspectability. 

A better solution for handling expected failure conditions is to represent
them as first-class values independent of the `Error` class and provide the
necessary helper functions to instantiate them and and tell them apart from
other values, implementing error handling through standard control flow.

An excellent piece of writing on this topic and a primary source of inspiration
for this library can be found in [Austral's approach to error handling][2].

## API

The `Fail` interface represents expected **fail**ure conditions that a program
should be able to handle while guaranteeing consistent internal state. 

`Fail` objects are created using the `mkFail()` functions. The `isFail()`
function helps with discriminating whether a value is a `Fail` object or not.

### `mkFail() `

```typescript
mkFail<D = {}>(message: string, data: D): Fail<D>
```

The `mkFail()` function can be used to create `Fail` objects whose `.message`
and `.data` properties will be set to the provided arguments.

Simple `Fail` with empty data:

```typescript
const fail: Fail = mkFail('some message');
fail.message;     // => 'some message'
fail.data;        // => empty, frozen object
```

`Fail` with specific data shape:

```typescript
const fail: Fail<{ code: number }> = mkFail('some message', { code: 42 });
fail.message;     // => 'some message'
fail.data.code;   // => 42
```

### `isFail()`

```typescript
isFail(val: any): val is Fail<any>
```

The `isFail()` is a user-defined type guard that helps with identifying
whether a value - normally the return value of a function - is a `Fail`
object or not:

```typescript
const value = (72 as Fail | number);

if (isFail(value)) {
  value.message;  // => TypeScript infers type "string"
}
```
When a function returns  as the union of `Fail` and
non-`Fail`

### Extending the `Fail` interface 

The Fail interface can be easily extended using types or interfaces:

```typescript
type FailWithCode = Fail<{ code: number }>;

const fooBar = (): number | FailWithCode => {
  return Math.random() > 0.5 ? 42 : mkFail({ code: 42 });
};
```

## Why an interface instead of a class?

Performance, mostly. Modeling `Fail` as an interface while instantiating
implementations using simple objects seems to deliver between 1.5x and
1.75x greater throughput in high-performance applications (such as parsers)
relative to using a class-based approach, though the difference decreases
as code gets JIT-compiled over many iterations.

## License

MIT

[1]: https://doc.rust-lang.org/std/result/
[2]: https://austral-lang.org/spec/spec.html#rationale-errors

[3]: https://doc.rust-lang.org/std/option/
[4]: https://doc.rust-lang.org/std/result/

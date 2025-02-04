[![npm][npm-image]][npm-url]
[![npm-downloads][npm-downloads-image]][npm-url]
[![semantic-release][semantic-release-image]][semantic-release-url]
<br />
[![code-style-prettier][code-style-prettier-image]][code-style-prettier-url]

[code-style-prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
[code-style-prettier-url]: https://github.com/prettier/prettier
[npm-downloads-image]: https://img.shields.io/npm/dm/@solana/codecs/experimental.svg?style=flat
[npm-image]: https://img.shields.io/npm/v/@solana/codecs/experimental.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@solana/codecs/v/experimental
[semantic-release-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release

# @solana/codecs

This package contains all types and helpers for encoding and decoding anything to and from a `Uint8Array`. It can be used standalone, but it is also exported as part of the Solana JavaScript SDK [`@solana/web3.js@experimental`](https://github.com/solana-labs/solana-web3.js/tree/master/packages/library).

No matter which serialization strategy we use, Codecs abstract away its implementation and offers a simple `encode` and `decode` interface. Codecs are also highly composable, allowing us to build complex data structures from simple building blocks.

Here's a quick example that encodes and decodes a simple `Person` object.

```ts
// Use composable codecs to build complex data structures.
type Person = { name: string; age: number };
const getPersonCodec = (): Codec<Person> =>
    getStructCodec([
        ['name', getStringCodec()],
        ['age', getU32Codec()],
    ]);

// Use your own codecs to encode and decode data.
const person = { name: 'John', age: 42 };
const personCodec = getPersonCodec();
const encodedPerson: Uint8Array = personCodec.encode(person);
const decodedPerson: Person = personCodec.decode(encodedPerson);
```

Whilst Codecs can both encode and decode, it is possible to only focus on encoding or decoding data, enabling the unused logic to be tree-shaken. For instance, here’s our previous example using Decoders only to decode a `Person` type.

```ts
const getPersonDecoder = (): Decoder<Person> =>
    getStructDecoder([
        ['name', getStringDecoder()],
        ['age', getU32Decoder()],
    ]);
```

The `@solana/codecs` package is composed of several smaller packages, each with its own set of responsibilities. You can learn more about codecs and how to create your own by reading their respective documentation.

-   [`@solana/codecs-core`](https://github.com/solana-labs/solana-web3.js/tree/master/packages/codecs-core) This package lays the foundation of codecs by providing core type and helper functions to create and compose them.
    -   [Composing codecs](https://github.com/solana-labs/solana-web3.js/tree/master/packages/codecs-core#composing-codecs).
    -   [Composing encoders and decoders](https://github.com/solana-labs/solana-web3.js/tree/master/packages/codecs-core#composing-encoders-and-decoders).
    -   [Combining encoders and decoders](https://github.com/solana-labs/solana-web3.js/tree/master/packages/codecs-core#combining-encoders-and-decoders).
    -   [Different From and To types](https://github.com/solana-labs/solana-web3.js/tree/master/packages/codecs-core#different-from-and-to-types).
    -   [Fixed-size and variable-size codecs](https://github.com/solana-labs/solana-web3.js/tree/master/packages/codecs-core#fixed-size-and-variable-size-codecs).
    -   [Creating custom codecs](https://github.com/solana-labs/solana-web3.js/tree/master/packages/codecs-core#creating-custom-codecs).
    -   [Mapping codecs](https://github.com/solana-labs/solana-web3.js/tree/master/packages/codecs-core#mapping-codecs).
    -   [Fixing the size of codecs](https://github.com/solana-labs/solana-web3.js/tree/master/packages/codecs-core#fixing-the-size-of-codecs).
    -   [Reversing codecs](https://github.com/solana-labs/solana-web3.js/tree/master/packages/codecs-core#reversing-codecs).
    -   [Byte helpers](https://github.com/solana-labs/solana-web3.js/tree/master/packages/codecs-core#byte-helpers).
-   [`@solana/codecs-numbers`](https://github.com/solana-labs/solana-web3.js/tree/master/packages/codecs-numbers) This package offers codecs for numbers of various sizes and characteristics.
    -   [Integer codecs](https://github.com/solana-labs/solana-web3.js/tree/master/packages/codecs-numbers#integer-codecs).
    -   [Decimal number codecs](https://github.com/solana-labs/solana-web3.js/tree/master/packages/codecs-numbers#decimal-number-codecs).
    -   [Short u16 codec](https://github.com/solana-labs/solana-web3.js/tree/master/packages/codecs-numbers#short-u16-codec).
-   [`@solana/codecs-strings`](https://github.com/solana-labs/solana-web3.js/tree/master/packages/codecs-strings) This package provides codecs for strings of various encodings and size strategies.
    -   [String helper codec](https://github.com/solana-labs/solana-web3.js/tree/master/packages/codecs-strings#string-helper-codec).
    -   [Utf8 codec](https://github.com/solana-labs/solana-web3.js/tree/master/packages/codecs-strings#utf8-codec).
    -   [Base 64 codec](https://github.com/solana-labs/solana-web3.js/tree/master/packages/codecs-strings#base-64-codec).
    -   [Base 58 codec](https://github.com/solana-labs/solana-web3.js/tree/master/packages/codecs-strings#base-58-codec).
    -   [Base 16 codec](https://github.com/solana-labs/solana-web3.js/tree/master/packages/codecs-strings#base-16-codec).
    -   [Base 10 codec](https://github.com/solana-labs/solana-web3.js/tree/master/packages/codecs-strings#base-10-codec).
    -   [Base X codec](https://github.com/solana-labs/solana-web3.js/tree/master/packages/codecs-strings#base-x-codec).
    -   [Re-slicing base X codec](https://github.com/solana-labs/solana-web3.js/tree/master/packages/codecs-strings#re-slicing-base-x-codec).
-   [`@solana/codecs-data-structures`](https://github.com/solana-labs/solana-web3.js/tree/master/packages/codecs-data-structures) This package offers a set of helpers for a variety of data structures such as objects, enums, arrays, maps, etc.
    -   [Array codec](https://github.com/solana-labs/solana-web3.js/tree/master/packages/codecs-data-structures#array-codec).
    -   [Set codec](https://github.com/solana-labs/solana-web3.js/tree/master/packages/codecs-data-structures#set-codec).
    -   [Map codec](https://github.com/solana-labs/solana-web3.js/tree/master/packages/codecs-data-structures#map-codec).
    -   [Tuple codec](https://github.com/solana-labs/solana-web3.js/tree/master/packages/codecs-data-structures#tuple-codec).
    -   [Struct codec](https://github.com/solana-labs/solana-web3.js/tree/master/packages/codecs-data-structures#struct-codec).
    -   [Scalar enum codec](https://github.com/solana-labs/solana-web3.js/tree/master/packages/codecs-data-structures#scalar-enum-codec).
    -   [Data enum codec](https://github.com/solana-labs/solana-web3.js/tree/master/packages/codecs-data-structures#data-enum-codec).
    -   [Boolean codec](https://github.com/solana-labs/solana-web3.js/tree/master/packages/codecs-data-structures#boolean-codec).
    -   [Nullable codec](https://github.com/solana-labs/solana-web3.js/tree/master/packages/codecs-data-structures#nullable-codec).
    -   [Bytes codec](https://github.com/solana-labs/solana-web3.js/tree/master/packages/codecs-data-structures#bytes-codec).
    -   [Bit array codec](https://github.com/solana-labs/solana-web3.js/tree/master/packages/codecs-data-structures#bit-array-codec).
    -   [Unit codec](https://github.com/solana-labs/solana-web3.js/tree/master/packages/codecs-data-structures#unit-codec).
-   [`@solana/options`](https://github.com/solana-labs/solana-web3.js/tree/master/packages/options) This package adds Rust-like `Options` to JavaScript and offers codecs and helpers to manage them.
    -   [Creating options](https://github.com/solana-labs/solana-web3.js/tree/master/packages/options#creating-options).
    -   [Option helpers](https://github.com/solana-labs/solana-web3.js/tree/master/packages/options#option-helpers).
    -   [Unwrapping options](https://github.com/solana-labs/solana-web3.js/tree/master/packages/options#unwrapping-options).
    -   [Option codec](https://github.com/solana-labs/solana-web3.js/tree/master/packages/options#option-codec).

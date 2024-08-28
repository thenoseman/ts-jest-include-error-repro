# ts-jest-include-error

Demonstration of an error occuring when using jest + ts-test and including files outside the "rootDir".

Do a `npm install` in every dir and then in "host-project" execute a `npm run test` (see below):

**ATTENTION**! There is a solution! See at the bottom :) Thanks https://github.com/ahnpnl!

---



`npm run test`: 

Test `withoutNodeModulePackage.test.ts` works. 

Test `withImportFromNodeModules` fails with `SyntaxError: Unexpected token 'export'`:

```bash
Details:

    /Users/bla/demo/included-project/node_modules/normalize-url/index.js:76
    export default function normalizeUrl(urlString, options) {
    ^^^^^^

    SyntaxError: Unexpected token 'export'

    > 1 | import normalizeUrl from "normalize-url";
        | ^
      2 |
      3 | export const withImportFromNodeModules = () => {
      4 |   console.log(normalizeUrl("https://something.com"));

      at Runtime.createScriptFromCode (node_modules/jest-runtime/build/index.js:1505:14)
      at Object.<anonymous> (../included-project/src/withImportFromNodeModules.ts:1:1)
      at Object.<anonymous> (test/unit/withNodeModules.test.ts:1:1)
```

## My debugging tries

I debugged `@jest/transform/build/ScriptTransformer.js` and checked if `shouldTransform` returns true for the test and package:

```.
shouldTransform .../host-project/test/unit/withNodeModules.test.ts true
shouldTransform ..../included-project/src/withImportFromNodeModules.ts true
shouldTransform ..../included-project/node_modules/normalize-url/index.js true
```

I checked that it is actually ts-test being used as transformer for all files in `transformSource`:
```js
 transformSource(filepath, content, options) {
    const filename = (0, _jestUtil().tryRealpath)(filepath);
    const { transformer, transformerConfig = {} } = this._getTransformer(filename) ?? {};
   
    console.log(`filename`, JSON.stringify(filename, null, 2));
    console.log(`transformer`, JSON.stringify(transformer, null, 2));
   
    const cacheFilePath = this._getFileCachePath(filename, content, options);
    const sourceMapPath = `${cacheFilePath}.map`;

```

```
filename ""..../included-project/node_modules/normalize-url/index.js"
transformer undefined
```

Was `undefined` so I set

```js
transform: {
  '^.+\\.(ts|js)$': 'ts-jest',
},
```

Result:

```
filename "..../included-project/node_modules/normalize-url/index.js"
transformer true (aka. is defined, aka TsJestTransformer)
```

I then checked if the transformer is actually called and it is (`dist/legacy/compiler/ts-compiler.js`)

I then looked at ` TsCompiler.prototype.getCompiledOutput`:

```js
 if (this._languageService) {
      ...
      var output = this._languageService.getEmitOutput(fileName);
      console.log(`output %s`, fileName, JSON.stringify(output, null, 2));
      ...
```

Output:
```json
output /Users/.../included-project/node_modules/normalize-url/index.js {
  "outputFiles": [],
  "emitSkipped": true,
  "diagnostics": []
}
```

Which produces ts-jest output:

```
ts-jest[ts-compiler] (WARN) Unable to process '/Users/.../included-project/node_modules/normalize-url/index.js', falling back to original file content. You can also configure Jest config option `transformIgnorePatterns` to ignore /Users/.../included-project/node_modules/normalize-url/index.js from transformation or make sure that `outDir` in your tsconfig is neither `''` or `'.'`
```

outDir is configured as `"outDir": "./build"` in both host and included project.

## Questions

Why is `emitSkipped = true` for the node_module? 

How can I get this setup to work in jest?

# Solution

Use the following in `jest.config.ts`:

```js
 transform: {
    '^.+\\.(ts|js)$': ['ts-jest', { isolatedModules: true }]
  },
```

See [isolatedModules](https://kulshekhar.github.io/ts-jest/docs/getting-started/options/isolatedModules) and [jest.config.working.ts](https://github.com/thenoseman/ts-jest-include-error-repro/blob/main/host-project/jest.config.working.ts)

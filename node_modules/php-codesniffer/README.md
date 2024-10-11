# php-codesniffer [![codecov](https://codecov.io/gh/tinovyatkin/php-codesniffer/branch/master/graph/badge.svg)](https://codecov.io/gh/tinovyatkin/php-codesniffer)

Executes `phpcs` over a given file(s) and return results as JSON.
Written in TypeScript, good test coverage, no dependencies.

```ts
import { version, lint } from './linter';

it('returns version', async () => {
  expect(await version('php ./test/phpcs.phar')).toBe('3.5.5');
  expect(semver.valid(await version())).toBeTruthy();
});

it('lints several files', async () => {
  const res = await lint(
    './test/fixtures/test1.php ./test/fixtures/test2.php',
    undefined,
    {
      standard: path.resolve(
        __dirname,
        '../test/preferBeautifierConfig/subFolder/phpcs.xml',
      ),
    },
  );
  expect(res.totals).toMatchInlineSnapshot(`
      Object {
        "errors": 13,
        "fixable": 13,
        "warnings": 1,
      }
    `);
  expect(Object.values(res.files)).toMatchSnapshot();
});
```

### License

MIT

import {
  main,
  action,
  call,
  useAbortSignal,
} from "effection";

const TIMEOUT = 5_000;

await main(function* () {
  yield* action(function* (resolve) {
    let timeoutId = setTimeout(() => {
      resolve();
    }, TIMEOUT);

    let retries = 2;
    let retries_500 = 5;

    while (retries > 0 && retries_500 > 0) {
      const signal = yield* useAbortSignal();
      const response = yield* call(fetch("https://google.com", { signal }));

      if (response.ok) {
        clearTimeout(timeoutId);
        break;
      }
      if (response.status >= 500) {
        retries_500--;
      } else {
        retries--;
      }
    }
    resolve();
  })
});

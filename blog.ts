import {
  run,
  call,
  useAbortSignal,
  sleep,
  race,
} from "effection";

function* fetchWithRetry() {
  let attempt = -1;

  while (true) {
    const signal = yield* useAbortSignal();
    const response = yield* call(fetch("https://google.com", { signal }));

    if (response.ok) {
      return yield* call(response.json());
    }
    let delayMs: number;

    // https://aws.amazon.com/ru/blogs/architecture/exponential-backoff-and-jitter/
    const backoff = Math.pow(2, attempt) * 1000;
    delayMs = Math.round((backoff * (1 + Math.random())) / 2);

    yield* sleep(delayMs);

    attempt++;
  }
}

function* timeout(duration: number) {
  yield* sleep(duration);
  throw new Error("reached timeout");
}

await run(function* () {
  const result = yield* race([
    fetchWithRetry(),
    timeout(60_000),
  ])
  console.log(result);
});


// 6. let's start at retries -1 and go up to maxTimeout

/*
  1. fetch call using effection
    const signal = yield* useAbortSignal();
    const response = yield* call(fetch("https://google.com", { signal }));

    if (response.ok) {
      return yield* call(response.json());
    }

  2. add exponential backoff
    wrap in while loop and attempt counter with backoff logic
    then add sleep

  3. structured concurrency to organize your functions
    use race and sleep (timeout()) to implement timeout without it being in the fetch code
  
  4. make function generic
*/

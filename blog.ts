import {
  main,
  call,
  useAbortSignal,
  sleep,
  race,
  Operation,
} from "effection";

function* retryWithBackoff<T>(fn: () => Operation<T>, options: { timeout: number }) {
  function* body() {
    let attempt = -1;
  
    while (true) {
      try {
        return yield* fn();
      } catch {
        let delayMs: number;
    
        // https://aws.amazon.com/ru/blogs/architecture/exponential-backoff-and-jitter/
        const backoff = Math.pow(2, attempt) * 1000;
        delayMs = Math.round((backoff * (1 + Math.random())) / 2);
    
        yield* sleep(delayMs);
    
        attempt++;
      }
    }
  }
  return race([
    body(),
    sleep(options.timeout)
  ])
}

await main(function* () {
  const result = yield* retryWithBackoff(function* () {
    const signal = yield* useAbortSignal();
    const response = yield* call(fetch("https://google.com", { signal }));

    if (response.ok) {
      return yield* call(response.json());
    } else {
      throw new Error(response.statusText)
    }
  }, {
    timeout: 60000,
  });
  console.log(result);
});


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

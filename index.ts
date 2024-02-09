import {
  main,
  sleep,
  race,
  Operation,
} from "effection";

interface Response {
  duration: number;
  status: number;
  ok: boolean;
}

function* fetch2(response: Response): Operation<Response> {
  console.log('sleeping', response.duration)
  yield* sleep(response.duration);
  return response;
}

const scenarios = {
  successOnFirstTry: [
    {
      duration: 0,
      status: 200,
      ok: true,
    },
  ],
}

// **********
const SCENARIO = scenarios.successOnFirstTry;
// **********

console.log(SCENARIO)

function* doesNotLog() {
  console.log('hi')
}

function* retryWithBackoff<T>(fn: (attempt: number) => Operation<T>, options: { timeout: number }) {
  function* body() {
    let attempt = -1;
  
    while (true) {
      try {
        const result = yield* fn(attempt);
        console.log("returning")
        return result;
      } catch (e) {
        let delayMs: number;
    
        // https://aws.amazon.com/ru/blogs/architecture/exponential-backoff-and-jitter/
        const backoff = Math.pow(2, attempt) * 1000;
        delayMs = Math.round((backoff * (1 + Math.random())) / 2);
    
        yield* sleep(delayMs);
    
        attempt++;
      }
    }
  }

  return yield* race([
    doesNotLog(),
    body(),
    sleep(options.timeout),
  ])
}

main(function* () {
  const result = yield* retryWithBackoff(function* (attempt) {
    const response = yield* fetch2(SCENARIO[attempt + 1]);

    if (response.ok) {
      return;
    } else {
      throw new Error(`${response.status}`);
    }
  }, {
    timeout: 60000,
  });
  console.log(result);
});

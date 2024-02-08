import {
  main,
  action,
  sleep,
  Operation,
} from "effection";

interface Response {
  duration: number;
  status: number;
  ok: boolean;
}

function fetch(response: Response): Operation<Response> {
  return action(function* (resolve) {
    console.log('sleeping', response.duration)
    yield* sleep(response.duration);
    resolve(response);
  });
}

const scenarios = {
  successOnFirstTry: [
    {
      duration: 0,
      status: 200,
      ok: true,
    },
  ],
  tooLong: [
    {
      duration: 2_500,
      status: 200,
      ok: true,
    },
  ],
  twoClientFails: [
    {
      duration: 0,
      status: 400,
      ok: false,
    },
    {
      duration: 0,
      status: 400,
      ok: false,
    },
  ],
  fiveServerFails: [
    {
      duration: 0,
      status: 500,
      ok: false,
    },
    {
      duration: 0,
      status: 500,
      ok: false,
    },
    {
      duration: 0,
      status: 500,
      ok: false,
    },
    {
      duration: 0,
      status: 500,
      ok: false,
    },
    {
      duration: 0,
      status: 500,
      ok: false,
    },
  ],
  twoTwoFails: [
    {
      duration: 0,
      status: 400,
      ok: false,
    },
    {
      duration: 0,
      status: 500,
      ok: false,
    },
    {
      duration: 0,
      status: 500,
      ok: false,
    },
    {
      duration: 0,
      status: 400,
      ok: false,
    },
  ],
}

// **********
const TIMEOUT = 2_000;
// const SCENARIO = scenarios.successOnFirstTry;
// const SCENARIO = scenarios.tooLong;
// const SCENARIO = scenarios.twoClientFails;
// const SCENARIO = scenarios.fiveServerFails;
const SCENARIO = scenarios.twoTwoFails;
// **********

console.log(SCENARIO)

function* fetchWithRetry() {
  let retries = -1;
  let sequence = 0;

  while (true) {
    if (!SCENARIO[sequence]) {
      throw new Error("Ran out of fetch scenarios")
    }
    const response = yield* fetch(SCENARIO[sequence]);
    if (response.ok) {
      return response;
    }
    sequence++;
    retries++;
  }
}

main(function* () {
  const result = yield* fetchWithRetry();
  console.log(result);
});

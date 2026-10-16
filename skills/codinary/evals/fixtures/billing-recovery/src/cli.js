import { calculateTotal } from "./billing.js";

class ArgumentError extends Error {
  constructor(code, message, options) {
    super(message, options);
    this.code = code;
  }
}

function readArgument(argumentsList) {
  if (argumentsList.length !== 1) {
    throw new ArgumentError(
      "ARGUMENT_COUNT",
      "Expected exactly one JSON argument",
    );
  }

  try {
    return JSON.parse(argumentsList[0]);
  } catch (error) {
    throw new ArgumentError("INVALID_JSON", "Argument must be valid JSON", {
      cause: error,
    });
  }
}

function describeFailure(error) {
  if (error instanceof ArgumentError) {
    return { exitCode: 2, error: { code: error.code, message: error.message } };
  }
  if (error instanceof TypeError) {
    return { exitCode: 2, error: { code: "INVALID_INPUT", message: error.message } };
  }
  if (error instanceof RangeError) {
    return { exitCode: 2, error: { code: "OUT_OF_RANGE", message: error.message } };
  }

  return {
    exitCode: 1,
    error: { code: "INTERNAL_ERROR", message: "Unable to calculate total" },
  };
}

try {
  const input = readArgument(process.argv.slice(2));
  const totalCents = calculateTotal(input);
  process.stdout.write(`${JSON.stringify({ totalCents })}\n`);
} catch (error) {
  const failure = describeFailure(error);
  process.stderr.write(`${JSON.stringify({ error: failure.error })}\n`);
  process.exitCode = failure.exitCode;
}

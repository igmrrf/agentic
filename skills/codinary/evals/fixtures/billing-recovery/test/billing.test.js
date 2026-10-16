import assert from "node:assert/strict";
import test from "node:test";
import { calculateTotal } from "../src/billing.js";

const VALID_TOTALS = [
  ["omitted discount defaults to zero", { unitCents: 1999, quantity: 2 }, 3998],
  ["explicit zero discount", { unitCents: 1250, quantity: 4, discountPercent: 0 }, 5000],
  ["zero price", { unitCents: 0, quantity: 1000, discountPercent: 37 }, 0],
  ["minimum quantity", { unitCents: 150, quantity: 1, discountPercent: 20 }, 120],
  ["maximum price and quantity", { unitCents: 100000, quantity: 1000 }, 100000000],
  ["full discount", { unitCents: 100000, quantity: 1000, discountPercent: 100 }, 0],
  ["one percent discount", { unitCents: 100, quantity: 1, discountPercent: 1 }, 99],
  ["ninety-nine percent discount", { unitCents: 100, quantity: 1, discountPercent: 99 }, 1],
  ["exact cents need no rounding", { unitCents: 100, quantity: 3, discountPercent: 50 }, 150],
  ["fraction below half rounds down", { unitCents: 101, quantity: 1, discountPercent: 51 }, 49],
  ["half cent rounds up", { unitCents: 101, quantity: 1, discountPercent: 50 }, 51],
  ["fraction above half rounds up", { unitCents: 101, quantity: 1, discountPercent: 49 }, 52],
  ["quantity is applied before rounding", { unitCents: 101, quantity: 3, discountPercent: 50 }, 152],
  ["half of the smallest price rounds up", { unitCents: 1, quantity: 1, discountPercent: 50 }, 1],
];

for (const [name, input, expected] of VALID_TOTALS) {
  test(name, () => {
    assert.equal(calculateTotal(input), expected);
  });
}

const INVALID_SHAPES = [
  ["undefined", undefined],
  ["null", null],
  ["array", []],
  ["populated array", [100, 1]],
  ["string", "billing"],
  ["number", 100],
  ["boolean", true],
  ["function", () => ({ unitCents: 100, quantity: 1 })],
  ["date", new Date(0)],
  ["inherited fields", Object.create({ unitCents: 100, quantity: 1 })],
  ["class instance", new (class BillingInput {})()],
  ["boxed number", new Number(100)],
];

for (const [name, input] of INVALID_SHAPES) {
  test(`rejects ${name} input`, () => {
    assert.throws(() => calculateTotal(input), {
      name: "TypeError",
      message: "input must be a plain object",
    });
  });
}

const MISSING_FIELDS = [
  ["both required fields", {}, "unitCents"],
  ["unitCents", { quantity: 1 }, "unitCents"],
  ["quantity", { unitCents: 100 }, "quantity"],
];

for (const [name, input, field] of MISSING_FIELDS) {
  test(`rejects missing ${name}`, () => {
    assert.throws(() => calculateTotal(input), {
      name: "TypeError",
      message: `${field} must be an own data property`,
    });
  });
}

const INHERITED_DESCRIPTORS = [
  ["unitCents", 100, { quantity: 1 }],
  ["quantity", 1, { unitCents: 100 }],
];

for (const [field, value, input] of INHERITED_DESCRIPTORS) {
  test(`rejects missing own ${field} with an inherited descriptor`, () => {
    const originalDescriptor = Object.getOwnPropertyDescriptor(Object.prototype, field);
    try {
      Object.defineProperty(Object.prototype, field, {
        value: { value },
        configurable: true,
      });
      assert.throws(() => calculateTotal(input), {
        name: "TypeError",
        message: `${field} must be an own data property`,
      });
    } finally {
      if (originalDescriptor === undefined) {
        delete Object.prototype[field];
      } else {
        Object.defineProperty(Object.prototype, field, originalDescriptor);
      }
    }
  });
}

const UNKNOWN_FIELDS = [
  ["enumerable field", { unitCents: 100, quantity: 1, currency: "USD" }],
  ["symbol field", { unitCents: 100, quantity: 1, [Symbol("extra")]: 1 }],
  ["hidden field", Object.defineProperty({ unitCents: 100, quantity: 1 }, "extra", { value: 1 })],
];

for (const [name, input] of UNKNOWN_FIELDS) {
  test(`rejects unknown ${name}`, () => {
    assert.throws(() => calculateTotal(input), {
      name: "TypeError",
      message: "input contains unknown fields",
    });
  });
}

test("rejects an accessor without invoking it", () => {
  let getterCalls = 0;
  const input = {
    unitCents: 100,
    quantity: 1,
    get discountPercent() {
      getterCalls += 1;
      return 50;
    },
  };

  assert.throws(() => calculateTotal(input), {
    name: "TypeError",
    message: "discountPercent must be an own data property",
  });
  assert.equal(getterCalls, 0);
});

const INVALID_NUMBERS = [
  ["string", "1"],
  ["undefined", undefined],
  ["null", null],
  ["boolean", true],
  ["NaN", Number.NaN],
  ["positive infinity", Number.POSITIVE_INFINITY],
  ["negative infinity", Number.NEGATIVE_INFINITY],
  ["fraction", 1.5],
  ["bigint", 1n],
  ["symbol", Symbol("number")],
];

for (const field of ["unitCents", "quantity", "discountPercent"]) {
  for (const [name, value] of INVALID_NUMBERS) {
    test(`rejects ${name} ${field}`, () => {
      const input = { unitCents: 100, quantity: 2, discountPercent: 25, [field]: value };
      assert.throws(() => calculateTotal(input), {
        name: "TypeError",
        message: `${field} must be a finite integer`,
      });
    });
  }
}

const OUT_OF_RANGE = [
  ["unitCents", -1, 0, 100000],
  ["unitCents", 100001, 0, 100000],
  ["quantity", 0, 1, 1000],
  ["quantity", 1001, 1, 1000],
  ["discountPercent", -1, 0, 100],
  ["discountPercent", 101, 0, 100],
];

for (const [field, value, minimum, maximum] of OUT_OF_RANGE) {
  test(`rejects out-of-range ${field} ${value}`, () => {
    const input = { unitCents: 100, quantity: 2, discountPercent: 25, [field]: value };
    assert.throws(() => calculateTotal(input), {
      name: "RangeError",
      message: `${field} must be between ${minimum} and ${maximum}`,
    });
  });
}

test("accepts a null-prototype plain object", () => {
  const input = Object.assign(Object.create(null), { unitCents: 100, quantity: 2 });
  assert.equal(calculateTotal(input), 200);
});

test("preserves a frozen caller-owned input", () => {
  const input = Object.freeze({ unitCents: 100, quantity: 2, discountPercent: 25 });
  assert.equal(calculateTotal(input), 150);
  assert.deepEqual(input, { unitCents: 100, quantity: 2, discountPercent: 25 });
});

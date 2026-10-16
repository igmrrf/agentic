const ALLOWED_FIELDS = ["unitCents", "quantity", "discountPercent"];
const PERCENT_DENOMINATOR = 100;

function readFields(input) {
  if (input === null || typeof input !== "object") {
    throw new TypeError("input must be a plain object");
  }

  const prototype = Object.getPrototypeOf(input);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new TypeError("input must be a plain object");
  }

  const descriptors = Object.getOwnPropertyDescriptors(input);
  const hasUnknownFields = Reflect.ownKeys(descriptors).some(
    (field) => !ALLOWED_FIELDS.includes(field),
  );
  if (hasUnknownFields) {
    throw new TypeError("input contains unknown fields");
  }

  return descriptors;
}

function readRequiredField(descriptors, name) {
  const descriptor = descriptors[name];
  if (descriptor === undefined || !Object.hasOwn(descriptor, "value")) {
    throw new TypeError(`${name} must be an own data property`);
  }

  return descriptor.value;
}

function requireInteger(value, { name, min, max }) {
  if (!Number.isInteger(value)) {
    throw new TypeError(`${name} must be a finite integer`);
  }
  if (value < min || value > max) {
    throw new RangeError(`${name} must be between ${min} and ${max}`);
  }

  return value;
}

function readBillingInput(input) {
  const descriptors = readFields(input);
  const unitCents = readRequiredField(descriptors, "unitCents");
  const quantity = readRequiredField(descriptors, "quantity");
  const discountPercent = Object.hasOwn(descriptors, "discountPercent")
    ? readRequiredField(descriptors, "discountPercent")
    : 0;

  requireInteger(unitCents, { name: "unitCents", min: 0, max: 100000 });
  requireInteger(quantity, { name: "quantity", min: 1, max: 1000 });
  requireInteger(discountPercent, { name: "discountPercent", min: 0, max: 100 });

  return { unitCents, quantity, discountPercent };
}

export function calculateTotal(input) {
  const { unitCents, quantity, discountPercent } = readBillingInput(input);
  const subtotalCents = unitCents * quantity;
  const discountedHundredths =
    subtotalCents * (PERCENT_DENOMINATOR - discountPercent);

  return Math.floor(discountedHundredths / PERCENT_DENOMINATOR);
}

const SECONDS_PER_MINUTE = 60;

export function parseDuration(duration) {
  const match = /^(?:(\d+)h)?(?:(\d+)m)?$/.exec(duration);
  if (!match || duration.length === 0) {
    throw new RangeError('Expected hours, minutes, or hours followed by minutes');
  }
  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  return (hours + minutes) * SECONDS_PER_MINUTE;
}

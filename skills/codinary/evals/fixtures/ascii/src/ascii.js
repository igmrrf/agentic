export function toAscii(text) {
  return text.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/\P{ASCII}/gu, '');
}

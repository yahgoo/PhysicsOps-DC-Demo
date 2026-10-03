export function signed(value: number, digits = 1): string {
  const rounded = value.toFixed(digits);
  const isZero = Number(rounded) === 0;
  return `${value > 0 && !isZero ? '+' : isZero ? '±' : ''}${isZero ? (0).toFixed(digits) : rounded}`;
}

export function fixed(value: number, digits = 1): string {
  return value.toFixed(digits);
}

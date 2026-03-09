export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp(t, 0, 1);
}

export function percentile(sortedArr: number[], p: number): number {
  if (sortedArr.length === 0) return 0;
  const index = Math.floor(sortedArr.length * clamp(p, 0, 1));
  return sortedArr[Math.min(index, sortedArr.length - 1)];
}

export function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function standardDeviation(arr: number[]): number {
  if (arr.length === 0) return 0;
  const avg = mean(arr);
  const squaredDiffs = arr.map(x => Math.pow(x - avg, 2));
  return Math.sqrt(mean(squaredDiffs));
}

export function formatNumber(n: number, decimals = 0): string {
  return n.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export function roundToNearest(value: number, nearest: number): number {
  return Math.round(value / nearest) * nearest;
}

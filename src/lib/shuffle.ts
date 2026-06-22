export function shuffleItems<T>(items: readonly T[]): T[] {
  return items
    .map((item, index) => ({ item, index, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort || a.index - b.index)
    .map(({ item }) => item);
}

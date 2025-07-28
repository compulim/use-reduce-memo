export default function arrayAsIterable<T>(array: T[]): Iterable<T> {
  return {
    [Symbol.iterator]() {
      return array.values();
    }
  };
}

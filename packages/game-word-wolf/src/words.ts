export interface WordWolfWordPair {
  readonly words: readonly [string, string];
}

export const defaultWordPairs: readonly WordWolfWordPair[] = [
  { words: ["Dog", "Cat"] },
  { words: ["Ocean", "Pool"] },
  { words: ["Coffee", "Tea"] },
  { words: ["Movie theater", "Karaoke"] }
];

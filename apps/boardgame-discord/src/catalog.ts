export type BoardgameCatalogId = "ito" | "just-one";

export interface BoardgameCatalogEntry {
  readonly id: BoardgameCatalogId;
  readonly name: string;
  readonly description: string;
  readonly createCommand: string;
  readonly joinCommand: string;
}

export const boardgameCatalog: readonly BoardgameCatalogEntry[] = [
  {
    id: "ito",
    name: "ITO",
    description: "A cooperative game of expressing numbers with words and guessing the order.",
    createCommand: "/ito create",
    joinCommand: "/ito join"
  },
  {
    id: "just-one",
    name: "Just One",
    description: "A cooperative game of guessing a secret word from the group's hints.",
    createCommand: "/just-one create",
    joinCommand: "/just-one join"
  }
];

export function getBoardgameCatalogEntry(id: string): BoardgameCatalogEntry | undefined {
  return boardgameCatalog.find((entry) => entry.id === id);
}

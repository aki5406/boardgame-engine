import { describe, expect, it } from "vitest";

import { boardgameCatalog, getBoardgameCatalogEntry } from "./catalog.js";

describe("boardgameCatalog", () => {
  it("lists ITO and Just One with their create and join commands", () => {
    expect(boardgameCatalog.map((entry) => entry.id)).toEqual(["ito", "just-one"]);
    expect(new Set(boardgameCatalog.map((entry) => entry.id)).size).toBe(boardgameCatalog.length);
    expect(getBoardgameCatalogEntry("ito")).toMatchObject({
      createCommand: "/ito create",
      joinCommand: "/ito join"
    });
    expect(getBoardgameCatalogEntry("just-one")).toMatchObject({
      createCommand: "/just-one create",
      joinCommand: "/just-one join"
    });
  });
});

import type { ItoThemeSelectedEvent } from "./event.js";

export function createItoThemeSelectedEvent(theme: string): ItoThemeSelectedEvent {
  return {
    type: "ito.themeSelected",
    theme
  };
}

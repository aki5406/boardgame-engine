export function createJustOneHintConfirmationReply(status: "submitted" | "updated"): string {
  return status === "submitted" ? "Hint submitted." : "Hint updated.";
}

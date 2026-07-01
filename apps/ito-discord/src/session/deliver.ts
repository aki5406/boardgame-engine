import { getItoNumberDeliveryView, type ItoNumberDeliveryItem } from "./number-delivery.js";
import type { ItoDiscordSessionRegistry } from "./registry.js";

export type DeliverItoDiscordNumbersResult =
  | Readonly<{ status: "delivered"; succeeded: number; failed: number }>
  | Readonly<{ status: "notAssigned" }>
  | Readonly<{ status: "notFound" }>;

export interface DeliverItoDiscordNumbersInput {
  readonly channelId: string;
  readonly registry: ItoDiscordSessionRegistry;
  readonly sendDirectMessage: SendItoNumberDirectMessage;
}

export type SendItoNumberDirectMessage = (input: ItoNumberDirectMessageInput) => Promise<void>;

export type ItoNumberDirectMessageInput = Readonly<{
  playerId: string;
  message: string;
}>;

export async function deliverItoDiscordNumbers(
  input: DeliverItoDiscordNumbersInput
): Promise<DeliverItoDiscordNumbersResult> {
  const deliveryView = getItoNumberDeliveryView({
    channelId: input.channelId,
    registry: input.registry
  });

  if (deliveryView.status !== "ready") {
    return deliveryView;
  }

  const deliveryResults = await Promise.all(
    deliveryView.items.map((item) => deliverNumber(item, input.sendDirectMessage))
  );

  return {
    status: "delivered",
    succeeded: deliveryResults.filter((result) => result === "succeeded").length,
    failed: deliveryResults.filter((result) => result === "failed").length
  };
}

async function deliverNumber(
  item: ItoNumberDeliveryItem,
  sendDirectMessage: SendItoNumberDirectMessage
): Promise<"succeeded" | "failed"> {
  try {
    await sendDirectMessage({
      playerId: item.playerId,
      message: `Your ITO number is: ${item.number}`
    });

    return "succeeded";
  } catch {
    return "failed";
  }
}

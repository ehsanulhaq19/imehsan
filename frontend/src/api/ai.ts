import { fetchApi } from "./client";

export type AiChatPayload = {
  guestSessionId: string;
  guestName?: string;
  guestEmail?: string;
  message: string;
};

export function sendAiChat(payload: AiChatPayload) {
  return fetchApi("/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

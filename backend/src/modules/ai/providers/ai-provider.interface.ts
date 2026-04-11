export interface AiChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiProvider {
  readonly name: string;
  complete(messages: AiChatMessage[]): Promise<string>;
}

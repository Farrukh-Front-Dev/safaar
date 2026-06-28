export interface SmsMessage {
  phone: string;
  text: string;
  requestId?: string;
}

export interface SmsProvider {
  send(
    message: SmsMessage,
  ): Promise<{ providerMessageId: string; accepted: boolean }>;
}

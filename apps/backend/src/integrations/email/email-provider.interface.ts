export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
  requestId?: string;
}

export interface EmailProvider {
  send(
    message: EmailMessage,
  ): Promise<{ providerMessageId: string; accepted: boolean }>;
}

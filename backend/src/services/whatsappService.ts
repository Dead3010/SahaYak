const BASE_URL = 'https://api.green-api.com';

function getChatId(phone: string): string {
  // Group IDs are stored as numeric string of group ID — append @g.us
  // Personal IDs are phone numbers — append @c.us
  const digits = phone.replace(/\D/g, '');
  // Green API group IDs are typically 18+ digits; phone numbers are 10-15
  const isGroup = digits.length > 15;
  return isGroup ? `${digits}@g.us` : `${digits}@c.us`;
}

export interface WhatsAppMessage {
  type: 'incoming' | 'outgoing';
  textMessage: string;
  timestamp: number;
  senderName: string;
}

export async function getChatHistory(phone: string, count = 50): Promise<WhatsAppMessage[]> {
  const instanceId = process.env.GREEN_API_INSTANCE_ID;
  const apiToken = process.env.GREEN_API_TOKEN;

  if (!instanceId || !apiToken) throw new Error('GREEN_API_INSTANCE_ID or GREEN_API_TOKEN not set');

  const chatId = getChatId(phone);
  const url = `${BASE_URL}/waInstance${instanceId}/getChatHistory/${apiToken}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, count }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Green API error: ${text}`);
  }

  const data = await response.json() as Array<{
    type: string;
    typeMessage?: string;
    textMessage?: string;
    extendedTextMessage?: { text?: string };
    timestamp: number;
    senderName?: string;
  }>;

  return data
    .map((m) => {
      const text =
        m.textMessage ||
        m.extendedTextMessage?.text ||
        null;
      if (!text) return null;
      return {
        type: m.type === 'incoming' ? 'incoming' : ('outgoing' as const),
        textMessage: text,
        timestamp: m.timestamp,
        senderName: m.senderName || '',
      };
    })
    .filter((m): m is WhatsAppMessage => m !== null);
}

export async function getContactName(phone: string): Promise<string | null> {
  const instanceId = process.env.GREEN_API_INSTANCE_ID;
  const apiToken = process.env.GREEN_API_TOKEN;

  if (!instanceId || !apiToken) return null;

  const chatId = getChatId(phone);
  const url = `${BASE_URL}/waInstance${instanceId}/getContactInfo/${apiToken}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId }),
    });
    if (!response.ok) return null;
    const data = await response.json() as { name?: string; contactName?: string };
    return data.name || data.contactName || null;
  } catch {
    return null;
  }
}

export async function sendWhatsAppMessage(phone: string, message: string): Promise<void> {
  const instanceId = process.env.GREEN_API_INSTANCE_ID;
  const apiToken = process.env.GREEN_API_TOKEN;

  if (!instanceId || !apiToken) throw new Error('GREEN_API_INSTANCE_ID or GREEN_API_TOKEN not set');

  const url = `${BASE_URL}/waInstance${instanceId}/sendMessage/${apiToken}`;
  const chatId = getChatId(phone);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, message }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Green API error: ${text}`);
  }
}

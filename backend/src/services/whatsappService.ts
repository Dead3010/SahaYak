const BASE_URL = 'https://api.green-api.com';

function getChatId(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return `${digits}@c.us`;
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

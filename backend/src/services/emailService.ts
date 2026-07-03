import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendEmailOptions {
  to: string;
  toName: string;
  subject: string;
  body: string;
  replyToTicketId?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const fromName = process.env.EMAIL_FROM_NAME || 'HelpDesk Support';
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

  const { error } = await resend.emails.send({
    from: `${fromName} <${fromEmail}>`,
    to: options.to.trim(),
    subject: options.subject.startsWith('Re:') ? options.subject : `Re: ${options.subject}`,
    text: options.body,
    html: options.body.replace(/\n/g, '<br>'),
  });

  if (error) throw new Error(error.message);
}

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export interface SendEmailOptions {
  to: string;
  toName: string;
  subject: string;
  body: string;
  replyToTicketId?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  await transporter.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME || 'HelpDesk Support'}" <${process.env.GMAIL_USER}>`,
    to: `"${options.toName}" <${options.to}>`,
    subject: options.subject.startsWith('Re:') ? options.subject : `Re: ${options.subject}`,
    text: options.body,
    html: options.body.replace(/\n/g, '<br>'),
  });
}

import nodemailer from 'nodemailer';
import { renderEmailTemplate } from './emailTemplateRenderer.service.js';

const createTransporter = () => {
  const user = process.env.GMAIL_EMAIL || process.env['Gmail:Email'];
  const pass = process.env.GMAIL_APP_PASSWORD || process.env['Gmail:AppPassword'];

  if (!user || !pass) {
    throw new Error('Thiếu cấu hình GMAIL_EMAIL hoặc GMAIL_APP_PASSWORD');
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user, pass }
  });
};

export const sendEmail = async ({ to, subject, htmlMessage }) => {
  const transporter = createTransporter();
  const html = await renderEmailTemplate(subject, htmlMessage);

  await transporter.sendMail({
    from: `"Bác Sĩ Ảo" <${process.env.GMAIL_EMAIL || process.env['Gmail:Email']}>`,
    to,
    subject,
    html
  });
};

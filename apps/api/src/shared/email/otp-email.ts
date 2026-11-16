import { renderEmailTemplate } from './email-template.js';

const templates = {
  email_verification: 'email-verification',
  password_reset: 'password-reset',
} as const;

export function renderOtpEmail({ purpose, otp }: { purpose: keyof typeof templates; otp: string }) {
  return renderEmailTemplate(templates[purpose], { otp });
}

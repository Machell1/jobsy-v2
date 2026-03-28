import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@jobsy.app';
const FROM_NAME = process.env.FROM_NAME || 'Jobsy';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Generic email sender via SendGrid.
 */
export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<void> {
  await sgMail.send({
    to,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject,
    html,
  });
}

/**
 * Send a 6-digit verification code email.
 */
export async function sendVerificationEmail(to: string, code: string): Promise<void> {
  await sendEmail({
    to,
    subject: 'Verify your Jobsy account',
    html: `
      <h2>Verify your email</h2>
      <p>Your verification code is:</p>
      <h1 style="letter-spacing:6px;font-size:36px;">${code}</h1>
      <p>This code expires in 10 minutes.</p>
    `,
  });
}

/**
 * Send a password-reset link.
 */
export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  await sendEmail({
    to,
    subject: 'Reset your Jobsy password',
    html: `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password. It expires in 1 hour.</p>
      <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;border-radius:8px;text-decoration:none;">Reset Password</a>
      <p>If you did not request this, you can safely ignore this email.</p>
    `,
  });
}

export interface BookingDetails {
  serviceName: string;
  providerName: string;
  date: string;
  time: string;
  totalPrice: string;
}

/**
 * Send a booking confirmation email.
 */
export async function sendBookingConfirmation(
  to: string,
  details: BookingDetails,
): Promise<void> {
  await sendEmail({
    to,
    subject: 'Booking Confirmed — Jobsy',
    html: `
      <h2>Booking Confirmed!</h2>
      <p>Your booking has been confirmed with the following details:</p>
      <ul>
        <li><strong>Service:</strong> ${details.serviceName}</li>
        <li><strong>Provider:</strong> ${details.providerName}</li>
        <li><strong>Date:</strong> ${details.date}</li>
        <li><strong>Time:</strong> ${details.time}</li>
        <li><strong>Total:</strong> ${details.totalPrice}</li>
      </ul>
      <p>You can view and manage your booking in the Jobsy app.</p>
    `,
  });
}

/**
 * Send a claim verification code to a provider.
 */
export async function sendClaimCode(to: string, businessName: string, code: string): Promise<void> {
  await sendEmail({
    to,
    subject: 'Claim Your Jobsy Business Profile',
    html: `
      <h2>Claim Your Business on Jobsy</h2>
      <p>Someone is trying to claim the business profile for <strong>${businessName}</strong> on Jobsy.</p>
      <p>If this is you, use this verification code:</p>
      <h1 style="letter-spacing:6px;font-size:36px;background:#f3f4f6;padding:16px;border-radius:8px;text-align:center;">${code}</h1>
      <p>This code expires in 24 hours.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
  });
}

/**
 * Send a claim invitation email to a provider with their unique claim code.
 */
export async function sendClaimInvitation(to: string, businessName: string, claimCode: string): Promise<void> {
  const claimUrl = `https://www.jobsyja.com/claim?code=${claimCode}`;
  await sendEmail({
    to,
    subject: 'Your business is listed on Jobsy - claim your free profile',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#059669;padding:24px;text-align:center;border-radius:12px 12px 0 0;">
          <h1 style="color:#fff;margin:0;font-size:28px;">Jobsy</h1>
          <p style="color:#d1fae5;margin:4px 0 0;font-size:14px;">Jamaica's Service Marketplace</p>
        </div>
        <div style="padding:32px;background:#fff;border:1px solid #e5e7eb;border-top:none;">
          <h2 style="color:#111827;margin:0 0 16px;">Hi ${businessName},</h2>
          <p style="color:#4b5563;line-height:1.6;">Great news! Your business is already listed on <strong>Jobsy</strong>, Jamaica's free service marketplace. Customers can find and contact you right now.</p>
          <p style="color:#4b5563;line-height:1.6;">To take full control of your listing, use your unique claim code:</p>
          <div style="background:#f0fdf4;border:2px solid #059669;border-radius:12px;padding:20px;text-align:center;margin:24px 0;">
            <p style="margin:0 0 8px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:2px;">Your Claim Code</p>
            <h1 style="letter-spacing:6px;font-size:32px;color:#059669;margin:0;font-family:monospace;">${claimCode}</h1>
          </div>
          <div style="text-align:center;margin:24px 0;">
            <a href="${claimUrl}" style="display:inline-block;padding:14px 32px;background:#059669;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">Claim My Profile</a>
          </div>
          <p style="color:#4b5563;line-height:1.6;">With a verified profile you can:</p>
          <ul style="color:#4b5563;line-height:1.8;">
            <li>Edit your services and pricing</li>
            <li>Respond to booking requests</li>
            <li>Add photos to your listings</li>
            <li>Receive customer reviews</li>
          </ul>
          <p style="color:#4b5563;line-height:1.6;"><strong>This is completely free.</strong> No fees, no commissions. Jobsy is built for Jamaican service providers.</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
          <p style="color:#9ca3af;font-size:12px;">If this email wasn't meant for you, you can safely ignore it. Your information was sourced from a public business listing.</p>
        </div>
        <div style="background:#f9fafb;padding:16px;text-align:center;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none;">
          <p style="color:#9ca3af;font-size:12px;margin:0;">Jobsy Jamaica | <a href="https://www.jobsyja.com" style="color:#059669;">jobsyja.com</a></p>
        </div>
      </div>
    `,
  });
}

/**
 * Send a welcome email after registration.
 */
export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  await sendEmail({
    to,
    subject: 'Welcome to Jobsy!',
    html: `
      <h2>Welcome, ${name}!</h2>
      <p>We are excited to have you on Jobsy. Start exploring services near you or set up your provider profile to begin accepting bookings.</p>
      <p>If you have any questions, feel free to reach out to our support team.</p>
    `,
  });
}

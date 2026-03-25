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

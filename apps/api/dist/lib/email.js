"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
exports.sendVerificationEmail = sendVerificationEmail;
exports.sendPasswordResetEmail = sendPasswordResetEmail;
exports.sendBookingConfirmation = sendBookingConfirmation;
exports.sendWelcomeEmail = sendWelcomeEmail;
const mail_1 = __importDefault(require("@sendgrid/mail"));
mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@jobsy.app';
const FROM_NAME = process.env.FROM_NAME || 'Jobsy';
/**
 * Generic email sender via SendGrid.
 */
async function sendEmail({ to, subject, html }) {
    await mail_1.default.send({
        to,
        from: { email: FROM_EMAIL, name: FROM_NAME },
        subject,
        html,
    });
}
/**
 * Send a 6-digit verification code email.
 */
async function sendVerificationEmail(to, code) {
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
async function sendPasswordResetEmail(to, resetUrl) {
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
/**
 * Send a booking confirmation email.
 */
async function sendBookingConfirmation(to, details) {
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
async function sendWelcomeEmail(to, name) {
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
//# sourceMappingURL=email.js.map
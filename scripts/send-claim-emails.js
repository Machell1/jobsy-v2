#!/usr/bin/env node

/**
 * Send Claim Invitation Emails
 *
 * Reads outreach-data.json from the migration script and sends
 * claim invitation emails to all providers with email addresses.
 *
 * Uses SendGrid via the Jobsy email lib.
 * Rate limited to 2 emails/second to avoid throttling.
 */

const sgMail = require('@sendgrid/mail');
const fs = require('fs');
const path = require('path');

// Load SendGrid API key from env or .env
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
if (!SENDGRID_API_KEY) {
  console.error('ERROR: SENDGRID_API_KEY environment variable is required');
  console.error('Set it with: SENDGRID_API_KEY=SG.xxx node scripts/send-claim-emails.js');
  process.exit(1);
}

sgMail.setApiKey(SENDGRID_API_KEY);

const FROM_EMAIL = 'jobsy@jobsyja.com';
const FROM_NAME = 'Jobsy';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function buildClaimEmail(businessName, claimCode) {
  const claimUrl = `https://www.jobsyja.com/claim?code=${claimCode}`;
  return {
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
  };
}

async function main() {
  const dataPath = path.join(__dirname, 'outreach-data.json');
  if (!fs.existsSync(dataPath)) {
    console.error('ERROR: outreach-data.json not found. Run migrate-unclaimed-to-services.js first.');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const withEmail = data.filter(d => d.email && !d.email.includes('@unclaimed.'));

  console.log(`=== Send Claim Invitation Emails ===`);
  console.log(`Total providers: ${data.length}`);
  console.log(`With real email: ${withEmail.length}`);
  console.log(`From: ${FROM_EMAIL}`);
  console.log('');

  let sent = 0;
  let failed = 0;
  const failedList = [];

  for (let i = 0; i < withEmail.length; i++) {
    const provider = withEmail[i];
    const { subject, html } = buildClaimEmail(provider.businessName, provider.claimCode);

    try {
      await sgMail.send({
        to: provider.email,
        from: { email: FROM_EMAIL, name: FROM_NAME },
        subject,
        html,
      });
      sent++;

      if (sent % 10 === 0) {
        console.log(`  Sent: ${sent}/${withEmail.length}`);
      }
    } catch (err) {
      failed++;
      failedList.push({ email: provider.email, error: err.message });
    }

    // Rate limit: 2 emails per second
    await sleep(500);
  }

  console.log('');
  console.log('=== Email Sending Complete ===');
  console.log(`  Sent: ${sent}`);
  console.log(`  Failed: ${failed}`);

  if (failedList.length > 0) {
    console.log('  Failed emails:');
    failedList.forEach(f => console.log(`    ${f.email}: ${f.error}`));
    fs.writeFileSync(path.join(__dirname, 'failed-emails.json'), JSON.stringify(failedList, null, 2));
  }
}

main().catch(err => { console.error('Email sending failed:', err); process.exit(1); });

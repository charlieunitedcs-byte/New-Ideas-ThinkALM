import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAuth, type AuthenticatedRequest } from '../middleware/auth';

// Email sending API endpoint
// This uses Resend (resend.com) for email delivery
// Set RESEND_API_KEY in Vercel environment variables
// PROTECTED: Requires JWT authentication

interface SendEmailRequest {
  type: 'client-signup' | 'report' | 'notification';
  to: string;
  data: {
    // For client signup
    signupLink?: string;
    companyName?: string;
    contactName?: string;

    // For reports
    reportType?: string;
    reportData?: any;
    attachmentUrl?: string;

    // For notifications
    subject?: string;
    message?: string;
  };
}

export default async function handler(
  req: AuthenticatedRequest,
  res: VercelResponse,
) {
  // Set CORS headers - whitelist specific origins
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
  const origin = req.headers.origin || '';

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // AUTHENTICATION REQUIRED - Verify JWT token
  const isAuthenticated = await verifyAuth(req, res);
  if (!isAuthenticated) {
    // verifyAuth already sent the 401 response
    return;
  }

  // Log authenticated request for audit trail
  console.log(`📧 Email send requested by user: ${req.userId} (${req.userEmail})`);

  try {
    const { type, to, data } = req.body as SendEmailRequest;

    if (!to) {
      return res.status(400).json({ error: 'Recipient email required' });
    }

    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      // In development/testing, just log and return success
      console.log('📧 Email would be sent:', { type, to, data });
      return res.status(200).json({
        success: true,
        message: 'Email simulated (RESEND_API_KEY not configured)'
      });
    }

    let emailHtml = '';
    let subject = '';

    // Generate email based on type
    switch (type) {
      case 'client-signup':
        subject = `Complete Your Think ABC Registration - ${data.companyName}`;
        emailHtml = generateClientSignupEmail(data.signupLink!, data.companyName!, data.contactName);
        break;

      case 'report':
        subject = `Your ${data.reportType} Report - Think ABC`;
        emailHtml = generateReportEmail(data.reportType!, data.reportData, data.attachmentUrl);
        break;

      case 'notification':
        subject = data.subject || 'Notification from Think ABC';
        emailHtml = generateNotificationEmail(data.message!);
        break;

      default:
        return res.status(400).json({ error: 'Invalid email type' });
    }

    // Send via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: process.env.SENDER_EMAIL || 'Think ABC <noreply@thinkalm.ai>',
        to: [to],
        subject: subject,
        html: emailHtml,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', result);
      return res.status(500).json({ error: 'Failed to send email', details: result });
    }

    // Also notify admin for client signups
    if (type === 'client-signup') {
      await notifyAdmin(resendApiKey, {
        companyName: data.companyName!,
        email: to,
        contactName: data.contactName || 'Not provided'
      });
    }

    return res.status(200).json({ success: true, messageId: result.id });

  } catch (error) {
    console.error('Email sending error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Notify admin when new signup occurs
async function notifyAdmin(apiKey: string, data: { companyName: string; email: string; contactName: string }) {
  const adminEmail = process.env.ADMIN_EMAIL || 'charlie@thinkalm.ai';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; font-size: 24px; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .detail { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #ef4444; }
          .detail strong { color: #ef4444; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 New Client Signup</h1>
          </div>
          <div class="content">
            <p>A new client has started the signup process:</p>
            <div class="detail">
              <strong>Company:</strong> ${data.companyName}
            </div>
            <div class="detail">
              <strong>Contact:</strong> ${data.contactName}
            </div>
            <div class="detail">
              <strong>Email:</strong> ${data.email}
            </div>
            <div class="detail">
              <strong>Time:</strong> ${new Date().toLocaleString()}
            </div>
            <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
              They will receive a signup link to complete their registration.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: process.env.SENDER_EMAIL || 'Think ABC <noreply@thinkalm.ai>',
      to: [adminEmail],
      subject: `New Client Signup: ${data.companyName}`,
      html: html,
    }),
  });
}

// Email template for client signup
function generateClientSignupEmail(signupLink: string, companyName: string, contactName?: string): string {
  const greeting = contactName ? `Hi ${contactName}` : 'Hello';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
          .logo { font-size: 32px; font-weight: bold; color: white; margin-bottom: 10px; }
          .tagline { color: #fca5a5; font-size: 12px; letter-spacing: 2px; }
          .content { background: #f9fafb; padding: 40px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #ef4444; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .button:hover { background: #dc2626; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .info-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 20px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🤖 Think ABC</div>
            <div class="tagline">AI SALES OS</div>
          </div>
          <div class="content">
            <h2 style="color: #1f2937; margin-top: 0;">Welcome to Think ABC!</h2>
            <p>${greeting},</p>
            <p>You've been invited to join <strong>${companyName}</strong> on Think ABC, the AI-powered sales operating system.</p>
            <p>To complete your registration and set up your account, click the button below:</p>
            <div style="text-align: center;">
              <a href="${signupLink}" class="button">Complete Your Registration →</a>
            </div>
            <div class="info-box">
              <strong>⏱️ This link expires in 7 days</strong><br>
              Please complete your registration soon to get started.
            </div>
            <p><strong>What's Next?</strong></p>
            <ul>
              <li>Fill out your company and contact information</li>
              <li>Set your secure password</li>
              <li>Start using AI-powered sales tools immediately</li>
            </ul>
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              If you didn't expect this email, you can safely ignore it.
            </p>
          </div>
          <div class="footer">
            <p>Think ABC - AI Sales Operating System<br>
            Need help? Contact support@thinkalm.ai</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Email template for reports
function generateReportEmail(reportType: string, reportData: any, attachmentUrl?: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .stat-card { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #ef4444; }
          .button { display: inline-block; background: #ef4444; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Your ${reportType} Report</h1>
          </div>
          <div class="content">
            <p>Your automated report is ready!</p>
            ${reportData ? `<div class="stat-card">${JSON.stringify(reportData, null, 2)}</div>` : ''}
            ${attachmentUrl ? `<div style="text-align: center;"><a href="${attachmentUrl}" class="button">Download Full Report</a></div>` : ''}
            <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
              Generated on ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Email template for notifications
function generateNotificationEmail(message: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .content { background: #f9fafb; padding: 30px; border-radius: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="content">
            ${message}
          </div>
        </div>
      </body>
    </html>
  `;
}

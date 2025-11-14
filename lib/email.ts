import nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }
  return transporter;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  const transport = getTransporter();

  await transport.sendMail({
    from: process.env.EMAIL_FROM || 'noreply@wawacafe.com',
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });
}

export async function sendVerificationPinEmail(
  email: string,
  pin: string
): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verification PIN</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .logo {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo img {
            max-width: 120px;
            height: auto;
            margin: 0 auto;
          }
          .logo h1 {
            color: #1a4d2e;
            margin: 10px 0 0 0;
            font-size: 24px;
          }
          .pin-box {
            background-color: #f3f4f6;
            border: 2px solid #1a4d2e;
            border-radius: 8px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
          }
          .pin {
            font-size: 48px;
            font-weight: bold;
            color: #1a4d2e;
            letter-spacing: 8px;
            margin: 0;
          }
          .message {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 20px;
          }
          .warning {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin-top: 30px;
            font-size: 14px;
            color: #92400e;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #9ca3af;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <img src="${process.env.NEXT_PUBLIC_APP_URL}/logo.png" alt="Wawa Garden Bar" />
            <h1>Wawa Garden Bar</h1>
          </div>
          
          <p class="message">
            Hello! You requested to sign in to your Wawa Garden Bar account.
            Please use the verification PIN below to complete your login:
          </p>
          
          <div class="pin-box">
            <p class="pin">${pin}</p>
          </div>
          
          <p class="message">
            This PIN will expire in <strong>10 minutes</strong>.
            If you didn't request this PIN, please ignore this email.
          </p>
          
          <div class="warning">
            <strong>⚠️ Security Notice:</strong> Never share this PIN with anyone.
            Wawa Garden Bar staff will never ask for your verification PIN.
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Wawa Garden Bar. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    Wawa Garden Bar - Verification PIN
    
    Your verification PIN is: ${pin}
    
    This PIN will expire in 10 minutes.
    If you didn't request this PIN, please ignore this email.
    
    Never share this PIN with anyone.
    
    © ${new Date().getFullYear()} Wawa Garden Bar
  `;

  await sendEmail({
    to: email,
    subject: 'Your Wawa Garden Bar Verification PIN',
    html,
    text,
  });
}

export async function sendWelcomeEmail(
  email: string,
  name?: string
): Promise<void> {
  const displayName = name || 'there';
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Wawa Garden Bar</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .logo {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo img {
            max-width: 120px;
            height: auto;
            margin: 0 auto;
          }
          .logo h1 {
            color: #1a4d2e;
            margin: 10px 0 0 0;
            font-size: 24px;
          }
          .welcome-message {
            font-size: 18px;
            margin-bottom: 20px;
          }
          .features {
            background-color: #f9fafb;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
          }
          .feature {
            margin-bottom: 15px;
          }
          .feature-icon {
            display: inline-block;
            margin-right: 10px;
          }
          .cta-button {
            display: inline-block;
            background-color: #1a4d2e;
            color: #ffffff;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #9ca3af;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <img src="${process.env.NEXT_PUBLIC_APP_URL}/logo.png" alt="Wawa Garden Bar" />
            <h1>Wawa Garden Bar</h1>
          </div>
          
          <p class="welcome-message">
            <strong>Welcome, ${displayName}!</strong>
          </p>
          
          <p>
            Thank you for joining Wawa Garden Bar! We're excited to have you as part of our community.
            Your account has been successfully created and you can now enjoy our services.
          </p>
          
          <div class="features">
            <h3>What you can do:</h3>
            <div class="feature">
              <span class="feature-icon">🍽️</span>
              <strong>Order Online:</strong> Browse our menu and place orders for dine-in, pickup, or delivery
            </div>
            <div class="feature">
              <span class="feature-icon">🎁</span>
              <strong>Earn Rewards:</strong> Get random rewards based on your spending
            </div>
            <div class="feature">
              <span class="feature-icon">📍</span>
              <strong>Track Orders:</strong> Real-time updates on your order status
            </div>
            <div class="feature">
              <span class="feature-icon">💳</span>
              <strong>Multiple Payments:</strong> Pay with card, transfer, USSD, or phone number
            </div>
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}" class="cta-button">
              Start Ordering
            </a>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Wawa Garden Bar. All rights reserved.</p>
            <p>Need help? Contact us at ${process.env.EMAIL_FROM}</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    Welcome to Wawa Garden Bar!
    
    Hi ${displayName},
    
    Thank you for joining Wawa Garden Bar! Your account has been successfully created.
    
    What you can do:
    - Order online for dine-in, pickup, or delivery
    - Earn random rewards based on your spending
    - Track your orders in real-time
    - Pay with multiple payment methods
    
    Start ordering at: ${process.env.NEXT_PUBLIC_APP_URL}
    
    © ${new Date().getFullYear()} Wawa Garden Bar
  `;

  await sendEmail({
    to: email,
    subject: 'Welcome to Wawa Garden Bar! 🌿',
    html,
    text,
  });
}

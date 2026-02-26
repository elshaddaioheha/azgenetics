import { Resend } from 'resend';

const getResend = () => new Resend(process.env.RESEND_API_KEY);

interface SendOTPEmailParams {
  to: string;
  code: string;
  userName?: string;
}

export async function sendOTPEmail({ to, code, userName }: SendOTPEmailParams) {
  try {
    const { data, error } = await getResend().emails.send({
      from: 'AZ-Genes <noreply@azgenes.com>', // Update with your verified domain
      to: [to],
      subject: 'Verify your email address',
      html: getOTPEmailTemplate(code, userName),
    });

    if (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send verification email');
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Email service error:', error);
    throw error;
  }
}

function getOTPEmailTemplate(code: string, userName?: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: white;
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .header p {
      margin: 8px 0 0 0;
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 20px;
    }
    .message {
      color: #4b5563;
      font-size: 15px;
      margin-bottom: 30px;
      line-height: 1.7;
    }
    .otp-box {
      background: #f9fafb;
      border: 2px solid #10b981;
      border-radius: 8px;
      padding: 24px;
      text-align: center;
      margin: 30px 0;
    }
    .otp-label {
      font-size: 13px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 600;
      margin-bottom: 12px;
    }
    .otp-code {
      font-size: 36px;
      font-weight: 700;
      color: #10b981;
      letter-spacing: 8px;
      font-family: 'Courier New', monospace;
    }
    .expiry {
      margin-top: 12px;
      font-size: 13px;
      color: #9ca3af;
    }
    .warning {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 16px;
      margin: 30px 0;
      border-radius: 4px;
    }
    .warning p {
      margin: 0;
      font-size: 14px;
      color: #92400e;
    }
    .footer {
      background: #f9fafb;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      margin: 5px 0;
      font-size: 13px;
      color: #6b7280;
    }
    .footer a {
      color: #10b981;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🧬 AZ-Genes</h1>
      <p>Secure Genomic Data Platform</p>
    </div>
    
    <div class="content">
      <div class="greeting">
        Hello${userName ? ` ${userName}` : ''}!
      </div>
      
      <div class="message">
        Thank you for signing up for AZ-Genes. To complete your registration and verify your email address, please use the verification code below:
      </div>
      
      <div class="otp-box">
        <div class="otp-label">Verification Code</div>
        <div class="otp-code">${code}</div>
        <div class="expiry">⏱️ Expires in 10 minutes</div>
      </div>
      
      <div class="message">
        Enter this code in the verification screen to activate your account and start securing your genomic data on the blockchain.
      </div>
      
      <div class="warning">
        <p>
          <strong>🔒 Security Notice:</strong> Never share this code with anyone. 
          AZ-Genes staff will never ask for your verification code.
        </p>
      </div>
    </div>
    
    <div class="footer">
      <p>This email was sent by AZ-Genes Protocol</p>
      <p>If you didn't request this code, please ignore this email.</p>
      <p style="margin-top: 20px;">
        <a href="https://azgenes.com">Visit our website</a> • 
        <a href="https://azgenes.com/support">Get support</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

// Plain text version for email clients that don't support HTML
export function getOTPEmailPlainText(code: string, userName?: string): string {
  return `
Hello${userName ? ` ${userName}` : ''}!

Thank you for signing up for AZ-Genes.

Your verification code is: ${code}

This code will expire in 10 minutes.

Enter this code in the verification screen to activate your account.

SECURITY NOTICE: Never share this code with anyone. AZ-Genes staff will never ask for your verification code.

If you didn't request this code, please ignore this email.

---
AZ-Genes Protocol
https://azgenes.com
  `;
}

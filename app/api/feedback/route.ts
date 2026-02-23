import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email, message } = await request.json();

    if (!email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Send notification email to admin
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: #0a0a0a;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .header h1 {
              margin: 0;
              font-weight: 300;
            }
            .brand {
              color: #ef4444;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border: 1px solid #ddd;
              border-radius: 0 0 8px 8px;
            }
            .info-box {
              background: white;
              padding: 15px;
              border-radius: 6px;
              margin-bottom: 20px;
              border-left: 4px solid #ef4444;
            }
            .message-box {
              background: white;
              padding: 20px;
              border-radius: 6px;
              margin-top: 20px;
              white-space: pre-wrap;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Mechanic <span class="brand">AI</span></h1>
            <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.8;">New Feedback / Beta Access Request</p>
          </div>
          
          <div class="content">
            <div class="info-box">
              <h3 style="margin-top: 0;">User Information</h3>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleString('en-ZA')}</p>
            </div>
            
            <div class="message-box">
              <h3 style="margin-top: 0;">Message</h3>
              ${message}
            </div>
            
            <div class="footer">
              <p>This is an automated notification from Mechanic AI</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send confirmation email to user
    const userEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: #0a0a0a;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .header h1 {
              margin: 0;
              font-weight: 300;
            }
            .brand {
              color: #ef4444;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border: 1px solid #ddd;
              border-radius: 0 0 8px 8px;
            }
            .message-box {
              background: white;
              padding: 20px;
              border-radius: 6px;
              border-left: 4px solid #ef4444;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Mechanic <span class="brand">AI</span></h1>
            <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.8;">Thank You for Your Feedback!</p>
          </div>
          
          <div class="content">
            <div class="message-box">
              <h3 style="margin-top: 0;">We've Received Your Message</h3>
              <p>Thank you for reaching out! We've received your feedback and will get back to you shortly.</p>
              <p>If you requested beta access, we'll activate your account and send you login details as soon as possible.</p>
              <p style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
                <strong>Your message:</strong><br>
                <span style="color: #666;">${message}</span>
              </p>
            </div>
            
            <div class="footer">
              <p>Thank you for being part of the Mechanic AI beta!</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email to admin only
    await resend.emails.send({
      from: 'Mechanic AI <onboarding@resend.dev>',
      to: ['ico@astutetech.co.za'], // Your email
      subject: `New Feedback / Beta Access Request from ${email}`,
      html: adminEmailHtml,
      replyTo: email, // Allow you to reply directly to the customer
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Feedback email error:', error);
    return NextResponse.json(
      { error: 'Failed to send feedback' },
      { status: 500 }
    );
  }
}

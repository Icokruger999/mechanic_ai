'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface User {
  email: string;
  session_id: string;
  credits: number;
  last_active: string;
  total_chats: number;
  total_messages: number;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCredits: 0,
    totalChats: 0,
    totalMessages: 0
  });
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailTemplate, setEmailTemplate] = useState('midas-full');
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{success: boolean, message: string} | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      setUsers(data.users);
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const emailTemplates = {
    'midas-full': {
      name: 'Beta Invitation - Full Details',
      subject: 'Beta Testing Invitation: Mechanic AI - Your Digital Diagnostic Assistant',
      getHtml: (name: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5;">
  <div style="max-width: 700px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden;">
    
    <div style="background-color: #1a1a1a; color: white; padding: 40px 30px; text-align: center;">
      <div style="font-size: 36px; font-weight: bold; margin-bottom: 10px; color: white;">
        Mechanic <span style="color: #ef4444;">AI</span>
      </div>
      <p style="font-size: 16px; opacity: 0.9; margin: 0; color: white;">Your Digital Diagnostic Assistant</p>
      <div style="background: #ef4444; color: white; display: inline-block; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: 600; margin-top: 15px;">BETA TESTING INVITATION</div>
    </div>
    
    <div style="padding: 40px 30px;">
      <p style="font-size: 16px; margin-bottom: 20px;">Dear ${name || 'Workshop Team'},</p>
      
      <p style="font-size: 16px; margin-bottom: 20px;">We're excited to invite you to beta test <strong>Mechanic AI</strong> - an AI-powered diagnostic tool designed specifically for automotive professionals like you.</p>
      
      <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #ffc107;">
        <div style="font-weight: 600; font-size: 18px; margin-bottom: 10px; color: #856404;">🎁 Beta Tester Benefits</div>
        <p style="margin: 0; color: #856404; font-size: 16px;">As a beta tester, you'll receive <strong>FREE credits</strong> to thoroughly test the platform. We value your feedback and want you to experience the full capabilities of Mechanic AI without any cost during the beta period.</p>
      </div>
      
      <div style="font-size: 22px; font-weight: 600; color: #0a0a0a; margin: 30px 0 15px 0;">What is Mechanic AI?</div>
      
      <p style="font-size: 16px; margin-bottom: 15px;">Mechanic AI provides instant, detailed vehicle diagnostics powered by AWS Bedrock AI. Simply describe the symptoms, and get:</p>
      
      <ul style="font-size: 16px; margin-bottom: 25px; line-height: 1.8;">
        <li><strong>Comprehensive diagnostic analysis</strong> of potential issues</li>
        <li><strong>Component-by-component breakdown</strong> with severity ratings</li>
        <li><strong>Repair recommendations</strong> with estimated costs</li>
        <li><strong>Professional reports</strong> you can email or print for customers</li>
      </ul>
      
      <div style="font-size: 22px; font-weight: 600; color: #0a0a0a; margin: 30px 0 15px 0;">Two Modes for Different Needs:</div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #ef4444;">
        <div style="font-weight: 600; font-size: 18px; margin-bottom: 10px;">Casual Mode (1 credit per query)</div>
        <ul style="margin: 0; padding-left: 20px;">
          <li>Quick diagnostics for common issues</li>
          <li>Conversational, easy-to-understand responses</li>
          <li>Perfect for initial assessments</li>
        </ul>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #ef4444;">
        <div style="font-weight: 600; font-size: 18px; margin-bottom: 10px;">Mechanic Mode (2 credits per query)</div>
        <ul style="margin: 0; padding-left: 20px;">
          <li>Detailed technical analysis</li>
          <li>Structured diagnostic reports</li>
          <li>Component severity ratings</li>
          <li>Repair cost estimates</li>
          <li>Professional format for customer communication</li>
        </ul>
      </div>
      
      <div style="font-size: 22px; font-weight: 600; color: #0a0a0a; margin: 30px 0 15px 0;">Our Pricing Plans (Post-Beta):</div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
          <div>
            <div style="font-weight: 600; color: #ef4444; font-size: 24px;">$1.99</div>
            <div style="font-size: 14px; color: #666; margin-bottom: 8px;">Starter Pack - 25 diagnoses</div>
            <div style="font-size: 13px; color: #888;">$0.08 per diagnosis</div>
          </div>
          <div>
            <div style="font-weight: 600; color: #ef4444; font-size: 24px;">$4.99</div>
            <div style="font-size: 14px; color: #666; margin-bottom: 8px;">Professional - 100 diagnoses</div>
            <div style="font-size: 13px; color: #888;">$0.05 per diagnosis</div>
          </div>
          <div>
            <div style="font-weight: 600; color: #ef4444; font-size: 24px;">$16.99</div>
            <div style="font-size: 14px; color: #666; margin-bottom: 8px;">Business - 500 diagnoses</div>
            <div style="font-size: 13px; color: #888;">$0.034 per diagnosis</div>
          </div>
          <div>
            <div style="font-weight: 600; color: #ef4444; font-size: 24px;">$19.99</div>
            <div style="font-size: 14px; color: #666; margin-bottom: 8px;">Monthly - Unlimited</div>
            <div style="font-size: 13px; color: #888;">$0.02 per diagnosis</div>
          </div>
        </div>
      </div>
      
      <div style="font-size: 22px; font-weight: 600; color: #0a0a0a; margin: 30px 0 15px 0;">Why Join Our Beta Program?</div>
      
      <ul style="font-size: 16px; margin-bottom: 25px; line-height: 1.8;">
        <li>✓ <strong>Free Credits</strong> - Test the platform extensively at no cost</li>
        <li>✓ <strong>Shape the Product</strong> - Your feedback directly influences development</li>
        <li>✓ <strong>Early Access</strong> - Be first to use cutting-edge AI diagnostics</li>
        <li>✓ <strong>Priority Support</strong> - Direct line to our development team</li>
        <li>✓ <strong>Special Pricing</strong> - Beta testers get exclusive launch discounts</li>
      </ul>
      
      <div style="font-size: 22px; font-weight: 600; color: #0a0a0a; margin: 30px 0 15px 0;">What We Need From You:</div>
      
      <ul style="font-size: 16px; margin-bottom: 25px; line-height: 1.8;">
        <li>Test the platform with real-world vehicle issues</li>
        <li>Provide honest feedback on accuracy and usefulness</li>
        <li>Report any bugs or issues you encounter</li>
        <li>Suggest features that would benefit your workshop</li>
      </ul>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://mechanic.codingeverest.com" style="display: inline-block; background: #ef4444; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: 600;">Join Beta Program</a>
      </div>
      
      <div style="font-size: 22px; font-weight: 600; color: #0a0a0a; margin: 30px 0 15px 0;">Questions?</div>
      
      <p style="font-size: 16px; margin-bottom: 20px;">We'd love to discuss the beta program and how Mechanic AI can benefit your workshop. Send us your feedback via the Feedback page in Mechanic AI.</p>
      
      <p style="font-size: 16px; margin-top: 30px;">Best regards,</p>
      <p style="font-size: 16px; margin: 5px 0;"><strong>The Mechanic AI Team</strong></p>
      <p style="font-size: 16px; margin: 5px 0;">Coding Everest Ltd</p>
      <p style="font-size: 16px; margin: 5px 0;"><a href="https://codingeverest.com" style="color: #ef4444;">https://codingeverest.com</a></p>
      <p style="font-size: 16px; margin: 5px 0;"><a href="https://mechanic.codingeverest.com" style="color: #ef4444;">https://mechanic.codingeverest.com</a></p>
      
      <div style="margin-top: 30px; padding: 15px; background: #e8f5e9; border-radius: 8px; font-size: 14px; color: #2e7d32; border-left: 4px solid #4caf50;">
        <strong>P.S.</strong> - Beta spots are limited. Sign up today to secure your free credits and help shape the future of AI-powered vehicle diagnostics!
      </div>
    </div>
    
    <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 13px; border-top: 1px solid #e5e5e5;">
      <p style="margin: 5px 0;">Mechanic AI | AI-Powered Vehicle Diagnostics | Beta Program</p>
    </div>
    
  </div>
</body>
</html>
      `
    },
    'midas-short': {
      name: 'Beta Invitation - Short Version',
      subject: 'Beta Invitation: Test Mechanic AI - Get Free Credits',
      getHtml: (name: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5;">
  <div style="max-width: 700px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden;">
    
    <div style="background-color: #1a1a1a; color: white; padding: 40px 30px; text-align: center;">
      <div style="font-size: 36px; font-weight: bold; margin-bottom: 10px; color: white;">
        Mechanic <span style="color: #ef4444;">AI</span>
      </div>
      <p style="font-size: 16px; opacity: 0.9; margin: 0; color: white;">AI Diagnostics for Your Workshop</p>
      <div style="background: #ef4444; color: white; display: inline-block; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: 600; margin-top: 15px;">BETA TESTING</div>
    </div>
    
    <div style="padding: 40px 30px;">
      <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name || 'there'},</p>
      
      <p style="font-size: 16px; margin-bottom: 20px;">We're inviting you to beta test <strong>Mechanic AI</strong> - instant AI-powered diagnostics for any vehicle issue.</p>
      
      <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #ffc107;">
        <div style="font-weight: 600; font-size: 18px; margin-bottom: 10px; color: #856404;">🎁 Beta Tester Offer</div>
        <p style="margin: 0; color: #856404; font-size: 16px;"><strong>FREE credits</strong> to test the platform + your feedback helps shape the product!</p>
      </div>
      
      <div style="font-size: 20px; font-weight: 600; color: #0a0a0a; margin: 25px 0 15px 0;">What You Get:</div>
      
      <ul style="font-size: 16px; margin-bottom: 25px; line-height: 1.8;">
        <li>Instant AI diagnostic analysis</li>
        <li>Component severity ratings</li>
        <li>Repair recommendations</li>
        <li>Cost estimates</li>
        <li>Professional customer reports</li>
      </ul>
      
      <div style="font-size: 20px; font-weight: 600; color: #0a0a0a; margin: 25px 0 15px 0;">Future Pricing (Post-Beta):</div>
      
      <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; font-size: 14px;">
        <div style="margin-bottom: 8px;"><strong>$1.99</strong> - 25 diagnoses ($0.08 each)</div>
        <div style="margin-bottom: 8px;"><strong>$4.99</strong> - 100 diagnoses ($0.05 each)</div>
        <div style="margin-bottom: 8px;"><strong>$16.99</strong> - 500 diagnoses ($0.034 each)</div>
        <div><strong>$19.99/month</strong> - Unlimited ($0.02 each)</div>
      </div>
      
      <div style="font-size: 20px; font-weight: 600; color: #0a0a0a; margin: 25px 0 15px 0;">Why Join Beta?</div>
      
      <ul style="font-size: 16px; margin-bottom: 25px; line-height: 1.8;">
        <li>✓ <strong>Free testing credits</strong></li>
        <li>✓ <strong>Shape the product</strong> with your feedback</li>
        <li>✓ <strong>Early access</strong> to AI diagnostics</li>
        <li>✓ <strong>Special launch pricing</strong> for beta testers</li>
      </ul>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://mechanic.codingeverest.com" style="display: inline-block; background: #ef4444; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: 600;">Join Beta Program</a>
      </div>
      
      <p style="font-size: 16px; margin-top: 30px;">Questions? Send us your feedback via the Feedback page in Mechanic AI.</p>
      
      <p style="font-size: 16px; margin-top: 30px;">Best regards,</p>
      <p style="font-size: 16px; margin: 5px 0;"><strong>The Mechanic AI Team</strong></p>
      <p style="font-size: 16px; margin: 5px 0;">Coding Everest Ltd</p>
      <p style="font-size: 16px; margin: 5px 0;"><a href="https://codingeverest.com" style="color: #ef4444;">https://codingeverest.com</a></p>
      <p style="font-size: 16px; margin: 5px 0;"><a href="https://mechanic.codingeverest.com" style="color: #ef4444;">https://mechanic.codingeverest.com</a></p>
      
      <div style="margin-top: 30px; padding: 15px; background: #e8f5e9; border-radius: 8px; font-size: 14px; color: #2e7d32; border-left: 4px solid #4caf50;">
        <strong>Limited beta spots available</strong> - Sign up today to secure your free credits!
      </div>
    </div>
    
    <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 13px; border-top: 1px solid #e5e5e5;">
      <p style="margin: 5px 0;">Mechanic AI | AI-Powered Vehicle Diagnostics | Beta Program</p>
    </div>
    
  </div>
</body>
</html>
      `
    }
  };

  const handleSendEmail = async () => {
    if (!emailRecipient || !emailSubject) {
      setSendResult({ success: false, message: 'Please fill in recipient email and subject' });
      return;
    }

    setIsSending(true);
    setSendResult(null);

    try {
      const template = emailTemplates[emailTemplate as keyof typeof emailTemplates];
      const htmlContent = template.getHtml(recipientName);
      
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailRecipient,
          subject: emailSubject,
          html: htmlContent
        })
      });

      const data = await response.json();

      if (data.success) {
        setSendResult({ success: true, message: 'Email sent successfully!' });
        setTimeout(() => {
          setShowEmailModal(false);
          setEmailRecipient('');
          setRecipientName('');
          setEmailSubject('');
          setSendResult(null);
        }, 2000);
      } else {
        setSendResult({ success: false, message: 'Failed to send email' });
      }
    } catch (error) {
      setSendResult({ success: false, message: 'Error sending email' });
    } finally {
      setIsSending(false);
    }
  };

  const handleTemplateChange = (template: string) => {
    setEmailTemplate(template);
    const selectedTemplate = emailTemplates[template as keyof typeof emailTemplates];
    setEmailSubject(selectedTemplate.subject);
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', color: 'white', background: '#0a0a0a', minHeight: '100vh' }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', color: 'white', background: '#0a0a0a', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '300' }}>Admin Dashboard</h1>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button
              onClick={() => setShowEmailModal(true)}
              style={{
                background: '#e63946',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              Send Email
            </button>
            <Link href="/chat" style={{ color: '#e63946', textDecoration: 'none' }}>
              Back to Chat
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: '#1a1a1a', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '0.875rem', color: '#a0a0a0', marginBottom: '0.5rem' }}>Total Users</div>
            <div style={{ fontSize: '2rem', fontWeight: '600' }}>{stats.totalUsers}</div>
          </div>
          <div style={{ background: '#1a1a1a', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '0.875rem', color: '#a0a0a0', marginBottom: '0.5rem' }}>Total Credits</div>
            <div style={{ fontSize: '2rem', fontWeight: '600' }}>{stats.totalCredits}</div>
          </div>
          <div style={{ background: '#1a1a1a', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '0.875rem', color: '#a0a0a0', marginBottom: '0.5rem' }}>Total Chats</div>
            <div style={{ fontSize: '2rem', fontWeight: '600' }}>{stats.totalChats}</div>
          </div>
          <div style={{ background: '#1a1a1a', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '0.875rem', color: '#a0a0a0', marginBottom: '0.5rem' }}>Total Messages</div>
            <div style={{ fontSize: '2rem', fontWeight: '600' }}>{stats.totalMessages}</div>
          </div>
        </div>

        {/* Users Table */}
        <div style={{ background: '#1a1a1a', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '500' }}>Users</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#222', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '500', color: '#a0a0a0' }}>Email</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '500', color: '#a0a0a0' }}>Session ID</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '500', color: '#a0a0a0' }}>Credits</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '500', color: '#a0a0a0' }}>Chats</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '500', color: '#a0a0a0' }}>Messages</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '500', color: '#a0a0a0' }}>Last Active</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user.session_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem' }}>{user.email || 'N/A'}</td>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontFamily: 'monospace', color: '#a0a0a0' }}>
                      {user.session_id.substring(0, 8)}...
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: user.credits < 10 ? '#e63946' : '#10b981' }}>
                      {user.credits}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.875rem' }}>{user.total_chats}</td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.875rem' }}>{user.total_messages}</td>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#a0a0a0' }}>
                      {user.last_active ? new Date(user.last_active).toLocaleString() : 'Never'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Email Modal */}
        {showEmailModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: '#1a1a1a',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '600px',
              width: '90%',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '500', margin: 0 }}>Send Email</h2>
                <button
                  onClick={() => {
                    setShowEmailModal(false);
                    setSendResult(null);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#a0a0a0',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    padding: '0',
                    lineHeight: '1'
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#a0a0a0' }}>
                  Template
                </label>
                <select
                  value={emailTemplate}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#0a0a0a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="midas-full">Beta Invitation - Full Details</option>
                  <option value="midas-short">Beta Invitation - Short Version</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#a0a0a0' }}>
                  Recipient Name (e.g., "Midas Team", "John", "ABC Workshop")
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Optional - will use generic greeting if empty"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#0a0a0a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#a0a0a0' }}>
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={emailRecipient}
                  onChange={(e) => setEmailRecipient(e.target.value)}
                  placeholder="recipient@example.com"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#0a0a0a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#a0a0a0' }}>
                  Subject
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Email subject"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#0a0a0a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              {sendResult && (
                <div style={{
                  padding: '0.75rem',
                  borderRadius: '6px',
                  marginBottom: '1rem',
                  background: sendResult.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  border: `1px solid ${sendResult.success ? '#10b981' : '#ef4444'}`,
                  color: sendResult.success ? '#10b981' : '#ef4444',
                  fontSize: '0.875rem'
                }}>
                  {sendResult.message}
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowEmailModal(false);
                    setSendResult(null);
                  }}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#a0a0a0',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendEmail}
                  disabled={isSending}
                  style={{
                    background: isSending ? '#666' : '#e63946',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '6px',
                    cursor: isSending ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  {isSending ? 'Sending...' : 'Send Email'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

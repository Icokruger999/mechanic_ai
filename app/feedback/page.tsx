"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FeedbackPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.toLowerCase().trim(), 
          message 
        })
      });

      if (response.ok) {
        setShowSuccess(true);
        setEmail('');
        setMessage('');
        setTimeout(() => setShowSuccess(false), 5000);
      } else {
        alert('Failed to send feedback. Please try again.');
      }
    } catch (error) {
      alert('Failed to send feedback. Please try again.');
    }

    setIsSending(false);
  };

  return (
    <div className="feedback-page-container">
      <div className="feedback-header">
        <button onClick={() => router.push('/chat')} className="back-to-chat-btn">
          ← Back to Chat
        </button>
      </div>

      <div className="feedback-content">
        <h1 className="feedback-title">Feedback</h1>
        
        <div className="beta-activation-notice">
          <h2 className="activation-title">🚀 Request Beta Access</h2>
          <p className="activation-text">
            Mechanic AI is currently in beta. To activate your account and start using the app, 
            please send us your email and a brief message. We'll activate your account immediately 
            and get back to you with your login details!
          </p>
        </div>

        {showSuccess && (
          <div className="success-message">
            ✓ Thank you! We've received your request and will activate your account shortly.
          </div>
        )}

        <form onSubmit={handleSubmit} className="feedback-form">
          <div className="form-group-feedback">
            <label htmlFor="email" className="form-label-feedback">Your Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="form-input-feedback"
              disabled={isSending}
              required
            />
          </div>

          <div className="form-group-feedback">
            <label htmlFor="message" className="form-label-feedback">Message</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us about yourself, your vehicle, or request account activation..."
              className="form-textarea-feedback"
              rows={6}
              disabled={isSending}
              required
            />
          </div>

          <button 
            type="submit" 
            className="submit-feedback-btn"
            disabled={isSending}
          >
            {isSending ? 'Sending...' : 'Send Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
}

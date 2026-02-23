"use client";

import { useRouter } from "next/navigation";

export default function PricingPage() {
  const router = useRouter();

  return (
    <div className="pricing-page-container">
      {/* Back Button */}
      <div className="pricing-header">
        <button onClick={() => router.push('/chat')} className="back-to-chat-btn">
          ← Back to Chat
        </button>
      </div>

      {/* Title */}
      <div className="pricing-title-section">
        <h1 className="pricing-page-title">Mechanic AI</h1>
        <p className="pricing-page-subtitle">Choose Your Plan</p>
        
        {/* Beta Notice */}
        <div className="beta-notice">
          <div className="beta-badge">BETA</div>
          <p className="beta-text">
            Our app is currently in beta testing. To activate your account and start using Mechanic AI, 
            please visit the <button onClick={() => router.push('/feedback')} className="feedback-link">Feedback page</button> and 
            send us your details. We'll activate your account immediately!
          </p>
        </div>
      </div>

      {/* Monthly Subscriptions */}
      <section className="pricing-section-container">
        <h2 className="section-heading">Monthly Subscriptions</h2>
        
        <div className="pricing-cards-grid">
          {/* Free Trial */}
          <div className="pricing-card-item">
            <div className="card-title">Free Trial</div>
            <div className="card-price-large">50</div>
            <div className="card-period">credits</div>
            <div className="card-credits">Perfect for trying our service</div>
            
            <ul className="features-list">
              <li>✓ Full AI diagnostics</li>
              <li>✓ Visual vehicle highlights</li>
              <li>✓ Email support</li>
              <li>✓ No credit card required</li>
            </ul>
            
            <button className="plan-button disabled">Current Plan</button>
          </div>

          {/* Starter Pack - Most Popular */}
          <div className="pricing-card-item popular">
            <div className="popular-badge">Most Popular</div>
            <div className="card-title">Starter Pack</div>
            <div className="card-price-large">$1.99</div>
            <div className="card-period">one-time</div>
            <div className="card-credits">25 additional diagnoses</div>
            
            <ul className="features-list">
              <li>✓ Everything in Free Trial</li>
              <li>✓ Priority support</li>
              <li>✓ Detailed repair guides</li>
              <li>✓ $0.08 per diagnosis</li>
            </ul>
            
            <button className="plan-button primary">Choose Plan</button>
          </div>

          {/* Professional */}
          <div className="pricing-card-item">
            <div className="card-title">Professional</div>
            <div className="card-price-large">$4.99</div>
            <div className="card-period">one-time</div>
            <div className="card-credits">100 diagnoses</div>
            
            <ul className="features-list">
              <li>✓ Everything in Starter</li>
              <li>✓ Advanced diagnostics</li>
              <li>✓ Maintenance schedules</li>
              <li>✓ $0.05 per diagnosis</li>
            </ul>
            
            <button className="plan-button">Choose Plan</button>
          </div>

          {/* Premium */}
          <div className="pricing-card-item">
            <div className="card-title">Premium</div>
            <div className="card-price-large">$9.99</div>
            <div className="card-period">one-time</div>
            <div className="card-credits">250 diagnoses</div>
            
            <ul className="features-list">
              <li>✓ Everything in Professional</li>
              <li>✓ Priority queue</li>
              <li>✓ Image analysis</li>
              <li>✓ $0.04 per diagnosis</li>
            </ul>
            
            <button className="plan-button">Choose Plan</button>
          </div>
        </div>
      </section>

      {/* Business & Monthly */}
      <section className="pricing-section-container">
        <h2 className="section-heading">Business & Subscription Plans</h2>
        
        <div className="credit-packs-grid">
          {/* Business */}
          <div className="credit-pack-item">
            <div className="pack-title">Business</div>
            <div className="card-price-large">$16.99</div>
            <div className="pack-label">one-time</div>
            <div className="pack-credits-text">500 diagnoses</div>
            
            <ul className="features-list-compact">
              <li>✓ Everything in Premium</li>
              <li>✓ Bulk diagnostics</li>
              <li>✓ API access</li>
              <li>✓ $0.034 per diagnosis</li>
            </ul>
            
            <button className="pack-button">Choose Plan</button>
          </div>

          {/* Monthly - Best Value */}
          <div className="credit-pack-item highlight">
            <div className="popular-badge">Best Value</div>
            <div className="pack-title">Monthly</div>
            <div className="card-price-large">$19.99</div>
            <div className="pack-label">per month</div>
            <div className="pack-credits-text">Unlimited every month</div>
            
            <ul className="features-list-compact">
              <li>✓ Everything in Business</li>
              <li>✓ Credits reset monthly</li>
              <li>✓ Priority support</li>
              <li>✓ $0.02 per diagnosis</li>
            </ul>
            
            <button className="pack-button primary">Subscribe Now</button>
          </div>
        </div>
      </section>
    </div>
  );
}

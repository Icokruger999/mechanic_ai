export default function Home() {
  return (
    <div className="landing-page">
      {/* Hero Section with Background Image */}
      <section className="hero-section">
        <div className="hero-background-engine"></div>
        <div className="hero-overlay"></div>
        
        <div className="hero-content">
          <div className="hero-container">
            <div className="hero-text-center">
              <h1 className="hero-title-large">
                Mechanic <span style={{ color: '#ef4444' }}>AI</span>
              </h1>
              <p className="hero-description">
                Advanced AI-powered vehicle diagnostics. Get instant, accurate analysis of your car problems with professional-grade precision.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-start' }}>
                <a href="/login">
                  <button className="login-button-large">LOGIN</button>
                </a>
                <a href="/login">
                  <button className="create-account-button-large">CREATE ACCOUNT</button>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Subtitle positioned below the car */}
        <div style={{ 
          position: 'absolute', 
          bottom: '5rem', 
          left: '0', 
          right: '0',
          textAlign: 'center',
          zIndex: 10
        }}>
          <p style={{
            fontSize: '1rem',
            color: 'rgba(255, 255, 255, 0.6)',
            fontWeight: 300,
            letterSpacing: '0.15em',
            fontFamily: 'Inter, sans-serif'
          }}>Your Mechanic AI Assistant</p>
        </div>
      </section>

      {/* Services & Features Section */}
      <section style={{
        background: '#0a0a0a',
        padding: '5rem 2rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '300',
            textAlign: 'center',
            marginBottom: '3rem',
            color: 'white'
          }}>
            How It Works
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            marginBottom: '4rem'
          }}>
            {/* Casual Mode */}
            <div style={{
              background: '#1a1a1a',
              border: '1px solid #2a2a2a',
              borderRadius: '12px',
              padding: '2rem'
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '500',
                marginBottom: '1rem',
                color: 'white'
              }}>Casual Mode</h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.7)',
                lineHeight: '1.6'
              }}>
                Get quick, conversational answers to your car questions. Perfect for general advice and troubleshooting tips in everyday language.
              </p>
            </div>

            {/* Mechanic Mode */}
            <div style={{
              background: '#1a1a1a',
              border: '1px solid #2a2a2a',
              borderRadius: '12px',
              padding: '2rem'
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '500',
                marginBottom: '1rem',
                color: 'white'
              }}>Mechanic Mode</h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.7)',
                lineHeight: '1.6'
              }}>
                Receive professional diagnostic reports with detailed symptom analysis, root cause identification, repair recommendations, and cost estimates. Reports can be printed or emailed directly to your mechanic.
              </p>
            </div>

            {/* AI Technology */}
            <div style={{
              background: '#1a1a1a',
              border: '1px solid #2a2a2a',
              borderRadius: '12px',
              padding: '2rem'
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '500',
                marginBottom: '1rem',
                color: 'white'
              }}>Powered by AWS Bedrock</h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.7)',
                lineHeight: '1.6'
              }}>
                Advanced AI models trained on extensive automotive knowledge, providing accurate diagnostics and repair guidance based on industry best practices.
              </p>
            </div>
          </div>

          {/* What We Cover */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '12px',
            padding: '2.5rem',
            textAlign: 'center'
          }}>
            <h3 style={{
              fontSize: '1.8rem',
              fontWeight: '500',
              marginBottom: '1.5rem',
              color: 'white'
            }}>What We Cover</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
              marginTop: '2rem',
              textAlign: 'left'
            }}>
              <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Engine Diagnostics</div>
              <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Transmission Issues</div>
              <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Brake Systems</div>
              <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Electrical Problems</div>
              <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Cooling Systems</div>
              <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Exhaust & Emissions</div>
              <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Suspension & Steering</div>
              <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Fuel System Issues</div>
              <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Air Conditioning</div>
              <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Battery & Charging</div>
              <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Clutch & Drivetrain</div>
              <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Warning Lights</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mystery Disclaimer */}
      <section style={{
        background: '#000',
        padding: '2rem',
        borderTop: '1px solid rgba(239, 68, 68, 0.2)',
        borderBottom: '1px solid rgba(239, 68, 68, 0.2)'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '0.85rem',
            color: 'rgba(255, 255, 255, 0.4)',
            fontStyle: 'italic',
            letterSpacing: '0.05em',
            lineHeight: '1.6'
          }}>
            <span style={{ color: '#ef4444' }}>⚠</span> Our AI has a mind of its own. You might be South African, yet the AI responds with an Australian accent. We never quite know what personality it'll choose. Part of the mystery, part of the charm.
          </p>
        </div>
      </section>
    </div>
  );
}

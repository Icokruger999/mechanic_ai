"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }
      
      // Check if user already has a session/credits
      const { data: existingCredit } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', data.user.id)
        .single();
      
      let sessionId;
      
      if (existingCredit) {
        // User has existing credits - use their existing session
        sessionId = existingCredit.session_id;
        console.log('Found existing session:', sessionId);
      } else {
        // New user - create session with 20 credits
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        await supabase.from('user_credits').insert([{
          session_id: sessionId,
          user_id: data.user.id,
          balance: 20
        }]);
        
        console.log('Created new session:', sessionId);
      }
      
      localStorage.setItem('mechanicai_session_id', sessionId);
      localStorage.setItem('mechanicai_user_id', data.user.id);
      
      router.push('/chat');
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please try again.');
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/chat`,
        }
      });
      
      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }
      
      // Send welcome email via Resend
      try {
        console.log('Sending welcome email to:', email);
        const emailResponse = await fetch('/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: email,
            subject: 'Welcome to Mechanic AI - Your Account is Ready!',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #1a1a1a; padding: 40px; text-align: center;">
                  <h1 style="color: white; margin: 0;">
                    Mechanic <span style="color: #ef4444;">AI</span>
                  </h1>
                  <p style="color: rgba(255,255,255,0.7); margin: 10px 0 0 0;">AI-Powered Vehicle Diagnostics</p>
                </div>
                
                <div style="padding: 40px; background: white;">
                  <h2 style="color: #0a0a0a; margin-top: 0;">Welcome to Mechanic AI!</h2>
                  
                  <p style="color: #333; line-height: 1.6;">
                    Thanks for creating your account. You're now ready to get instant, professional vehicle diagnostics powered by AI.
                  </p>
                  
                  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #ef4444;">
                    <h3 style="margin-top: 0; color: #0a0a0a;">Your Free Trial</h3>
                    <p style="margin: 0; color: #333;">
                      <strong>20 credits</strong> have been added to your account. Use them to get started with our AI mechanic!
                    </p>
                  </div>
                  
                  <h3 style="color: #0a0a0a;">What you can do:</h3>
                  <ul style="color: #333; line-height: 1.8;">
                    <li><strong>Casual Mode:</strong> Quick diagnostics (1 credit per message)</li>
                    <li><strong>Mechanic Mode:</strong> Detailed professional reports (2 credits per message)</li>
                    <li>Get cost estimates in your local currency</li>
                    <li>Email diagnostic reports</li>
                    <li>Generate customer quotes</li>
                  </ul>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${window.location.origin}/chat" style="display: inline-block; background: #ef4444; color: white; padding: 15px 40px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                      Start Diagnosing
                    </a>
                  </div>
                  
                  <p style="color: #666; font-size: 14px; margin-top: 30px;">
                    Need help? Just reply to this email and we'll get back to you.
                  </p>
                </div>
                
                <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 13px;">
                  <p style="margin: 0;">Mechanic AI | AI-Powered Vehicle Diagnostics</p>
                </div>
              </div>
            `
          })
        });
        
        const emailResult = await emailResponse.json();
        console.log('Welcome email result:', emailResult);
        
        if (!emailResponse.ok) {
          console.error('Failed to send welcome email:', emailResult);
        }
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't block registration if email fails
      }
      
      // Create session with 20 credits
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await supabase.from('user_credits').insert([{
        session_id: sessionId,
        user_id: data.user?.id,
        balance: 20
      }]);
      
      localStorage.setItem('mechanicai_session_id', sessionId);
      localStorage.setItem('mechanicai_user_id', data.user?.id || '');
      
      router.push('/chat');
    } catch (err) {
      setError('Network error. Please try again.');
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Password reset email sent! Check your inbox.');
        setTimeout(() => {
          setMode("login");
          setSuccess("");
        }, 3000);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1 className="login-title">
            Mechanic <span style={{ color: '#ef4444' }}>AI</span>
          </h1>
          <p className="login-subtitle">
            {mode === "login" && "Your AI-powered mechanic companion"}
            {mode === "register" && "Create your account"}
            {mode === "forgot" && "Reset your password"}
          </p>
        </div>

        {mode === "login" && (
          <form onSubmit={handleLogin} className="login-form">
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="••••••••"
                required
              />
            </div>

            <button 
              type="submit" 
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        )}

        {mode === "register" && (
          <form onSubmit={handleRegister} className="login-form">
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="••••••••"
                required
                minLength={8}
              />
              <small style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>
                Minimum 8 characters
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input"
                placeholder="••••••••"
                required
                minLength={8}
              />
            </div>

            <button 
              type="submit" 
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}

        {mode === "forgot" && (
          <form onSubmit={handleForgotPassword} className="login-form">
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="your@email.com"
                required
              />
            </div>

            <button 
              type="submit" 
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Reset Email'}
            </button>
          </form>
        )}

        <div className="login-footer">
          <a href="/" className="footer-link">← Return to Home</a>
          <span className="footer-separator">•</span>
          {mode === "login" && (
            <>
              <button onClick={() => setMode("forgot")} className="footer-link">Forgot password?</button>
              <span className="footer-separator">•</span>
              <button onClick={() => setMode("register")} className="footer-link">Create account</button>
            </>
          )}
          {mode === "register" && (
            <button onClick={() => setMode("login")} className="footer-link">Already have an account?</button>
          )}
          {mode === "forgot" && (
            <button onClick={() => setMode("login")} className="footer-link">Back to login</button>
          )}
        </div>

        <div className="login-info">
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
            Free trial: 20 credits • No credit card required
          </p>
        </div>
      </div>
    </div>
  );
}

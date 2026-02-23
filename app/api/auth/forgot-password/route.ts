import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Find user
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();
    
    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists, a password reset email has been sent'
      });
    }
    
    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    
    // Update user with temp password
    await supabase
      .from('users')
      .update({
        password_hash: passwordHash,
        is_temp_password: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);
    
    // Send email with temp password
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email.toLowerCase(),
          subject: 'Mechanic AI - Password Reset',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #ef4444;">Mechanic AI - Password Reset</h2>
              <p>You requested a password reset for your Mechanic AI account.</p>
              <p>Your temporary password is:</p>
              <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; font-size: 18px; font-weight: bold; letter-spacing: 2px; text-align: center;">
                ${tempPassword}
              </div>
              <p style="margin-top: 20px;">Please log in with this temporary password. You will be prompted to create a new password.</p>
              <p style="color: #666; font-size: 12px; margin-top: 30px;">If you didn't request this reset, please ignore this email.</p>
            </div>
          `
        })
      });
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
    }
    
    return NextResponse.json({
      success: true,
      message: 'If an account exists, a password reset email has been sent'
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

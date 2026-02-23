import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert([{
        email: email.toLowerCase(),
        password_hash: passwordHash,
        is_temp_password: false
      }])
      .select()
      .single();
    
    if (error) {
      console.error('User creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create account' },
        { status: 500 }
      );
    }
    
    // Create session with 20 credits
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await supabase.from('sessions').insert([{
      session_id: sessionId,
      user_id: user.id,
      balance: 20
    }]);
    
    return NextResponse.json({
      success: true,
      sessionId,
      userId: user.id
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

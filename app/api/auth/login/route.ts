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
    
    // Find user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();
    
    if (error || !user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Get or create session
    const { data: existingSession } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    let sessionId;
    
    if (existingSession) {
      sessionId = existingSession.session_id;
    } else {
      // Create new session
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await supabase.from('sessions').insert([{
        session_id: sessionId,
        user_id: user.id,
        balance: 20
      }]);
    }
    
    return NextResponse.json({
      success: true,
      sessionId,
      userId: user.id,
      requiresPasswordChange: user.is_temp_password
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

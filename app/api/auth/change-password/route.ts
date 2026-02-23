import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { userId, newPassword } = await request.json();
    
    if (!userId || !newPassword) {
      return NextResponse.json(
        { error: 'User ID and new password are required' },
        { status: 400 }
      );
    }
    
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }
    
    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    
    // Update user password
    const { error } = await supabase
      .from('users')
      .update({
        password_hash: passwordHash,
        is_temp_password: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (error) {
      console.error('Password change error:', error);
      return NextResponse.json(
        { error: 'Failed to change password' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Password changed successfully'
    });
    
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

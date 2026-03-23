import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Admin client with service role for accessing auth users
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function GET() {
  try {
    // Get all users with their credits (use admin client to bypass RLS)
    const { data: usersData, error: usersError } = await supabaseAdmin
      .from('user_credits')
      .select('session_id, user_id, balance, created_at')
      .order('created_at', { ascending: false });

    if (usersError) throw usersError;

    // Get user emails from Supabase Auth using service role
    const userIds = usersData
      .map(u => u.user_id)
      .filter(id => id !== null);

    let emailMap: { [key: string]: string } = {};
    
    console.log('User IDs to fetch:', userIds);
    
    if (userIds.length > 0) {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
      
      console.log('Auth users fetched:', authData?.users?.length, authError);
      
      if (authData?.users) {
        authData.users.forEach(user => {
          if (userIds.includes(user.id)) {
            emailMap[user.id] = user.email || '';
          }
        });
      }
    }
    
    console.log('Email map:', emailMap);

    // Get chat counts per session
    const { data: chatCounts } = await supabaseAdmin
      .from('chats')
      .select('session_id')
      .then(result => {
        if (result.data) {
          const counts: { [key: string]: number } = {};
          result.data.forEach((chat: any) => {
            counts[chat.session_id] = (counts[chat.session_id] || 0) + 1;
          });
          return { data: counts };
        }
        return { data: {} };
      });

    // Get message counts per session from messages table
    const { data: allMessages } = await supabaseAdmin
      .from('messages')
      .select('chat_id, created_at');

    const messageCounts: { [key: string]: number } = {};
    const lastActive: { [key: string]: string } = {};

    if (allMessages) {
      // First, get chat to session mapping
      const { data: allChats } = await supabaseAdmin
        .from('chats')
        .select('id, session_id');
      
      const chatToSession: { [key: string]: string } = {};
      if (allChats) {
        allChats.forEach((chat: any) => {
          chatToSession[chat.id] = chat.session_id;
        });
      }

      // Count messages per session
      allMessages.forEach((message: any) => {
        const sessionId = chatToSession[message.chat_id];
        if (sessionId) {
          messageCounts[sessionId] = (messageCounts[sessionId] || 0) + 1;
          
          // Track last active
          if (message.created_at) {
            if (!lastActive[sessionId] || message.created_at > lastActive[sessionId]) {
              lastActive[sessionId] = message.created_at;
            }
          }
        }
      });
    }

    // Combine all data
    const users = usersData.map(user => ({
      email: user.user_id ? emailMap[user.user_id] : null,
      session_id: user.session_id,
      credits: user.balance,
      total_chats: chatCounts?.[user.session_id] || 0,
      total_messages: messageCounts[user.session_id] || 0,
      last_active: lastActive[user.session_id] || null
    }));

    // Calculate stats
    const stats = {
      totalUsers: users.length,
      totalCredits: users.reduce((sum, u) => sum + u.credits, 0),
      totalChats: Object.values(chatCounts || {}).reduce((sum: number, count) => sum + (count as number), 0),
      totalMessages: Object.values(messageCounts).reduce((sum, count) => sum + count, 0)
    };

    return NextResponse.json({ users, stats });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

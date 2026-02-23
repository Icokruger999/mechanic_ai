import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Fetch chats for this session
    const { data: chats, error: chatsError } = await supabase
      .from('chats')
      .select('*')
      .eq('session_id', sessionId)
      .order('updated_at', { ascending: false });

    if (chatsError) {
      console.error('Error fetching chats:', chatsError);
      return NextResponse.json({ chats: [], credits: 20 });
    }

    // Fetch messages for each chat
    const chatsWithMessages = await Promise.all(
      (chats || []).map(async (chat) => {
        const { data: messages } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', chat.id)
          .order('created_at', { ascending: true });

        return {
          ...chat,
          messages: messages || []
        };
      })
    );

    // Fetch current credit balance
    const { data: creditData } = await supabase
      .from('user_credits')
      .select('balance')
      .eq('session_id', sessionId)
      .single();

    const credits = creditData?.balance ?? 20;

    return NextResponse.json({ chats: chatsWithMessages, credits });
  } catch (error) {
    console.error('Chats API error:', error);
    return NextResponse.json({ chats: [], credits: 20 });
  }
}

// Update chat title
export async function PATCH(request: NextRequest) {
  try {
    const { chatId, title, sessionId } = await request.json();
    
    console.log('PATCH /api/chats - Received:', { chatId, title, sessionId });

    if (!chatId || !title || !sessionId) {
      console.log('PATCH /api/chats - Missing fields');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('chats')
      .update({ title })
      .eq('id', chatId)
      .eq('session_id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating chat:', error);
      return NextResponse.json({ error: 'Failed to update chat', details: error }, { status: 500 });
    }

    console.log('PATCH /api/chats - Success:', data);
    return NextResponse.json({ success: true, chat: data });
  } catch (error) {
    console.error('Update chat error:', error);
    return NextResponse.json({ error: 'Failed to update chat' }, { status: 500 });
  }
}

// Create new chat
export async function POST(request: NextRequest) {
  try {
    const { sessionId, title, country, currency, mode } = await request.json();

    if (!sessionId || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('chats')
      .insert([{
        session_id: sessionId,
        title,
        country: country || 'ZA',
        currency: currency || 'ZAR',
        mode: mode || 'casual'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating chat:', error);
      return NextResponse.json({ error: 'Failed to create chat' }, { status: 500 });
    }

    return NextResponse.json({ success: true, chat: data });
  } catch (error) {
    console.error('Create chat error:', error);
    return NextResponse.json({ error: 'Failed to create chat' }, { status: 500 });
  }
}

// Delete chat
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');
    const sessionId = searchParams.get('sessionId');

    if (!chatId || !sessionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { error } = await supabase
      .from('chats')
      .delete()
      .eq('id', chatId)
      .eq('session_id', sessionId);

    if (error) {
      console.error('Error deleting chat:', error);
      return NextResponse.json({ error: 'Failed to delete chat' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete chat error:', error);
    return NextResponse.json({ error: 'Failed to delete chat' }, { status: 500 });
  }
}

// Quick test to check if Supabase tables exist
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rvykzspgrxulqovvgsdx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2eWt6c3Bncnh1bHFvdnZnc2R4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTY5MjY3OCwiZXhwIjoyMDg3MjY4Njc4fQ.r959_OJbmSn8lgTKrJHDAvdbz8e22zvq6JSOLIYBn5I';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  // Test 1: Check if chats table exists
  const { data: chats, error: chatsError } = await supabase
    .from('chats')
    .select('*')
    .limit(1);
  
  if (chatsError) {
    console.error('❌ Chats table error:', chatsError.message);
    console.log('\n⚠️  You need to run SUPABASE_SCHEMA.sql in your Supabase SQL Editor!');
  } else {
    console.log('✅ Chats table exists');
    console.log('Found', chats?.length || 0, 'chats');
  }
  
  // Test 2: Try to create a test chat
  const testSessionId = 'test_' + Date.now();
  const { data: newChat, error: createError } = await supabase
    .from('chats')
    .insert([{
      session_id: testSessionId,
      title: 'Test Chat',
      country: 'ZA',
      currency: 'ZAR'
    }])
    .select()
    .single();
  
  if (createError) {
    console.error('❌ Create chat error:', createError.message);
  } else {
    console.log('✅ Successfully created test chat:', newChat.id);
    
    // Test 3: Try to update the chat
    const { data: updated, error: updateError } = await supabase
      .from('chats')
      .update({ title: 'Updated Test Chat' })
      .eq('id', newChat.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('❌ Update chat error:', updateError.message);
    } else {
      console.log('✅ Successfully updated chat title to:', updated.title);
    }
    
    // Clean up
    await supabase.from('chats').delete().eq('id', newChat.id);
    console.log('✅ Test completed and cleaned up');
  }
}

testConnection().catch(console.error);

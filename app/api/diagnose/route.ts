import { NextRequest, NextResponse } from 'next/server';
import { getDiagnostic } from '@/app/lib/bedrock';
import { supabase } from '@/app/lib/supabase';

// Detect user's country and currency from request
function detectLocation(request: NextRequest) {
  // Try to get country from Vercel/Cloudflare headers
  const country = request.headers.get('x-vercel-ip-country') || 
                  request.headers.get('cf-ipcountry') ||
                  'ZA'; // Default to South Africa
  
  // Map country to currency
  const currencyMap: Record<string, string> = {
    'ZA': 'ZAR',
    'US': 'USD',
    'GB': 'GBP',
    'EU': 'EUR',
    'AU': 'AUD',
    'CA': 'CAD',
  };
  
  const currency = currencyMap[country] || 'ZAR';
  
  return { country, currency };
}

export async function POST(request: NextRequest) {
  try {
    const { message, vehicle, history, mode, chatId, sessionId } = await request.json();
    
    // Detect user location
    const { country, currency } = detectLocation(request);
    
    // Call Bedrock for AI diagnosis with location context
    const result = await getDiagnostic({
      message,
      vehicle: vehicle || { year: "", make: "", model: "" },
      history: history || [],
      mode: mode || "casual",
      country,
      currency
    });
    
    // Save to Supabase if we have a session
    if (sessionId) {
      try {
        let currentChatId = chatId;
        
        // Create chat if it doesn't exist
        if (!currentChatId) {
          const { data: newChat, error: chatError } = await supabase
            .from('chats')
            .insert([{
              session_id: sessionId,
              title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
              country,
              currency
            }])
            .select()
            .single();
          
          if (newChat) {
            currentChatId = newChat.id;
          }
        }
        
        // Save user message
        if (currentChatId) {
          await supabase.from('messages').insert([{
            chat_id: currentChatId,
            role: 'user',
            content: message
          }]);
          
          // Save AI response
          await supabase.from('messages').insert([{
            chat_id: currentChatId,
            role: 'assistant',
            content: result.response,
            metadata: { diagnostic: result.diagnostic }
          }]);
        }
        
        // Deduct credits
        console.log('Attempting to deduct credits for session:', sessionId);
        const { data: creditResult, error: creditError } = await supabase
          .rpc('deduct_credits', {
            p_session_id: sessionId,
            p_amount: mode === 'mechanic' ? 2 : 1,
            p_description: `${mode === 'mechanic' ? 'Mechanic' : 'Casual'} mode message`
          })
          .single();
        
        if (creditError) {
          console.error('Credit deduction error:', creditError);
        }
        
        if (creditResult) {
          console.log('Credits deducted. New balance:', (creditResult as any).balance);
          result.credits = (creditResult as any).balance;
        } else {
          console.log('No credit result returned');
        }
      } catch (dbError) {
        console.error('Supabase error:', dbError);
        // Continue even if database save fails
      }
    }
    
    // Fetch image for the detected part
    let partImage = '/parts/placeholder.jpg';
    try {
      const imageResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/images?part=${result.diagnostic.component.toLowerCase()}`
      );
      if (imageResponse.ok) {
        const imageData = await imageResponse.json();
        partImage = imageData.imageUrl;
      }
    } catch (error) {
      console.error('Image fetch error:', error);
    }
    
    result.diagnostic.partImage = partImage;
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Diagnosis error:', error);
    return NextResponse.json(
      { error: 'Failed to process diagnosis' },
      { status: 500 }
    );
  }
}

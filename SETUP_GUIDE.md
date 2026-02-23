# Setup Guide - Chat Persistence Fix

## What Was Fixed

The chat rename issue has been resolved. Previously, chats were only created in localStorage but not in Supabase, so when you renamed a chat, the PATCH request failed because the chat didn't exist in the database.

## Changes Made

1. **Added POST endpoint** to `/app/api/chats/route.ts` for creating new chats
2. **Updated `handleNewChat`** to create chats in Supabase immediately and use the Supabase-generated UUID
3. **Updated `handleDeleteChat`** to delete from both Supabase and localStorage
4. **Fixed Supabase client** to use service role key (bypasses RLS for session-based auth)

## What You Need to Do

### Step 1: Run the SQL Schema

You need to run the SQL schema in your Supabase project to create the database tables:

1. Go to: https://rvykzspgrxulqovvgsdx.supabase.co
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Open the file `SUPABASE_SCHEMA.sql` in this project
5. Copy ALL the contents
6. Paste into the Supabase SQL Editor
7. Click "Run" or press Ctrl+Enter

This will create:
- `chats` table (stores chat conversations)
- `messages` table (stores individual messages)
- `user_credits` table (tracks user credits)
- `credit_transactions` table (logs credit usage)
- All necessary indexes and RLS policies
- The `deduct_credits()` function

### Step 2: Test the Fix

1. Start the dev server: `npm run dev`
2. Go to http://localhost:3000
3. Click "Login" (fake login, redirects immediately)
4. Click "New Chat"
5. Send a message
6. Hover over the chat in the sidebar and click the pencil icon (✎)
7. Rename the chat to something like "Test Chat"
8. Refresh the page (F5)
9. The renamed chat should still show "Test Chat" ✅

## How It Works Now

1. When you click "New Chat", it:
   - Creates the chat in Supabase first
   - Gets the UUID from Supabase
   - Saves to localStorage with the same UUID
   - Sets it as the current chat

2. When you rename a chat, it:
   - Updates localStorage immediately
   - Sends PATCH request to Supabase
   - Chat persists after refresh

3. When you delete a chat, it:
   - Removes from localStorage
   - Sends DELETE request to Supabase
   - Cleans up both storage locations

## Troubleshooting

If chats still don't persist after refresh:

1. Check browser console for errors
2. Verify the SQL schema was run successfully in Supabase
3. Check that `.env.local` has the correct Supabase credentials
4. Make sure `SUPABASE_SERVICE_ROLE_KEY` is set (it is in your `.env.local`)

## Credits System

The credits are also tracked in Supabase:
- Each session starts with 50 credits
- Casual mode: 1 credit per message
- Mechanic mode: 2 credits per message
- Credits are deducted via the `deduct_credits()` SQL function
- Balance is returned and displayed in the UI

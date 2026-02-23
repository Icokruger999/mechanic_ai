# Mechanic AI Frontend

Your intelligent mechanic assistant powered by AI.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up Supabase Database:
   - Go to your Supabase project: https://rvykzspgrxulqovvgsdx.supabase.co
   - Open the SQL Editor
   - Copy and paste the contents of `SUPABASE_SCHEMA.sql`
   - Run the SQL script to create all tables, indexes, and functions

3. Add your background image:
   - Place your istock photo as `public/background.jpg`

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

All environment variables are already configured in `.env.local`:
- AWS Bedrock credentials (working)
- Supabase credentials (configured)
- Resend API key (for emails)

## Features

- Chat persistence with Supabase
- Real-time diagnostics with AWS Bedrock
- Credit system
- Professional print/email reports
- Location-based currency detection
- Resizable sidebar
- Dark theme optimized

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Regular CSS (no Tailwind)
- Supabase (PostgreSQL)
- AWS Bedrock (Claude 3.5 Sonnet)
- Resend (Email API)

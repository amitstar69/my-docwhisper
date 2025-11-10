# my-docwhisper# DocWhisper

A no-code RAG app for chatting with documents using Gemini File Search + Supabase.

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/amitstar69/my-docwhisper)

1. Deploy to Vercel (button above).
2. Set env vars in Vercel: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, GEMINI_API_KEY.
3. In Supabase: Run the SQL schema, create 'uploads' bucket.
4. Deploy Edge Functions: supabase functions deploy upload-to-gemini && supabase functions deploy query-bot

## Usage
- Sign up
- Upload doc at /dashboard/new
- Chat at /dashboard/bots/[id]

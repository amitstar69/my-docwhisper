// @ts-nocheck

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.17.0";

const genAI = new GoogleGenerativeAI(Deno.env.get("GEMINI_API_KEY")!);
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  const authHeader = req.headers.get("Authorization")!;
  const token = authHeader.replace("Bearer ", "");
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { query, storeName, metadataFilter } = await req.json();

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: query }] }],
    tools: [{
      fileSearch: {
        fileSearchStoreNames: [storeName],
        metadataFilter
      }
    }]
  });

  const response = result.candidates![0];
  return new Response(JSON.stringify({
    text: response.content.parts[0].text,
    citations: response.groundingMetadata || []
  }));
});

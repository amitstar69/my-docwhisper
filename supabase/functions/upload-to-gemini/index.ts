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

  const form = await req.formData();
  const file = form.get("file") as File;
  const template = (form.get("template") as string) || "default";
  const metadata = JSON.parse(form.get("metadata") as string || "[]");

  // Save to storage
  const filePath = `${user.id}/${crypto.randomUUID()}-${file.name}`;
  await supabase.storage.from("uploads").upload(filePath, file);

  // Create store
  const store = await genAI.fileSearchStores.create({
    displayName: `DocWhisper - ${user.id} - ${file.name}`
  });

  // Chunk config
  const chunkConfig = template?.toLowerCase() === "hr" ? {
    whiteSpaceConfig: { maxTokensPerChunk: 300, maxOverlapTokens: 50 }
  } : undefined;

  const arrayBuffer = await file.arrayBuffer();
  const operation = await genAI.fileSearchStores.uploadToFileSearchStore({
    file: {
      name: file.name,
      mimeType: file.type,
      data: new Uint8Array(arrayBuffer)
    },
    fileSearchStoreName: store.name,
    config: { displayName: file.name, chunkingConfig, customMetadata: metadata }
  });

  // Poll
  let op = operation;
  while (!op.done) {
    await new Promise(r => setTimeout(r, 5000));
    op = await genAI.operations.get(op.name!);
  }

  // Save to DB
  const { data: botData, error: botError } = await supabase
    .from("bots")
    .insert({
      user_id: user.id,
      store_name: store.name,
      display_name: file.name,
      template,
      metadata
    })
    .select("id")
    .single();

  if (botError || !botData) {
    console.error("Failed to insert bot", botError);
    return new Response("Failed to create bot", { status: 500 });
  }

  return new Response(
    JSON.stringify({
      success: true,
      botId: botData.id,
      storeName: store.name,
      status: "indexed"
    }),
    { headers: { "Content-Type": "application/json" } }
  );
});

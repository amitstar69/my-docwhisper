'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

type Props = { id: string };

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function BotChatClient({ id }: Props) {
  const [messages, setMessages] = useState<{ user: string; ai: string; citations: any[] }[]>([]);
  const [input, setInput] = useState('');
  const [storeName, setStoreName] = useState('');

  useEffect(() => {
    const fetchBot = async () => {
      const { data } = await supabase.from('bots').select('store_name').eq('id', id).single();
      if (data) setStoreName(data.store_name);
    };
    fetchBot();
  }, [id]);

  const sendQuery = async () => {
    if (!input || !storeName) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/query-bot`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: input, storeName, metadataFilter: '' })
    });
    const data = await res.json();
    setMessages(prev => [...prev, { user: input, ai: data.text, citations: data.citations }]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-screen p-4">
      <div className="flex-1 overflow-y-auto space-y-4">
        {messages.map((m, i) => (
          <div key={i} className="space-y-2">
            <p className="font-bold">You: {m.user}</p>
            <p>AI: {m.ai}</p>
            {m.citations.length > 0 && (
              <div className="text-sm text-blue-600">
                Sources: {m.citations.map((c: any, j: number) => (
                  <span key={j}>[{c.fileName || 'doc'}]</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex space-x-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendQuery()}
          className="flex-1 p-2 border rounded"
          placeholder="Ask about your doc..."
        />
        <button onClick={sendQuery} className="bg-blue-600 text-white px-4 py-2 rounded">
          Send
        </button>
      </div>
    </div>
  );
}

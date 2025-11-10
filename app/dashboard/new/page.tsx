'use client';

import { createClient } from '@supabase/supabase-js';
import { useState } from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function NewBot() {
  const [file, setFile] = useState<File | null>(null);
  const [template, setTemplate] = useState('default');
  const [status, setStatus] = useState('');

  const handleUpload = async () => {
    if (!file) return;
    setStatus('Uploading...');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setStatus('Please sign in first');
      return;
    }

    const form = new FormData();
    form.append('file', file);
    form.append('template', template);
    form.append('metadata', JSON.stringify([{ key: 'template', stringValue: template }]));

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/upload-to-gemini`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: form
      }
    );
    const data = await res.json();
    setStatus(`Indexed! Store: ${data.storeName}`);
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create New Bot</h1>
      <input type="file" onChange={e => setFile(e.target.files?.[0] ?? null)} className="block w-full mb-4" />
      <select value={template} onChange={e => setTemplate(e.target.value)} className="block w-full mb-4 p-2 border">
        <option value="default">General</option>
        <option value="HR">HR Policies</option>
        <option value="sales">Sales Catalog</option>
      </select>
      <button onClick={handleUpload} className="bg-blue-600 text-white px-4 py-2 rounded w-full">
        Upload & Index
      </button>
      <p className="mt-4 text-center">{status}</p>
    </div>
  );
}

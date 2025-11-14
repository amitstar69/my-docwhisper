'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { FormEvent, useMemo, useState } from 'react';

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB upload cap for Gemini ingest
const BOT_SUCCESS_MESSAGE = 'Bot created successfully!';
const templates = [
  {
    value: 'default',
    label: 'General purpose',
    description: 'Company wikis, mixed PDF decks, anything broad.',
  },
  {
    value: 'hr',
    label: 'HR policies',
    description: 'Benefits guides, PTO policy, onboarding manuals.',
  },
  {
    value: 'sales',
    label: 'Sales collateral',
    description: 'Pricing sheets, playbooks, competitive intel.',
  },
];

type UploadPhase = 'idle' | 'validating' | 'uploading' | 'indexing' | 'success' | 'error';

export default function NewBot() {
  const supabase = useMemo(() => createClientComponentClient(), []);
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [template, setTemplate] = useState(templates[0].value);
  const [botName, setBotName] = useState('');
  const [phase, setPhase] = useState<UploadPhase>('idle');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resetFeedback = () => {
    setError(null);
    setSuccessMessage(null);
    setStatusMessage(null);
    setPhase('idle');
  };

  const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetFeedback();

    if (!file) {
      setError('Select a document to upload.');
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError('Please choose a file smaller than 25MB.');
      return;
    }

    if (!botName.trim()) {
      setError('Name your bot so teammates can find it later.');
      return;
    }

    setPhase('validating');
    setStatusMessage('Validating session…');
    setSuccessMessage(null);

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      setPhase('error');
      setError('Session expired. Please sign in again.');
      return;
    }

    setPhase('uploading');
    setStatusMessage('Uploading document to Supabase storage…');

    const metadata = [
      { key: 'template', stringValue: template },
      { key: 'owner_id', stringValue: session.user.id },
      { key: 'bot_name', stringValue: botName.trim() },
    ];

    const payload = new FormData();
    payload.append('file', file);
    payload.append('template', template);
    payload.append('metadata', JSON.stringify(metadata));

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/upload-to-gemini`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: payload,
        },
      );

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(errorBody || 'Upload failed');
      }

      setPhase('indexing');
      setStatusMessage('Indexing with Gemini File Search…');

      const rawBody = await response.text();
      let data: { success?: boolean; botId?: string | number; storeName?: string; status?: string } | null = null;

      try {
        data = rawBody ? JSON.parse(rawBody) : null;
      } catch (parseError) {
        throw new Error(rawBody || 'Upload completed but returned an unreadable response');
      }

      if (!data?.success) {
        throw new Error('Upload finished but did not return success.');
      }

      setStatusMessage(null);
      setPhase('success');
      setSuccessMessage(BOT_SUCCESS_MESSAGE);
      setFile(null);
      if (data.botId) {
        router.push(`/dashboard/bots/${data.botId}`);
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setStatusMessage(null);
      setSuccessMessage(null);
      setPhase('error');
      setError(err instanceof Error ? err.message : 'Unexpected error while uploading');
    }
  };

  const isBusy = ['validating', 'uploading', 'indexing'].includes(phase);

  return (
    <div className="mx-auto w-full max-w-2xl p-8">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-500">New bot</p>
        <h1 className="text-3xl font-bold">Upload a document</h1>
        <p className="text-base text-slate-500">
          DocWhisper will chunk, embed, and tag your document so you can chat with it instantly. We keep uploads scoped to
          the signed-in owner via Supabase storage policies.
        </p>
      </div>

      <form onSubmit={handleUpload} className="mt-8 space-y-6" noValidate>
        <div className="space-y-2">
          <label htmlFor="bot-name" className="text-sm font-medium text-slate-700">
            Bot name
          </label>
          <input
            id="bot-name"
            type="text"
            value={botName}
            onChange={(event) => {
              resetFeedback();
              setBotName(event.target.value);
            }}
            placeholder="e.g. HR Buddy"
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-base shadow-sm focus:border-blue-500 focus:outline-none"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Document</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt,.md"
            onChange={(event) => {
              resetFeedback();
              setFile(event.target.files?.[0] ?? null);
            }}
            className="w-full cursor-pointer rounded-md border border-dashed border-slate-300 bg-white px-3 py-6 text-sm text-slate-600 shadow-sm"
          />
          <p className="text-xs text-slate-500">PDF, Word, or text up to 25MB.</p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-700">Template</p>
          <div className="grid gap-3 md:grid-cols-3">
            {templates.map((item) => (
              <label
                key={item.value}
                className={`flex cursor-pointer flex-col rounded-md border p-3 text-sm shadow-sm transition focus-within:ring-2 ${
                  template === item.value ? 'border-blue-600 ring-2 ring-blue-200' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="template"
                  value={item.value}
                  className="sr-only"
                  checked={template === item.value}
                  onChange={(event) => {
                    resetFeedback();
                    setTemplate(event.target.value);
                  }}
                />
                <span className="font-semibold text-slate-900">{item.label}</span>
                <span className="text-xs text-slate-500">{item.description}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2" aria-live="polite">
          {error && <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}
          {statusMessage && !error && (
            <p className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-600">
              {statusMessage}
            </p>
          )}
          {successMessage && !error && (
            <p className="rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-600">
              {successMessage}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="inline-flex flex-1 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-base font-medium text-white shadow hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isBusy}
          >
            {isBusy ? 'Uploading…' : 'Upload & index'}
          </button>
          <button
            type="button"
            className="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:border-slate-300"
            onClick={() => {
              setFile(null);
              setTemplate(templates[0].value);
              setBotName('');
              setStatusMessage(null);
              setSuccessMessage(null);
              setError(null);
              setPhase('idle');
            }}
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}

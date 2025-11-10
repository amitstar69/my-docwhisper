import Client from './Client';

// Do NOT add 'use client' in this file.

// 1. Use the correct types for props (no more 'any')
// 2. Destructure 'params' directly
export default async function Page({ params }: { params: { id: string } }) {
  
  // 3. Get 'id' directly from 'params' (no 'await', no 'props.')
  const { id } = params;

  return <Client id={id} />;
}

import Client from './Client';

// Do NOT add 'use client' in this file.
export default async function Page(props: any) {
  const { id } = await (props as any).params;
  return <Client id={id} />;
}

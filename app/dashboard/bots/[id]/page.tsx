import Client from './Client';

export default async function Page(props: any) {
  const { id } = await (props as any).params;
  return <Client id={id} />;
}

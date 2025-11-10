import Client from './Client';

export default async function Page({ params }: any) {
  const { id } = await params; // works if params is a plain object or a Promise
  return <Client id={id} />;
}

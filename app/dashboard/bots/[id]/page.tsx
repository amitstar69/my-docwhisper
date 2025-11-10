// BUILD MARKER: v10
// @ts-nocheck
import Client from './Client';

export default async function Page(props) {
  const p = await (props?.params ?? {});
  const id = p?.id ?? '';
  return <Client id={id} />;
}

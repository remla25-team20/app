import { VersionUtil } from "@remla25-team20/lib-version";
import ClientPage from "./client-page";

export default function Home() {
  const libVersion = VersionUtil.getVersion();
  return <ClientPage libVersion={libVersion} />;
}

import { VersionUtil } from "@remla25-team20/lib-version";
import ClientPage from "./client-page";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const versionCookie = req.cookies["version"];

  if (!versionCookie || versionCookie !== process.env.NEXT_PUBLIC_APP_VERSION) {
    const version = process.env.NEXT_PUBLIC_APP_VERSION;
    const existingCookies = res.getHeader("Set-Cookie");
    const newCookie = `version=${version}; Path=/; Max-Age=3600; HttpOnly; SameSite=Lax`;
    const cookies = [].concat(existingCookies || []).concat(newCookie);

    res.setHeader("Set-Cookie", cookies);
  }

  return {
    props: {},
  };
};

export default function Home() {
  const libVersion = VersionUtil.getVersion();
  return <ClientPage libVersion={libVersion} />;
}

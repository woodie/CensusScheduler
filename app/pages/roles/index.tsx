import Head from "next/head";
import { useContext } from "react";

import { Roles } from "src/components/roles";
import { SignIn } from "src/components/sign-in";
import { DeveloperModeContext } from "src/state/developer-mode/context";
import { SessionContext } from "src/state/session/context";
import { authenticatedCheck } from "src/utils/authenticatedCheck";
import { coreCrewCheck } from "src/utils/coreCrewCheck";

const RolesPage = () => {
  const {
    developerModeState: { accountType },
  } = useContext(DeveloperModeContext);
  const {
    sessionState: {
      settings: { isAuthenticated: isAuthenticatedSession },
      user: { roleList },
    },
  } = useContext(SessionContext);
  const isAuthenticated = authenticatedCheck(
    accountType,
    isAuthenticatedSession
  );
  const isCoreCrew = coreCrewCheck(accountType, roleList);

  return (
    <>
      <Head>
        <title>Census | Roles</title>
        <meta name="description" content="" />
        <link rel="icon" href="/general/favicon.ico" />
      </Head>
      {isAuthenticated && isCoreCrew ? <Roles /> : <SignIn />}
    </>
  );
};

export default RolesPage;

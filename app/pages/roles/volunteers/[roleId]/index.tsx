import Head from "next/head";
import { useRouter } from "next/router";
import { useContext } from "react";

import { RoleVolunteers } from "src/components/roles/volunteers";
import { SignIn } from "src/components/sign-in";
import { DeveloperModeContext } from "src/state/developer-mode/context";
import { SessionContext } from "src/state/session/context";
import { checkIsAdmin, checkIsAuthenticated } from "src/utils/checkIsRoleExist";

const RoleVolunteersPage = () => {
  // context
  // --------------------
  const {
    developerModeState: { accountType },
  } = useContext(DeveloperModeContext);
  const {
    sessionState: {
      settings: { isAuthenticated: isAuthenticatedSession },
      user: { roleList, shiftboardId },
    },
  } = useContext(SessionContext);

  // other hooks
  // --------------------
  const router = useRouter();

  // logic
  // --------------------
  const isAuthenticated = checkIsAuthenticated(
    accountType,
    isAuthenticatedSession
  );
  const isAdmin = checkIsAdmin(accountType, roleList);

  // render
  // --------------------
  let body;

  if (isAuthenticated && isAdmin) {
    body = <RoleVolunteers />;
  } else if (isAuthenticated) {
    router.push(`/volunteers/account/${shiftboardId}`);
  } else {
    body = <SignIn />;
  }

  return (
    <>
      <Head>
        <title>Census | Role</title>
        <meta name="description" content="" />
        <link rel="icon" href="/general/favicon.ico" />
      </Head>
      {body}
    </>
  );
};

export default RoleVolunteersPage;

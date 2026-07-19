"use client";

import { AccountShell } from "@/components/website/account/AccountShell";
import { useUserAuth } from "@/services/website/useUserAuth";

export default function AccountProfilePage() {
  const { user } = useUserAuth();

  return (
    <AccountShell title="Profile">
      <div className="thankyou-panel">
        <h2>Account details</h2>
        <p>
          <strong>{user?.name}</strong>
          {user?.phone ? (
            <>
              <br />
              {user.phone}
            </>
          ) : null}
          {user?.email ? (
            <>
              <br />
              {user.email}
            </>
          ) : null}
        </p>
      </div>
    </AccountShell>
  );
}

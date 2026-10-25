"use client";

import LogInForm from "@/components/auth/LogInForm";
import AuthBrandPanel from "@/components/auth/AuthBrandPanel";

/** Website auth UI — modal only (login + signup share the same OTP flow). */
const LogIn = () => {
  return (
    <div className="auth_container">
      <AuthBrandPanel />
      <div className="formBx auth-form-panel">
        <LogInForm />
      </div>
    </div>
  );
};

export default LogIn;

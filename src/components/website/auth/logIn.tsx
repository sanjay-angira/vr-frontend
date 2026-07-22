"use client";

import LogInForm from "@/components/website/auth/LogInForm";
import AuthBrandPanel from "@/components/website/auth/AuthBrandPanel";

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

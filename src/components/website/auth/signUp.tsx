"use client";

import SignUpForm from "@/components/website/auth/SignUpForm";
import AuthBrandPanel from "@/components/website/auth/AuthBrandPanel";
import { useRouter } from "next/navigation";

const SignUp = () => {
  const router = useRouter();

  const handleLoginClick = () => {
    router.push("/login");
  };

  return (
    <div className="auth_container">
      <AuthBrandPanel variant="signup" />
      <div className="formBx auth-form-panel">
        <SignUpForm onLogin={handleLoginClick} />
      </div>
    </div>
  );
};

export default SignUp;

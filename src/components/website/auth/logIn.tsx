"use client";

import LogInForm from "@/components/website/auth/LogInForm";
import AuthBrandPanel from "@/components/website/auth/AuthBrandPanel";
import { useDispatch, useSelector } from "react-redux";
import { setAuthModalOpen } from "@/services/redux/slices/websiteSlices/modalSlice";
import { RootState } from "@/services/redux/index";
import { useRouter, usePathname } from "next/navigation";
import { isAuthPagePath } from "@/utils/authRoutes";

const LogIn = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathName = usePathname();
  const toggleModalState = useSelector(
    (state: RootState) => state.modal.toggleModal,
  );
  const onAuthPage = isAuthPagePath(pathName);

  if (!toggleModalState && pathName !== "/login") {
    return null;
  }

  const handleSignUpClick = () => {
    if (!onAuthPage) {
      dispatch(setAuthModalOpen(false));
    }
    router.push("/signup");
  };

  return (
    <div className="auth_container">
      <AuthBrandPanel />
      <div className="formBx auth-form-panel">
        <LogInForm onCreateAccount={handleSignUpClick} />
      </div>
    </div>
  );
};

export default LogIn;

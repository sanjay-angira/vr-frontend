"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/services/redux/index";
import {
  setAuthModalOpen,
  toggleModal,
} from "@/services/redux/slices/websiteSlices/modalSlice";
import { isAuthPagePath } from "@/utils/authRoutes";
import LogIn from "./logIn";

const AuthModals = () => {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const isOpen = useSelector((state: RootState) => state.modal.toggleModal);
  const onAuthPage = isAuthPagePath(pathname);

  useEffect(() => {
    if (onAuthPage && isOpen) {
      dispatch(setAuthModalOpen(false));
    }
  }, [dispatch, isOpen, onAuthPage]);

  if (!isOpen || onAuthPage) {
    return null;
  }

  return (
    <section id="reg_login">
      <div className="scale-in auth-modal-shell">
        <button
          type="button"
          className="auth-modal-close"
          onClick={() => dispatch(toggleModal())}
          aria-label="Close modal"
        >
          &times;
        </button>
        <LogIn />
      </div>
    </section>
  );
};

export default AuthModals;

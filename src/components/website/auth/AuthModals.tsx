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
      <div className="scale-in" style={{ position: "relative" }}>
        <button
          type="button"
          onClick={() => dispatch(toggleModal())}
          style={{
            position: "absolute",
            top: 30,
            right: 10,
            background: "transparent",
            border: "none",
            fontSize: "2rem",
            color: "oklch(0.281291 0.064316 44.611289)",
            cursor: "pointer",
            zIndex: 10,
          }}
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

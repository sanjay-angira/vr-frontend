"use client";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/services/redux/index";
import { toggleModal } from "@/services/redux/slices/websiteSlices/modalSlice";
import LogIn from "./logIn";

const AuthModals = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector((state: RootState) => state.modal.toggleModal);

  if (!isOpen) {
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

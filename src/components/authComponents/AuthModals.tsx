"use client"
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/services/redux/store";
import { toggleModal } from "@/services/redux/slices/modalSlice";
import LogIn from "./logIn"

const AuthModals = () => {
    const dispatch = useDispatch();
    const toggleModalState = useSelector((state: RootState) => state.modal.toggleModal);

    if (!toggleModalState) {
        return null;
    }
    return (
        <>
            <section id="reg_login">
                <div className="scale-in" style={{ position: 'relative' }}>
                    <button
                        onClick={() => dispatch(toggleModal())}
                        style={{
                            position: 'absolute',
                            top: 30,
                            right: 10,
                            background: 'transparent',
                            border: 'none',
                            fontSize: '2rem',
                            color: 'oklch(0.281291 0.064316 44.611289)',
                            cursor: 'pointer',
                            zIndex: 10
                        }}
                        aria-label="Close modal"
                    >
                        &times;
                    </button>
                    <LogIn />
                </div>
            </section>
        </>
    )
}

export default AuthModals;
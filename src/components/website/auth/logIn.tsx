"use client";
import LogInForm from "@/components/website/auth/LogInForm"
import { useDispatch } from "react-redux"
import { useSelector } from "react-redux"
import { setAuthModalOpen } from "@/services/redux/slices/websiteSlices/modalSlice";
import { RootState } from "@/services/redux/index";
import { useRouter, usePathname } from "next/navigation";
import { ButtonLink } from "@/components/website/auth/buttons";
import { isAuthPagePath } from "@/utils/authRoutes";

const LogIn = () => {

    const dispatch = useDispatch();
    const router = useRouter();
    const pathName = usePathname()
    const toggleModalState = useSelector((state: RootState) => state.modal.toggleModal);
    const onAuthPage = isAuthPagePath(pathName);

    if (!toggleModalState && pathName !== "/login") {
        return null;
    }

    const handleSignUpClick = () => {
        if (!onAuthPage) {
            dispatch(setAuthModalOpen(false));
        }
        router.push("/signup");
    }

    return (
        <div className="auth_container">
            <div className="imgBx" style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-start',
                padding: '40px',
                backgroundColor: '#fdfdfd',
                borderRight: '1px solid #eee'
            }}>
                <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--brown)', marginBottom: '16px', lineHeight: '1.2' }}>Login In to your account</h2>
                <p style={{ fontSize: '16px', color: '#666', lineHeight: '1.5', fontWeight: '500' }}>Get access to your Orders, Wishlist and Recommendations.</p>
            </div>
            <div className="formBx flex items-center flex-col justify-between ">
                <LogInForm />
                <ButtonLink
                    text="New to Spice? Create an account"
                    onClick={handleSignUpClick}
                />
            </div>
        </div>
    )
}


export default LogIn
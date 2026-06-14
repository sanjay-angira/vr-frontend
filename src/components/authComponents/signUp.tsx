'use client'
import SignUpForm from "./SignUpForm"
import { SecondryButton } from "../commonComponents/buttons"
import { useRouter } from "next/navigation"


const SignUp = () => {
    const router = useRouter()
    const routeToHomePage = () => {
        router.push("/login")
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
                <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--brown)', marginBottom: '16px', lineHeight: '1.2' }}>Looks like you're new here!</h2>
                <p style={{ fontSize: '16px', color: '#666', lineHeight: '1.5', fontWeight: '500' }}>Sign up with your mobile number to get started.</p>
            </div>
            <div className="formBx">
                <SignUpForm />
                <SecondryButton
                    onClick={routeToHomePage}
                    type="button"
                    text="Existing User? Log in"
                />
            </div>
        </div>
    )
}

export default SignUp
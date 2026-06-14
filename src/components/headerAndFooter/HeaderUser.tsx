"use client"

import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../services/redux/store";
import { useRouter, usePathname } from "next/navigation";
import { postData } from "../../services/api/apiService";
import { API_ENDPOINTS } from "../../services/api/API_ENDPOINT";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { User } from "lucide-react";
import Link from "next/link";
import { AppDispatch } from '@/services/redux/store';
import { toggleModal, toggleCartDrawer } from '@/services/redux/slices/modalSlice';
import { clearUser } from '@/services/redux/slices/userSlice';


const HeaderUser = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const user = useSelector((state: RootState) => state.user.user);
    const cartCount = useSelector((state: RootState) => state.cart.count);
    const dispatch = useDispatch<AppDispatch>();
    const isLoggedIn = Boolean(user && user.id);
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const router = useRouter();
    const pathName = usePathname()

    const handleLogout = () => {
        dispatch(clearUser());
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        setShowDropdown(false);
        router.push('/')
    };

    const handleLoginClick = () => {
        if (pathName === "/login" || pathName === "/signup") return;
        dispatch(toggleModal())
    }

    return (
        <div>
            {isLoggedIn ? (
                <div className="profile-dropdown" ref={dropdownRef}>
                    <button
                        className="main-nav-link profile-btn"
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
                        Profile
                    </button>
                    {showDropdown && (
                        <div className="dropdown-menu">
                            <Link href="/profile" className="dropdown-item">My Profile</Link>
                            <button onClick={handleLogout} className="dropdown-item logout-btn">
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <>
                    <button className="icon-button" onClick={handleLoginClick}><User size={20} /></button>
                </>
            )}


        </div>
    )
}

export default HeaderUser
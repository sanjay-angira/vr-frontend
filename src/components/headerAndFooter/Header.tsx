'use client'
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ShoppingCart, User, Search, Menu } from "lucide-react";
import { useIsMobile } from '@/hooks/use-mobile';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '@/services/redux/store';
import Link from 'next/link';
import { toggleModal, toggleCartDrawer } from '@/services/redux/slices/modalSlice';
import { clearUser } from '@/services/redux/slices/userSlice';
import { fetchCart } from '@/services/redux/slices/cartSlice';
import { AppDispatch } from '@/services/redux/store';
import Cookies from 'js-cookie';
import HeaderCart from './HeaderCart';
import HeaderUser from './HeaderUser';

const Header = () => {
  const user = useSelector((state: RootState) => state.user.user);
  const cartCount = useSelector((state: RootState) => state.cart.count);
  const dispatch = useDispatch<AppDispatch>();
  const isLoggedIn = Boolean(user && user.id);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showExamsDropdown, setShowExamsDropdown] = useState(false);
  const examsDropdownRef = useRef<HTMLDivElement>(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  // Fetch cart on component mount
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (examsDropdownRef.current && !examsDropdownRef.current.contains(event.target as Node)) {
        setShowExamsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    dispatch(clearUser());
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    setShowDropdown(false);
    router.push('/')
  };

  const categories = [
    {
      name: "Rudraksha",
      items: ["1 Mukhi", "5 Mukhi", "7 Mukhi", "Rudraksha Malas", "Rare Rudraksha"]
    },
    {
      name: "Sweets",
      items: ["Peda", "Mathura Peda", "Kheer", "Laddu", "Barfi"]
    },
    {
      name: "Malas",
      items: ["Tulsi Mala", "Crystal Mala", "Sandalwood Mala", "108 Beads Mala"]
    },
    {
      name: "Puja Items",
      items: ["Incense", "Diyas", "Puja Thali", "Sacred Books", "Yantra"]
    }
  ];

  return (
    <>
      <header className="header">
        <div className="container">
          <div className="header-content">
            {/* Logo */}
            <a href="/" className="logo">
              <div className="logo-icon">🕉</div>
              <span className="logo-text">Sacred Store</span>
            </a>

            {/* Desktop Navigation */}
            <nav className="nav">
              <button className="nav-button">Home</button>

              {categories.map((category) => (
                <div key={category.name} className="nav-item">
                  <button className="nav-button">
                    {category.name} <ChevronDown size={16} />
                  </button>
                  <div className="dropdown">
                    {category.items.map((item) => (
                      <a key={item} href="#" className="dropdown-item">
                        {item}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            {/* Header Actions */}
            <div className="header-actions">
              <button className="icon-button">
                <Search size={20} />
              </button>

              <HeaderCart />
              <HeaderUser />

              {/* <button
                className="icon-button"
                style={{ position: 'relative' }}
                onClick={() => dispatch(toggleCartDrawer())}
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: -6,
                      right: -6,
                      minWidth: 18,
                      height: 18,
                      borderRadius: '9999px',
                      background: '#ef4444',
                      color: '#ffffff',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      lineHeight: 1,
                      padding: '0 5px',
                    }}
                  >
                    {cartCount}
                  </span>
                )}
              </button> */}

              {/* <div>
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
                    <button className="icon-button" onClick={() => dispatch(toggleModal())}><User size={20} /></button>
                  </>
                )}

              </div> */}


              {/* Mobile Menu Button */}
              <button
                className="icon-button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                style={{ display: isMobile ? 'block' : 'none' }}
              >
                <Menu size={20} />
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="mobile-nav-panel">
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button className="nav-button">
                  Home
                </button>
                {categories.map((category) => (
                  <div key={category.name}>
                    <button className="nav-button is-category">
                      {category.name}
                    </button>
                    {category.items.map((item) => (
                      <button
                        key={item}
                        className="nav-button is-sub"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>

    </>
  );
};

export default Header;